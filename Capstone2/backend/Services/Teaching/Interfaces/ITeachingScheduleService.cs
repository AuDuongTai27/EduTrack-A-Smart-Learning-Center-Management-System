using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs.Teaching;

namespace EduTrack.API.Services.Teaching.Interfaces
{
    public interface ITeachingScheduleService
    {
        Task<List<TeachingScheduleItemDto>> GetMyScheduleAsync(int userId);
    }
}

