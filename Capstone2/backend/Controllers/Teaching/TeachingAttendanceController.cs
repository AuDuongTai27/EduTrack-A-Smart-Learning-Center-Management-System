using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs.Teaching;
using EduTrack.API.Services.Teaching.Interfaces;

namespace EduTrack.API.Controllers.Teaching
{
    /// <summary>
    /// [Bounded Context: Teaching] Điểm danh Buổi học (Attendance Management)
    /// Phụ trách: Nhóm Teacher & Teaching Assistant (Thành viên 2)
    /// </summary>
    [ApiController]
    [Route("api/teaching/attendance")]
    [Tags("Teaching - Attendance")]
    public class TeachingAttendanceController : ControllerBase
    {
        private readonly ITeachingAttendanceService _attendanceService;

        public TeachingAttendanceController(ITeachingAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        /// <summary>
        /// Lấy bảng điểm danh của lớp theo buổi học
        /// GET /api/teaching/attendance/sheet?classId={classId}&sessionId={sessionId}&userId={userId}
        /// </summary>
        [HttpGet("sheet")]
        public async Task<IActionResult> GetAttendanceSheet(
            [FromQuery] int classId,
            [FromQuery] int? sessionId,
            [FromQuery] int userId = 3)
        {
            if (classId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã lớp học (classId) không hợp lệ." });
            }

            var sheet = await _attendanceService.GetAttendanceSheetAsync(classId, sessionId, userId);
            if (sheet == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy thông tin lớp học #{classId}." });
            }

            return Ok(new { success = true, data = sheet });
        }

        /// <summary>
        /// Lấy danh sách tất cả các buổi học của lớp để chọn điểm danh
        /// GET /api/teaching/attendance/sessions?classId={classId}
        /// </summary>
        [HttpGet("sessions")]
        public async Task<IActionResult> GetClassSessions([FromQuery] int classId)
        {
            if (classId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã lớp học (classId) không hợp lệ." });
            }

            var sessions = await _attendanceService.GetClassSessionsAsync(classId);
            return Ok(new { success = true, data = sessions });
        }

        /// <summary>
        /// Lưu điểm danh đồng loạt cả lớp cho một buổi học cụ thể
        /// POST /api/teaching/attendance/bulk
        /// </summary>
        [HttpPost("bulk")]
        public async Task<IActionResult> SaveBulkAttendance([FromBody] SaveBulkTeachingAttendanceRequestDto request)
        {
            if (request == null || request.ClassId <= 0 || request.SessionId <= 0)
            {
                return BadRequest(new { success = false, message = "Thông tin lớp học hoặc buổi học không hợp lệ." });
            }

            if (request.Items == null || request.Items.Count == 0)
            {
                return BadRequest(new { success = false, message = "Danh sách điểm danh không được để trống." });
            }

            if (request.RecordedBy <= 0)
            {
                request.RecordedBy = 3; // Default teacher TC001
            }

            try
            {
                var updatedSheet = await _attendanceService.SaveBulkAttendanceAsync(request);
                return Ok(new
                {
                    success = true,
                    message = "Lưu điểm danh buổi học thành công vào hệ thống!",
                    data = updatedSheet
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = $"Lỗi khi lưu điểm danh: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Cập nhật nhanh trạng thái điểm danh của 1 học sinh
        /// PUT /api/teaching/attendance/{id}
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateSingleAttendance(int id, [FromBody] UpdateSingleAttendanceRequestDto request)
        {
            if (id <= 0 || request == null)
            {
                return BadRequest(new { success = false, message = "Dữ liệu yêu cầu không hợp lệ." });
            }

            if (request.RecordedBy <= 0)
            {
                request.RecordedBy = 3;
            }

            var updated = await _attendanceService.UpdateSingleAttendanceAsync(id, request);
            if (updated == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy bản ghi điểm danh ID = {id}." });
            }

            return Ok(new
            {
                success = true,
                message = "Cập nhật trạng thái điểm danh thành công!",
                data = updated
            });
        }
    }
}
