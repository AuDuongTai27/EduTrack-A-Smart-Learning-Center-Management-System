using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Services.Implementation
{
    public class CenterSettingService : ICenterSettingService
    {
        private readonly ICenterSettingRepository _repository;
        private readonly EduTrackDbContext _context;

        // Only keys backed by fields in the Center Manager Settings screen may be updated here.
        private static readonly HashSet<string> AllowedKeys = new(StringComparer.OrdinalIgnoreCase)
        {
            "center_name", "center_hotline", "center_email", "center_address",
            "academic_year", "default_class_status", "operating_grades",
            "tuition_cycle", "tuition_due_day",
            "tuition_reminder_enabled", "absence_alert_enabled", "grade_notification_enabled"
        };

        public CenterSettingService(
            ICenterSettingRepository repository,
            EduTrackDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<IEnumerable<CenterSettingDto>> GetAllCenterSettingsAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<CenterSettingDto?> GetCenterSettingByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<IReadOnlyList<CenterSettingDto>> SaveSettingsAsync(
            IReadOnlyList<CenterSettingValueInputDto> changes)
        {
            if (changes == null || changes.Count == 0 || changes.Count > 20)
                throw new InvalidOperationException("Provide between 1 and 20 settings.");

            var keys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var sanitized = new List<(string Key, string? Value)>();
            foreach (var item in changes)
            {
                if (item == null)
                    throw new InvalidOperationException("Invalid setting entry.");
                var key = item.SettingKey?.Trim().ToLowerInvariant() ?? string.Empty;
                if (!AllowedKeys.Contains(key))
                    throw new InvalidOperationException($"Unsupported setting: {key}");
                if (!keys.Add(key))
                    throw new InvalidOperationException($"Duplicate setting: {key}");
                if (item.SettingValue?.Length > 1000)
                    throw new InvalidOperationException($"Setting value too long: {key}");

                var value = item.SettingValue?.Trim();
                if (key == "tuition_due_day" &&
                    (!int.TryParse(value, out var day) || day < 1 || day > 28))
                    throw new InvalidOperationException("Tuition due day must be between 1 and 28.");
                if (key == "tuition_cycle" && value is not ("Monthly" or "Quarterly"))
                    throw new InvalidOperationException("Invalid tuition cycle.");
                if (key == "default_class_status" && value is not ("active" or "inactive"))
                    throw new InvalidOperationException("Invalid class status.");
                if ((key == "tuition_reminder_enabled" || key == "absence_alert_enabled" ||
                     key == "grade_notification_enabled") && value is not ("true" or "false"))
                    throw new InvalidOperationException("Notification setting must be true or false.");

                sanitized.Add((key, value));
            }

            // Save one tab atomically: no partial success if MySQL rejects a write.
            await using var transaction = await _context.Database.BeginTransactionAsync();
            var existing = await _context.CenterSettings
                .Where(s => keys.Contains(s.SettingKey))
                .ToListAsync();

            var touched = new List<CenterSetting>();
            foreach (var (key, value) in sanitized)
            {
                var entity = existing.FirstOrDefault(s =>
                    string.Equals(s.SettingKey, key, StringComparison.OrdinalIgnoreCase));
                if (entity == null)
                {
                    entity = new CenterSetting { SettingKey = key };
                    _context.CenterSettings.Add(entity);
                }

                entity.SettingValue = value;
                // Authentication is not connected yet. Do not attribute writes to seed user #1.
                entity.UpdatedBy = null;
                touched.Add(entity);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return touched.Select(MapToDto).ToList();
        }

        private static CenterSettingDto MapToDto(CenterSetting x) => new()
        {
            SettingId = x.SettingId,
            SettingKey = x.SettingKey,
            SettingValue = x.SettingValue,
            UpdatedBy = x.UpdatedBy,
            UpdaterName = x.Updater?.FullName
        };
    }
}
