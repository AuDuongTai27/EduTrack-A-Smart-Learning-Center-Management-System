using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface IUserRoleService
    {
        Task<IEnumerable<UserRoleDto>> GetAllUserRolesAsync();
        Task<UserRoleDto?> GetUserRoleByIdAsync(int id);
    }
}
