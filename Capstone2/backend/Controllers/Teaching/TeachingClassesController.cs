using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Teaching.Interfaces;

namespace EduTrack.API.Controllers.Teaching
{
    /// <summary>
    /// [Bounded Context: Teaching] Quản lý Lớp phụ trách, Lịch giảng dạy & Nội dung bài học (Content Units)
    /// Phụ trách: Nhóm Teacher & Teaching Assistant (Thành viên 2)
    /// </summary>
    [ApiController]
    [Route("api/teaching/classes")]
    [Tags("Teaching - Classes & Schedules")]
    public class TeachingClassesController : ControllerBase
    {
        private readonly IClassService _classService;
        private readonly IClassScheduleService _scheduleService;
        private readonly IClassSessionService _sessionService;
        private readonly IContentUnitService _contentUnitService;
        private readonly ITeachingDashboardService _dashboardService;
        private readonly ITeachingScheduleService _teachingScheduleService;
        private readonly ITeachingMyClassService _myClassService;

        public TeachingClassesController(
            IClassService classService,
            IClassScheduleService scheduleService,
            IClassSessionService sessionService,
            IContentUnitService contentUnitService,
            ITeachingDashboardService dashboardService,
            ITeachingScheduleService teachingScheduleService,
            ITeachingMyClassService myClassService)
        {
            _classService = classService;
            _scheduleService = scheduleService;
            _sessionService = sessionService;
            _contentUnitService = contentUnitService;
            _dashboardService = dashboardService;
            _teachingScheduleService = teachingScheduleService;
            _myClassService = myClassService;
        }

        /// <summary>
        /// Lấy tổng quan Dashboard cho Giáo viên hoặc Trợ giảng dựa trên userId (tự động phân quyền từ database)
        /// </summary>
        [HttpGet("~/api/teaching/dashboard")]
        public async Task<IActionResult> GetDashboard([FromQuery] int userId)
        {
            if (userId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã định danh người dùng (userId) không hợp lệ." });
            }

            var data = await _dashboardService.GetDashboardAsync(userId);
            if (data == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy thông tin tài khoản có ID = {userId}" });
            }

            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Lấy thời khóa biểu giảng dạy hoặc lịch trực cá nhân của Giáo viên / Trợ giảng
        /// </summary>
        [HttpGet("my-schedule")]
        public async Task<IActionResult> GetMySchedule([FromQuery] int userId)
        {
            if (userId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã định danh người dùng (userId) không hợp lệ." });
            }

            var data = await _teachingScheduleService.GetMyScheduleAsync(userId);
            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Lấy danh sách lớp học do Giáo viên hoặc Trợ giảng đang phụ trách
        /// </summary>
        [HttpGet("my-classes")]
        public async Task<IActionResult> GetMyClasses([FromQuery] int userId)
        {
            if (userId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã định danh người dùng (userId) không hợp lệ." });
            }

            var data = await _myClassService.GetMyClassesAsync(userId);
            return Ok(new { success = true, data });
        }

        // TODO [Thành viên 2 - Teacher & TA]:
        // Viết các API tài liệu buổi học tại đây:
        // - POST /api/classes/{classId}/content-units (Thêm nội dung bài giảng cho lớp)
    }
}
