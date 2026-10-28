using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Learning.Interfaces;

namespace EduTrack.API.Controllers.Learning
{
    /// <summary>
    /// [Bounded Context: Learning] Cổng thông tin Học tập Học sinh (Lớp đang học, Thời khóa biểu, Tiến độ & Hồ sơ)
    /// Phụ trách: Nhóm Student & Parent (Thành viên 3)
    /// </summary>
    [ApiController]
    [Route("api/learning/student")]
    [Tags("Learning - Student Portal")]
    public class StudentLearningController : ControllerBase
    {
        private readonly ILearnerDashboardService _dashboardService;
        private readonly IClassService _classService;
        private readonly IClassScheduleService _scheduleService;
        private readonly IAttendanceService _attendanceService;
        private readonly IProgressNoteService _progressNoteService;
        private readonly IUserService _userService;

        public StudentLearningController(
            ILearnerDashboardService dashboardService,
            IClassService classService,
            IClassScheduleService scheduleService,
            IAttendanceService attendanceService,
            IProgressNoteService progressNoteService,
            IUserService userService)
        {
            _dashboardService = dashboardService;
            _classService = classService;
            _scheduleService = scheduleService;
            _attendanceService = attendanceService;
            _progressNoteService = progressNoteService;
            _userService = userService;
        }

        /// <summary>
        /// Lấy tổng quan Bảng điều khiển Học sinh (Thông tin học sinh, số lớp đang học, số bài tập chưa nộp & danh sách lớp kèm lịch/giáo viên)
        /// </summary>
        [HttpGet("{studentId:int}/dashboard")]
        public async Task<IActionResult> GetStudentDashboard(int studentId)
        {
            var data = await _dashboardService.GetStudentDashboardAsync(studentId);
            if (data == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy học sinh có ID = {studentId}" });
            }

            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Lấy chi tiết Lớp học cho Học sinh & Phụ huynh (Thông tin giáo viên, lịch học, tài liệu ContentUnits, bài tập kèm trạng thái nộp & nhật ký điểm danh)
        /// </summary>
        [HttpGet("{studentId:int}/classes/{classId:int}")]
        public async Task<IActionResult> GetStudentClassDetail(int studentId, int classId)
        {
            var data = await _dashboardService.GetStudentClassDetailAsync(studentId, classId);
            if (data == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy lớp học có ID = {classId}" });
            }

            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Lấy thời khóa biểu tuần của Học sinh (Chỉ các lớp học sinh đang theo học, kèm tên Giáo viên & Phòng học thực tế)
        /// </summary>
        [HttpGet("{studentId:int}/schedule")]
        public async Task<IActionResult> GetStudentSchedule(int studentId)
        {
            var data = await _dashboardService.GetStudentScheduleAsync(studentId);
            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Lấy báo cáo Tiến độ học tập & Điểm danh tổng hợp của Học sinh (Số buổi có mặt/vắng/đi trễ, tỷ lệ chuyên cần & nhận xét từng lớp)
        /// </summary>
        [HttpGet("{studentId:int}/progress")]
        public async Task<IActionResult> GetStudentProgress(int studentId)
        {
            var data = await _dashboardService.GetStudentProgressAsync(studentId);
            if (data == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy học sinh có ID = {studentId}" });
            }

            return Ok(new { success = true, data });
        }

        // TODO [Thành viên 3 - Student & Parent]:
        // Viết API cập nhật hồ sơ học sinh tại đây:
        // - PUT /api/learning/student/{studentId}/profile (Học sinh tự cập nhật hồ sơ cá nhân)
    }
}
