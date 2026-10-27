using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Learning
{
    /// <summary>
    /// [Bounded Context: Learning] Nộp Bài tập Học sinh (Submissions) & Xem Kết quả Chấm bài
    /// Phụ trách: Nhóm Student & Parent (Thành viên 3)
    /// </summary>
    [ApiController]
    [Route("api/submissions")]
    [Tags("Learning - Student Homework & Submissions")]
    public class StudentHomeworkController : ControllerBase
    {
        private readonly ISubmissionService _submissionService;
        private readonly IAssignmentService _assignmentService;

        public StudentHomeworkController(
            ISubmissionService submissionService,
            IAssignmentService assignmentService)
        {
            _submissionService = submissionService;
            _assignmentService = assignmentService;
        }

        // TODO [Thành viên 3 - Student & Parent]:
        // Viết các API học sinh nộp bài tập tại đây:
        // - POST /api/submissions      (Học sinh nộp bài tập mới)
        // - PUT  /api/submissions/{id} (Học sinh nộp lại / cập nhật bài làm trước hạn)
    }
}
