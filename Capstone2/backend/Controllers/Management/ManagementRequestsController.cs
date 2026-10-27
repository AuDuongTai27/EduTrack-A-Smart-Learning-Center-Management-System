using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Management
{
    /// <summary>
    /// [Bounded Context: Management] Phê duyệt Đơn từ, Phản hồi Feedback & Phát hành Thông báo hệ thống
    /// Phụ trách: Nhóm Center Manager & Admin Staff (Thành viên 1)
    /// </summary>
    [ApiController]
    [Route("api/management/operations")]
    [Tags("Management - Requests Review & Notifications")]
    public class ManagementRequestsController : ControllerBase
    {
        private readonly IApprovalRequestService _requestService;
        private readonly INotificationService _notificationService;

        public ManagementRequestsController(
            IApprovalRequestService requestService,
            INotificationService notificationService)
        {
            _requestService = requestService;
            _notificationService = notificationService;
        }

        // TODO [Thành viên 1 - CM & Admin Staff]:
        // Viết các API duyệt đơn, phản hồi Feedback và gửi thông báo tại đây:
        // - PUT  /api/approvalrequests/{id}/review (Duyệt/Từ chối đơn hoặc Trả lời Feedback)
        // - POST /api/approvalrequests             (Admin Staff tạo yêu cầu trình Center Manager duyệt)
        // - POST /api/notifications                (Tạo thông báo mới gửi toàn trung tâm / theo vai trò)
        // - DELETE /api/notifications/{id}         (Xóa thông báo)
    }
}
