using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<UserDto> CreateUserAsync(CreateUserDto dto);
        Task<UserDto?> UpdateUserAsync(int id, UpdateUserDto dto);
        Task<bool> UpdateStatusAsync(int id, string status);
        Task<bool> DeleteUserAsync(int id);
    }
}

