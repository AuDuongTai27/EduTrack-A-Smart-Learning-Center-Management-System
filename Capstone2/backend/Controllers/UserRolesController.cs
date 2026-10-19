using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers
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
        /// Lấy toàn bộ danh sách phân quyền (UserRole)
        /// GET: api/userroles
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserRoleDto>>> GetAll()
        {
            var userRoles = await _userRoleService.GetAllUserRolesAsync();
            return Ok(userRoles);
        }

        /// <summary>
        /// Lấy chi tiết một phân quyền theo ID
        /// GET: api/userroles/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserRoleDto>> GetById(int id)
        {
            var userRole = await _userRoleService.GetUserRoleByIdAsync(id);
            if (userRole == null)
            {
                return NotFound(new { message = $"Không tìm thấy bản ghi phân quyền có ID = {id}" });
            }

            return Ok(userRole);
        }
    }
}
