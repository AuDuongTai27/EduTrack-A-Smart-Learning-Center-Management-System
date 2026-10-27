using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserRolesController : ControllerBase
    {
        private readonly IUserRoleService _userRoleService;

        public UserRolesController(IUserRoleService userRoleService)
        {
            _userRoleService = userRoleService;
        }

        /// <summary>
        /// Láº¥y toÃ n bá»™ danh sÃ¡ch phÃ¢n quyá»n (UserRole)
        /// GET: api/userroles
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserRoleDto>>> GetAll()
        {
            var userRoles = await _userRoleService.GetAllUserRolesAsync();
            return Ok(userRoles);
        }

        /// <summary>
        /// Láº¥y chi tiáº¿t má»™t phÃ¢n quyá»n theo ID
        /// GET: api/userroles/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserRoleDto>> GetById(int id)
        {
            var userRole = await _userRoleService.GetUserRoleByIdAsync(id);
            if (userRole == null)
            {
                return NotFound(new { message = $"KhÃ´ng tÃ¬m tháº¥y báº£n ghi phÃ¢n quyá»n cÃ³ ID = {id}" });
            }

            return Ok(userRole);
        }
    }
}

