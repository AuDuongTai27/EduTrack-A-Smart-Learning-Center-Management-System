using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs.Teaching;
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
        private readonly ITeachingLearningProgressService _learningProgressService;

        public TeachingClassesController(
            IClassService classService,
            IClassScheduleService scheduleService,
            IClassSessionService sessionService,
            IContentUnitService contentUnitService,
            ITeachingDashboardService dashboardService,
            ITeachingScheduleService teachingScheduleService,
            ITeachingMyClassService myClassService,
            ITeachingLearningProgressService learningProgressService)
        {
            _classService = classService;
            _scheduleService = scheduleService;
            _sessionService = sessionService;
            _contentUnitService = contentUnitService;
            _dashboardService = dashboardService;
            _teachingScheduleService = teachingScheduleService;
            _myClassService = myClassService;
            _learningProgressService = learningProgressService;
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

        /// <summary>
        /// Lấy danh sách học sinh theo lớp học dành cho Giáo viên & Trợ giảng
        /// </summary>
        [HttpGet("{classId:int}/students")]
        public async Task<IActionResult> GetClassStudents(int classId)
        {
            if (classId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã lớp học (classId) không hợp lệ." });
            }

            var students = await _myClassService.GetClassStudentsAsync(classId);
            return Ok(new { success = true, data = students });
        }

        /// <summary>
        /// Lấy tiến độ học tập và tình hình làm bài của tất cả học viên trong một lớp
        /// </summary>
        [HttpGet("{classId}/learning-progress")]
        public async Task<IActionResult> GetClassLearningProgress([FromRoute] int classId, [FromQuery] int? userId)
        {
            if (classId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã lớp học (classId) không hợp lệ." });
            }

            var data = await _learningProgressService.GetClassLearningProgressAsync(classId, userId);
            if (data == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy thông tin tiến độ học tập cho lớp ID = {classId}" });
            }

            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Lấy tiến độ học tập theo giáo viên/trợ giảng (tự động load lớp mặc định nếu chưa chọn lớp)
        /// </summary>
        [HttpGet("learning-progress")]
        public async Task<IActionResult> GetLearningProgressByTeacher([FromQuery] int userId, [FromQuery] int? classId)
        {
            if (userId <= 0 && (!classId.HasValue || classId.Value <= 0))
            {
                return BadRequest(new { success = false, message = "Cần cung cấp userId hoặc classId hợp lệ." });
            }

            var data = await _learningProgressService.GetClassLearningProgressAsync(classId ?? 0, userId);
            if (data == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy dữ liệu tiến độ học tập phù hợp." });
            }

            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Lấy chi tiết toàn diện tiến độ của một học sinh trong môn học
        /// GET: api/teaching/classes/{classId}/students/{studentId}/progress-detail
        /// </summary>
        [HttpGet("{classId}/students/{studentId}/progress-detail")]
        public async Task<IActionResult> GetStudentProgressDetail([FromRoute] int classId, [FromRoute] int studentId)
        {
            if (classId <= 0 || studentId <= 0)
            {
                return BadRequest(new { success = false, message = "ClassId và StudentId không hợp lệ." });
            }

            var data = await _learningProgressService.GetStudentProgressDetailAsync(classId, studentId);
            if (data == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy chi tiết học sinh ID = {studentId} trong lớp ID = {classId}" });
            }

            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Tạo đánh giá cá nhân mới cho học sinh trong lớp (lưu vào progress_notes)
        /// POST: api/teaching/classes/{classId}/students/{studentId}/evaluations
        /// </summary>
        [HttpPost("{classId}/students/{studentId}/evaluations")]
        public async Task<IActionResult> CreateStudentEvaluation(
            [FromRoute] int classId,
            [FromRoute] int studentId,
            [FromBody] CreateTeachingEvaluationRequest request,
            [FromQuery] int? authorId)
        {
            if (classId <= 0 || studentId <= 0 || request == null || string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { success = false, message = "Dữ liệu đánh giá không hợp lệ." });
            }

            int writtenBy = authorId ?? (request.EvaluatorRole == "Trợ giảng" ? 5 : 3);
            var created = await _learningProgressService.CreateStudentEvaluationAsync(classId, studentId, request, writtenBy);

            return Ok(new { success = true, data = created, message = "Đã lưu đánh giá cá nhân thành công!" });
        }
    }
}
