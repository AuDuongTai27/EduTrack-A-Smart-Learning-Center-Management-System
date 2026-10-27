using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Services.Interfaces;

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
        private readonly IClassService _classService;
        private readonly IClassScheduleService _scheduleService;
        private readonly IAttendanceService _attendanceService;
        private readonly IProgressNoteService _progressNoteService;
        private readonly IUserService _userService;

        public StudentLearningController(
            IClassService classService,
            IClassScheduleService scheduleService,
            IAttendanceService attendanceService,
            IProgressNoteService progressNoteService,
            IUserService userService)
        {
            _classService = classService;
            _scheduleService = scheduleService;
            _attendanceService = attendanceService;
            _progressNoteService = progressNoteService;
            _userService = userService;
        }

        // TODO [Thành viên 3 - Student & Parent]:
        // Viết các API tra cứu lớp học, tiến độ cá nhân và cập nhật hồ sơ học sinh tại đây:
        // - GET /api/learning/student/{studentId}/classes  (Lấy danh sách lớp của học sinh)
        // - GET /api/learning/student/{studentId}/progress (Lấy điểm danh & nhận xét của học sinh)
        // - PUT /api/learning/student/{studentId}/profile  (Học sinh tự cập nhật hồ sơ cá nhân)
    }
}
