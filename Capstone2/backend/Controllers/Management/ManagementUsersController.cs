using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Management.Interfaces;
using EduTrack.API.Services.Management;

namespace EduTrack.API.Controllers.Management
{
    /// <summary>
    /// [Bounded Context: Management] Quản lý Tài khoản Người dùng, Học sinh & Liên kết Phụ huynh
    /// Phụ trách: Nhóm Center Manager & Admin Staff
    /// </summary>
    [ApiController]
    [Route("api/users")]
    [Tags("Management - Users & Parent Links")]
    public class ManagementUsersController : ControllerBase
    {
        private readonly IManagementUserService _userService;

        public ManagementUsersController(IManagementUserService userService)
        {
            _userService = userService;
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
                return Created($"/api/users/{created.UserId}", created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Atomic Add Student, including optional multi-class enrollment.
        [HttpPost("students")]
        public async Task<ActionResult<UserDto>> CreateStudent([FromBody] CreateStudentDto dto)
        {
            try
            {
                var created = await _userService.CreateStudentAsync(dto);
                return Created($"/api/users/{created.UserId}", created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (StudentCreationConflictException ex)
            {
                return Conflict(new { message = ex.Message, code = "student_creation_conflict", existingStudentId = ex.StudentId, existingStudentCode = ex.StudentCode });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception)
            {
                // A lost commit response is ambiguous: retry the same userCode, never
                // claim that only the student was saved or generate a new identity.
                return StatusCode(503, new { message = "Chưa xác nhận được việc lưu học sinh và đăng ký lớp. Giữ nguyên form và bấm Lưu hồ sơ để thử lại an toàn cùng yêu cầu." });
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
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xóa người dùng: " + ex.Message });
            }
        }

        // =====================================================================
        // SUB-RESOURCE: QUẢN LÝ LIÊN KẾT PHỤ HUYNH - HỌC SINH (PARENT-STUDENT)
        // Giữ nguyên route /api/parentstudents để tương thích 100% với Frontend
        // =====================================================================

        /// <summary>
        /// Gán hoặc cập nhật liên kết Phụ huynh - Học sinh
        /// POST: api/parentstudents
        /// </summary>
        [HttpPost("/api/parentstudents")]
        public async Task<ActionResult<ParentStudentDto>> AssignParentStudent([FromBody] AssignParentStudentDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _userService.AssignParentStudentAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException)
            {
                return StatusCode(503, new { message = "Chưa lưu được liên kết. Vui lòng tải lại danh sách và thử lại; không tự tạo lại hồ sơ phụ huynh hoặc học sinh." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Hủy liên kết giữa Phụ huynh và Học sinh
        /// DELETE: api/parentstudents/{parentId}/{studentId}
        /// </summary>
        [HttpDelete("/api/parentstudents/{parentId:int}/{studentId:int}")]
        public async Task<ActionResult> RemoveParentStudent(int parentId, int studentId)
        {
            try
            {
                var success = await _userService.RemoveParentStudentAsync(parentId, studentId);
                if (!success)
                {
                    return NotFound(new { message = $"Không tìm thấy liên kết giữa Phụ huynh {parentId} và Học sinh {studentId}" });
                }

                return Ok(new { success = true, message = "Đã hủy liên kết Phụ huynh - Học sinh thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi hủy liên kết: " + ex.Message });
            }
        }
    }
}
