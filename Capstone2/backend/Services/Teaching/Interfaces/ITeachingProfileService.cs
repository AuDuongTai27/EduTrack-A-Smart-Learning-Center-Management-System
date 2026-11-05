using System.Threading.Tasks;
using EduTrack.API.Models.DTOs.Teaching;

namespace EduTrack.API.Services.Teaching.Interfaces
{
    public interface ITeachingProfileService
    {
        Task<TeacherProfileDto?> GetProfileAsync(int userId);
        Task<TeacherProfileDto?> UpdateProfileAsync(int userId, UpdateTeacherProfileRequestDto request);
        Task<(bool Success, string Message)> ChangePasswordAsync(int userId, ChangePasswordRequestDto request);
    }
}
