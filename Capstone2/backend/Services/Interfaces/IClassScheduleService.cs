using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface IClassScheduleService
    {
        Task<IEnumerable<ClassScheduleDto>> GetAllClassSchedulesAsync();
        Task<ClassScheduleDto?> GetClassScheduleByIdAsync(int id);
    }
}
