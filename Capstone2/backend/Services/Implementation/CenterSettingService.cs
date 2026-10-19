using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class CenterSettingService : ICenterSettingService
    {
        private readonly ICenterSettingRepository _repository;

        public CenterSettingService(ICenterSettingRepository repository)
        {
            _repository = repository;
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

        private static CenterSettingDto MapToDto(CenterSetting x)
        {
            return new CenterSettingDto
            {
                SettingId = x.SettingId,
                SettingKey = x.SettingKey,
                SettingValue = x.SettingValue,
                UpdatedBy = x.UpdatedBy,
                UpdaterName = x.Updater?.FullName
            };
        }
    }
}
