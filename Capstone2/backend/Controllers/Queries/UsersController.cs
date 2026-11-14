using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Models.EF;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Management;
using EduTrack.API.Services.Management.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    /// <summary>
    /// API đọc và quản lý Tài khoản Người dùng, Học sinh, Xếp lớp, Liên kết Phụ huynh & Chọn User
    /// </summary>
    [ApiController]
    [Route("api/users")]
    [Tags("Users, Enrollments & Parent Links")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService? _userQueryService;
        private readonly IManagementUserService? _userManagementService;
        private readonly IStudentClassService? _studentClassService;
        private readonly IParentStudentService? _parentStudentService;
        private readonly EduTrackDbContext? _db;

        public UsersController(
            IUserService? userQueryService = null,
            IManagementUserService? userManagementService = null,
            IStudentClassService? studentClassService = null,
            IParentStudentService? parentStudentService = null,
            EduTrackDbContext? db = null)
        {
            _userQueryService = userQueryService;
            _userManagementService = userManagementService;
            _studentClassService = studentClassService;
            _parentStudentService = parentStudentService;
            _db = db;
        }

        // =====================================================================
        // PUBLIC DATA SELECTION (/api/user-selection)
        // =====================================================================

        [HttpGet("/api/user-selection")]
        [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
        public async Task<IActionResult> GetUserSelection([FromQuery] string role, CancellationToken ct)
        {
            var roles = new[] { "center_manager", "admin_staff", "teacher", "teaching_assistant", "student", "parent" };
            if (!roles.Contains(role)) return BadRequest(new { message = "Vai trò chọn dữ liệu không hợp lệ." });
            var users = await _db!.Users.AsNoTracking().Where(u => u.Status == "active" && u.UserRoles.Any(r => r.Role.RoleName == role || role == "teaching_assistant" && r.Role.RoleName == "ta"))
                .OrderBy(u => u.UserId).Select(u => new { u.UserId, u.UserCode, u.FullName, u.Email, u.AvatarUrl, u.Status, Roles = u.UserRoles.Select(r => r.Role.RoleName).ToArray() }).ToListAsync(ct);
            return Ok(users);
        }

        // =====================================================================
        // QUERY: USERS
        // =====================================================================

        /// <summary>
        /// Lấy toàn bộ danh sách người dùng
        /// GET: api/users
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
        {
            var users = await _userQueryService!.GetAllUsersAsync();
            return Ok(users);
        }

        /// <summary>
        /// Lấy chi tiết một người dùng theo ID
        /// GET: api/users/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserDto>> GetById(int id)
        {
            var user = await _userQueryService!.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = $"Không tìm thấy người dùng có ID = {id}" });
            }

            return Ok(user);
        }

        // =====================================================================
        // MANAGEMENT: USERS & STUDENTS
        // =====================================================================

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
                var created = await _userManagementService!.CreateUserAsync(dto);
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
                var created = await _userManagementService!.CreateStudentAsync(dto);
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
                var updated = await _userManagementService!.UpdateUserAsync(id, dto);
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

            var success = await _userManagementService!.UpdateStatusAsync(id, dto.Status);
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
                var success = await _userManagementService!.DeleteUserAsync(id);
                if (!success)
                {
                    return NotFound(new { message = $"Không tìm thấy người dùng có ID = {id}" });
                }

                return Ok(new { success = true, message = $"Đã xóa người dùng có ID = {id} thành công." });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xóa người dùng: " + ex.Message });
            }
        }

        // =====================================================================
        // SUB-RESOURCE: QUẢN LÝ ĐĂNG KÝ LỚP CỦA HỌC SINH (ENROLLMENTS)
        // Giữ nguyên route /api/users/{studentId}/enrollments
        // =====================================================================

        [HttpPost("{studentId:int:min(1)}/enrollments")]
        public Task<IActionResult> AddEnrollments(int studentId, AddStudentEnrollmentsDto dto) =>
            RunEnrollment(async () => Ok(await _studentClassService!.EnrollAsync(studentId, dto.GradeId, dto.ClassIds)));

        [HttpPatch("{studentId:int:min(1)}/enrollments/{enrollmentId:int:min(1)}/drop")]
        public Task<IActionResult> DropEnrollment(int studentId, int enrollmentId, DropStudentEnrollmentDto dto) =>
            RunEnrollment(async () => Ok(await _studentClassService!.DropAsync(studentId, enrollmentId, dto.Reason)));

        private async Task<IActionResult> RunEnrollment(Func<Task<IActionResult>> action)
        {
            try { return await action(); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
            catch (Exception ex) when (ex is MySqlException { Number: 1213 or 1205 }
                || ex is DbUpdateException { InnerException: MySqlException { Number: 1062 or 1213 or 1205 } })
            {
                return Conflict(new { message = "Đăng ký lớp vừa được cập nhật ở phiên khác. Tải lại danh sách, kiểm tra và thử lại; lịch sử cũ được giữ nguyên." });
            }
            catch (Exception)
            {
                return StatusCode(503, new { message = "Chưa xác nhận được kết quả cập nhật lớp. Tải lại danh sách để kiểm tra trước khi thử lại; không cần tạo lại học sinh." });
            }
        }

        // =====================================================================
        // SUB-RESOURCE: QUẢN LÝ LIÊN KẾT PHỤ HUYNH - HỌC SINH (PARENT-STUDENT)
        // Giữ nguyên route /api/parentstudents để tương thích 100% với Frontend
        // =====================================================================

        /// <summary>
        /// Lấy toàn bộ danh sách liên kết Phụ huynh - Học sinh
        /// GET: api/parentstudents
        /// </summary>
        [HttpGet("/api/parentstudents")]
        public async Task<ActionResult<IEnumerable<ParentStudentDto>>> GetAllParentStudents()
        {
            var list = await _parentStudentService!.GetAllParentStudentsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy liên kết theo cặp ParentId và StudentId
        /// GET: api/parentstudents/{parentId}/{studentId}
        /// </summary>
        [HttpGet("/api/parentstudents/{parentId:int}/{studentId:int}")]
        public async Task<ActionResult<ParentStudentDto>> GetParentStudentById(int parentId, int studentId)
        {
            var item = await _parentStudentService!.GetByIdsAsync(parentId, studentId);
            if (item == null)
            {
                return NotFound(new { message = $"Không tìm thấy quan hệ giữa Phụ huynh ID {parentId} và Học sinh ID {studentId}" });
            }
            return Ok(item);
        }

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
                var result = await _userManagementService!.AssignParentStudentAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (DbUpdateException)
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
                var success = await _userManagementService!.RemoveParentStudentAsync(parentId, studentId);
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
