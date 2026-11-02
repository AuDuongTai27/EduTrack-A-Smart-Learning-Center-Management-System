using System.Threading.Tasks;
using EduTrack.API.Models.DTOs.Teaching;

namespace EduTrack.API.Services.Teaching.Interfaces
{
    public interface ITeachingDashboardService
    {
        Task<TeachingDashboardDto?> GetDashboardAsync(int userId);
    }
}
