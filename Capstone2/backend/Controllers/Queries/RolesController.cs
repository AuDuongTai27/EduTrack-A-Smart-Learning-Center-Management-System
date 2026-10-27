using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RolesController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        /// <summary>
        /// Láº¥y toÃ n bá»™ danh sÃ¡ch vai trÃ²
        /// GET: api/roles
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleDto>>> GetAll()
        {
            var roles = await _roleService.GetAllRolesAsync();
            return Ok(roles);
        }

        /// <summary>
        /// Láº¥y chi tiáº¿t má»™t vai trÃ² theo ID
        /// GET: api/roles/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<RoleDto>> GetById(int id)
        {
            var role = await _roleService.GetRoleByIdAsync(id);
            if (role == null)
            {
                return NotFound(new { message = $"KhÃ´ng tÃ¬m tháº¥y vai trÃ² cÃ³ ID = {id}" });
            }

            return Ok(role);
        }
    }
}

