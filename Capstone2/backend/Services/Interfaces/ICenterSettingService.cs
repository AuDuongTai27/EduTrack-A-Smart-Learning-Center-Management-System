using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface ICenterSettingService
    {
        Task<IEnumerable<CenterSettingDto>> GetAllCenterSettingsAsync();
        Task<CenterSettingDto?> GetCenterSettingByIdAsync(int id);
    }
}
