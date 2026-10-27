using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Teaching
{
    /// <summary>
    /// [Bounded Context: Teaching] Giao Bài tập (Assignments), Chấm điểm Bài nộp (Submissions) & Đánh giá AI
    /// Phụ trách: Nhóm Teacher & Teaching Assistant (Thành viên 2)
    /// </summary>
    [ApiController]
    [Route("api/assignments")]
    [Tags("Teaching - Assignments & Grading")]
    public class TeachingAssignmentsController : ControllerBase
    {
        private readonly IAssignmentService _assignmentService;
        private readonly ISubmissionService _submissionService;
        private readonly IAiEvaluationService _aiEvaluationService;

        public TeachingAssignmentsController(
            IAssignmentService assignmentService,
            ISubmissionService submissionService,
            IAiEvaluationService aiEvaluationService)
        {
            _assignmentService = assignmentService;
            _submissionService = submissionService;
            _aiEvaluationService = aiEvaluationService;
        }

        // TODO [Thành viên 2 - Teacher & TA]:
        // Viết các API tạo bài tập và chấm bài tại đây:
        // - POST   /api/assignments                  (Tạo bài tập mới cho lớp)
        // - PUT    /api/assignments/{id}             (Cập nhật đề bài tập)
        // - DELETE /api/assignments/{id}             (Xóa bài tập)
        // - PUT    /api/submissions/{id}/grade       (Giáo viên/TA chấm điểm & nhận xét bài nộp)
    }
}
