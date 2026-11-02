using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
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
    public class TeachingNotificationsController : ControllerBase
    {
        private readonly ITeachingNotificationService _notificationService;

        public TeachingNotificationsController(ITeachingNotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        /// <summary>
        /// Lấy danh sách thông báo theo giáo viên/trợ giảng
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int userId, [FromQuery] string? status)
        {
            if (userId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã định danh người dùng (userId) không hợp lệ." });
            }

            var data = await _notificationService.GetNotificationsAsync(userId, status);
            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Đánh dấu một thông báo là đã đọc
        /// </summary>
        [HttpPut("{notificationId:int}/read")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            if (notificationId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã thông báo không hợp lệ." });
            }

            var success = await _notificationService.MarkAsReadAsync(notificationId);
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
            if (userId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã định danh người dùng (userId) không hợp lệ." });
            }

            var count = await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { success = true, updatedCount = count, message = $"Đã đánh dấu {count} thông báo là đã đọc." });
        }
    }
}

