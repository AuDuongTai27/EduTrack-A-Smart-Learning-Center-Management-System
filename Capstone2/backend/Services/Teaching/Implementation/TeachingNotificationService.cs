using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.DTOs.Teaching;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Services.Teaching.Interfaces;

namespace EduTrack.API.Services.Teaching.Implementation
{
    public class TeachingNotificationService : ITeachingNotificationService
    {
        private readonly EduTrackDbContext _context;

        public TeachingNotificationService(EduTrackDbContext context)
        {
            _context = context;
        }

        public async Task<List<TeachingNotificationDto>> GetNotificationsAsync(int userId, string? status = null)
        {
            var rows = await _context.Notifications.AsNoTracking().Include(n => n.Class).Include(n => n.Sender)
                .Include(n => n.Recipients.Where(r => r.UserId == userId))
                .Where(n => n.Recipients.Any(r => r.UserId == userId && r.DeletedAt == null))
                .OrderByDescending(n => n.CreatedAt).ThenByDescending(n => n.NotificationId).ToListAsync();
            return rows.Select(n => MapToDto(n, userId)).Where(n => status == "read" ? n.IsRead : status == "unread" ? !n.IsRead : true).ToList();
        }
        public async Task<bool> MarkAsReadAsync(int notificationId, int? userId = null)
        {
            if (!userId.HasValue) return false;
            var query = _context.NotificationRecipients.Where(r => r.NotificationId == notificationId && r.UserId == userId && r.DeletedAt == null);
            var now = DateTime.UtcNow;
            await query.Where(r => !r.IsRead).ExecuteUpdateAsync(s => s.SetProperty(r => r.IsRead, true).SetProperty(r => r.ReadAt, now));
            return await query.AnyAsync();
        }
        public Task<int> MarkAllAsReadAsync(int userId)
        {
            var now = DateTime.UtcNow;
            return _context.NotificationRecipients.Where(r => r.UserId == userId && r.DeletedAt == null && !r.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(r => r.IsRead, true).SetProperty(r => r.ReadAt, now));
        }

        private static TeachingNotificationDto MapToDto(Notification n, int? currentUserId = null)
        {
            bool isRead = false;
            if (currentUserId.HasValue)
            {
                var recipient = n.Recipients?.FirstOrDefault(r => r.UserId == currentUserId.Value);
                if (recipient != null)
                {
                    isRead = recipient.IsRead;
                }
                else if (n.UserId == currentUserId.Value)
                {
                    isRead = n.IsRead;
                }
                else
                {
                    isRead = false;
                }
            }
            else
            {
                isRead = n.IsRead;
            }

            string initials = n.Type switch
            {
                "leave" => "HC",
                "schedule" => "ĐT",
                "system" => "ET",
                _ => "ES"
            };

            string bgClass = n.Type switch
            {
                "leave" => "bg-warning-subtle",
                "schedule" => "bg-info-subtle",
                "system" => "bg-primary-subtle",
                _ => "bg-success-subtle"
            };

            string colorClass = n.Type switch
            {
                "leave" => "text-warning",
                "schedule" => "text-info",
                "system" => "text-primary",
                _ => "text-success"
            };

            return new TeachingNotificationDto
            {
                NotificationId = n.NotificationId,
                UserId = n.UserId,
                ClassId = n.ClassId,
                ClassName = n.Class?.ClassName,
                Title = n.Title,
                Content = n.Content,
                Sender = n.Sender?.FullName ?? "Unknown sender",
                Initials = initials,
                InitialsBgClass = bgClass,
                InitialsColorClass = colorClass,
                Type = n.Type ?? "system",
                IsNew = !isRead,
                IsRead = isRead,
                TimeAgo = FormatTimeAgo(n.CreatedAt),
                CreatedAt = DateTime.SpecifyKind(n.CreatedAt, DateTimeKind.Utc)
            };
        }

        private static string FormatTimeAgo(DateTime createdAt)
        {
            var diff = DateTime.UtcNow - createdAt;
            if (diff.TotalMinutes < 60)
            {
                int mins = Math.Max(1, (int)diff.TotalMinutes);
                return $"{mins} phút trước";
            }
            if (diff.TotalHours < 24)
            {
                return $"{(int)diff.TotalHours} giờ trước";
            }
            if (diff.TotalDays < 7)
            {
                return $"{(int)diff.TotalDays} ngày trước";
            }
            return createdAt.ToString("dd/MM/yyyy");
        }
    }
}
