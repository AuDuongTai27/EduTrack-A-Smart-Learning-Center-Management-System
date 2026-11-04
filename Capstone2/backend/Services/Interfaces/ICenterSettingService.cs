using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;

namespace EduTrack.API.Services.Interfaces
{
    public interface ICenterSettingService
    {
        Task<IEnumerable<CenterSettingDto>> GetAllCenterSettingsAsync();
        Task<CenterSettingDto?> GetCenterSettingByIdAsync(int id);
        Task<IReadOnlyList<CenterSettingDto>> SaveSettingsAsync(
            IReadOnlyList<CenterSettingValueInputDto> changes);
    }
}
