using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách người dùng
        /// GET: api/users
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        /// <summary>
        /// Lấy chi tiết một người dùng theo ID
        /// GET: api/users/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserDto>> GetById(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = $"Không tìm thấy người dùng có ID = {id}" });
            }

            return Ok(user);
        }

        /// <summary>
        /// Tạo mới một tài khoản người dùng
        /// POST: api/users
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _userService.CreateUserAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.UserId }, created);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật thông tin tài khoản người dùng
        /// PUT: api/users/{id}
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<ActionResult<UserDto>> Update(int id, [FromBody] UpdateUserDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await _userService.UpdateUserAsync(id, dto);
                if (updated == null)
                {
                    return NotFound(new { message = $"Không tìm thấy người dùng có ID = {id}" });
                }

                return Ok(updated);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật trạng thái người dùng (active / inactive / locked)
        /// PATCH: api/users/{id}/status
        /// </summary>
        [HttpPatch("{id:int}/status")]
        public async Task<ActionResult> UpdateStatus(int id, [FromBody] UpdateUserStatusDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _userService.UpdateStatusAsync(id, dto.Status);
            if (!success)
            {
                return NotFound(new { message = $"Không tìm thấy người dùng có ID = {id}" });
            }

            return Ok(new { success = true, status = dto.Status.ToLower(), message = $"Đã cập nhật trạng thái thành {dto.Status}." });
        }

        /// <summary>
        /// Xóa người dùng theo ID
        /// DELETE: api/users/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var success = await _userService.DeleteUserAsync(id);
                if (!success)
                {
                    return NotFound(new { message = $"Không tìm thấy người dùng có ID = {id}" });
                }

                return Ok(new { success = true, message = $"Đã xóa người dùng có ID = {id} thành công." });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xóa người dùng: " + ex.Message });
            }
        }
    }
}

