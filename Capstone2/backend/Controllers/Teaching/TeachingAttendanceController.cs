using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Teaching
{
    /// <summary>
    /// [Bounded Context: Teaching] Điểm danh Buổi học (Attendances) & Ghi chú Tiến độ Học viên (Progress Notes)
    /// Phụ trách: Nhóm Teacher & Teaching Assistant (Thành viên 2)
    /// </summary>
    [ApiController]
    [Route("api/attendances")]
    [Tags("Teaching - Attendance & Progress Notes")]
    public class TeachingAttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;
        private readonly IProgressNoteService _progressNoteService;

        public TeachingAttendanceController(
            IAttendanceService attendanceService,
            IProgressNoteService progressNoteService)
        {
            _attendanceService = attendanceService;
            _progressNoteService = progressNoteService;
        }

        // TODO [Thành viên 2 - Teacher & TA]:
        // Viết các API điểm danh và nhận xét tiến độ học tập tại đây:
        // - POST /api/attendances/bulk       (Điểm danh cả lớp theo buổi học)
        // - PUT  /api/attendances/{id}       (Cập nhật trạng thái điểm danh present/absent/late)
        // - POST /api/progressnotes          (Thêm nhận xét tiến độ học tập cho học sinh)
        // - PUT  /api/progressnotes/{id}     (Sửa nhận xét tiến độ)
    }
}
