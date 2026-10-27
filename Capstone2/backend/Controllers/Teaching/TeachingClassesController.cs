using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Services.Interfaces;

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

        public TeachingClassesController(
            IClassService classService,
            IClassScheduleService scheduleService,
            IClassSessionService sessionService,
            IContentUnitService contentUnitService)
        {
            _classService = classService;
            _scheduleService = scheduleService;
            _sessionService = sessionService;
            _contentUnitService = contentUnitService;
        }

        // TODO [Thành viên 2 - Teacher & TA]:
        // Viết các API lớp dạy, lịch trực và tài liệu buổi học tại đây:
        // - GET  /api/teaching/classes/my-classes   (Danh sách lớp GV/TA đang phụ trách)
        // - GET  /api/teaching/classes/my-schedule  (Thời khóa biểu dạy/trực cá nhân)
        // - POST /api/classes/{classId}/content-units (Thêm nội dung bài giảng cho lớp)
    }
}
