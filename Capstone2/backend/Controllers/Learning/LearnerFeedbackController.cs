using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Learning
{
    /// <summary>
    /// [Bounded Context: Learning] Gửi Ý kiến Phản hồi (Feedback) & Đơn xin nghỉ phép của Học sinh / Phụ huynh
    /// Phụ trách: Nhóm Student & Parent (Thành viên 3)
    /// </summary>
    [ApiController]
    [Route("api/learning/feedback")]
    [Tags("Learning - Student & Parent Feedback")]
    public class LearnerFeedbackController : ControllerBase
    {
        private readonly IApprovalRequestService _requestService;

        public LearnerFeedbackController(IApprovalRequestService requestService)
        {
            _requestService = requestService;
        }

        // TODO [Thành viên 3 - Student & Parent]:
        // Viết các API gửi Feedback / đơn xin nghỉ học tại đây:
        // - POST /api/learning/feedback (Gửi Feedback hoặc đơn xin phép của Học sinh/Phụ huynh)
    }
}
