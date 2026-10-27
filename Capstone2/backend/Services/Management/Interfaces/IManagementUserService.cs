using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;

namespace EduTrack.API.Services.Management.Interfaces
{
    public interface IManagementUserService
    {
        Task<UserDto> CreateUserAsync(CreateUserDto dto);
        Task<UserDto?> UpdateUserAsync(int id, UpdateUserDto dto);
        Task<bool> UpdateStatusAsync(int id, string status);
        Task<bool> DeleteUserAsync(int id);
        Task<ParentStudentDto> AssignParentStudentAsync(AssignParentStudentDto dto);
        Task<bool> RemoveParentStudentAsync(int parentId, int studentId);
    }
}
