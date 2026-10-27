using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Teaching
{
    /// <summary>
    /// [Bounded Context: Teaching] Gửi Đơn từ, Đề xuất Giảng dạy & Yêu cầu Hỗ trợ của Teacher/TA
    /// Phụ trách: Nhóm Teacher & Teaching Assistant (Thành viên 2)
    /// </summary>
    [ApiController]
    [Route("api/teaching/requests")]
    [Tags("Teaching - Teacher & TA Requests")]
    public class TeachingRequestsController : ControllerBase
    {
        private readonly IApprovalRequestService _requestService;

        public TeachingRequestsController(IApprovalRequestService requestService)
        {
            _requestService = requestService;
        }

        // TODO [Thành viên 2 - Teacher & TA]:
        // Viết các API tạo đơn xin nghỉ dạy, đổi lịch hoặc đề xuất của GV/TA tại đây:
        // - POST /api/teaching/requests (Tạo đơn từ của Giáo viên / Trợ giảng)
    }
}
