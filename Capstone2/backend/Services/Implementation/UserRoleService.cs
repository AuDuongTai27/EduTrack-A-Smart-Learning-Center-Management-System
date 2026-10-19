using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class UserRoleService : IUserRoleService
    {
        private readonly IUserRoleRepository _userRoleRepository;

        public UserRoleService(IUserRoleRepository userRoleRepository)
        {
            _userRoleRepository = userRoleRepository;
        }

        public async Task<IEnumerable<UserRoleDto>> GetAllUserRolesAsync()
        {
            var userRoles = await _userRoleRepository.GetAllAsync();
            return userRoles.Select(MapToDto);
        }

        public async Task<UserRoleDto?> GetUserRoleByIdAsync(int id)
        {
            var userRole = await _userRoleRepository.GetByIdAsync(id);
            return userRole == null ? null : MapToDto(userRole);
        }

        private static UserRoleDto MapToDto(UserRole ur)
        {
            return new UserRoleDto
            {
                UserRoleId = ur.UserRoleId,
                UserId = ur.UserId,
                UserCode = ur.User?.UserCode ?? string.Empty,
                FullName = ur.User?.FullName ?? string.Empty,
                RoleId = ur.RoleId,
                RoleName = ur.Role?.RoleName ?? string.Empty
            };
        }
    }
}
