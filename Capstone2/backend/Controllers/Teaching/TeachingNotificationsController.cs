using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.EF;
using EduTrack.API.Services.Notifications;
using EduTrack.API.Models.DTOs.Teaching;
using EduTrack.API.Services.Teaching.Interfaces;

namespace EduTrack.API.Controllers.Teaching
{
    /// <summary>
    /// [Bounded Context: Teaching] Quản lý Thông báo dành cho Giáo viên & Trợ giảng
    /// Phụ trách: Nhóm Teacher & Teaching Assistant (Thành viên 2)
    /// </summary>
    [ApiController]
    [Route("api/teaching/notifications")]
    [Tags("Teaching - Notifications")]
    [NotificationErrors]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public class TeachingNotificationsController : ControllerBase
    {
        private readonly ITeachingNotificationService _notificationService;
        private readonly NotificationInboxService _inbox;

        public TeachingNotificationsController(ITeachingNotificationService notificationService, EduTrackDbContext db)
        {
            _notificationService = notificationService;
            _inbox = new(db);
        }

        /// <summary>
        /// Lấy danh sách thông báo theo giáo viên/trợ giảng
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int userId, [FromQuery] string? status)
        {
            await _inbox.IdentifyAsync(userId);
            var data = await _notificationService.GetNotificationsAsync(userId, status);
            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Đánh dấu một thông báo là đã đọc
        /// </summary>
        [HttpPut("{notificationId:int}/read")]
        public async Task<IActionResult> MarkAsRead(int notificationId, [FromQuery] int? userId = null)
        {
            if (notificationId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã thông báo không hợp lệ." });
            }

            var identity = await _inbox.IdentifyAsync(userId ?? 0);
            var success = await _notificationService.MarkAsReadAsync(notificationId, identity.UserId);
            if (!success)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy thông báo #{notificationId}" });
            }

            return Ok(new { success = true, message = "Đã đánh dấu thông báo là đã đọc." });
        }

        /// <summary>
        /// Đánh dấu toàn bộ thông báo của user là đã đọc
        /// </summary>
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead([FromQuery] int userId)
        {
            await _inbox.IdentifyAsync(userId);
            var count = await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { success = true, updatedCount = count, message = $"Đã đánh dấu {count} thông báo là đã đọc." });
        }
    }
}

