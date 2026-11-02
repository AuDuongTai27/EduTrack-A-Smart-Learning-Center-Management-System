using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Management.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.API.Controllers.Management
{
    [ApiController]
    [Route("api/notifications")]
    [Tags("Notifications - Inbox")]
    public class NotificationInboxController : ControllerBase
    {
        private readonly IManagementNotificationService _service;

        public NotificationInboxController(IManagementNotificationService service)
        {
            _service = service;
        }

        // DEV ONLY: userId must come from auth identity in production.
        [HttpGet("inbox")]
        public async Task<ActionResult<IReadOnlyList<NotificationDto>>> Inbox([FromQuery] int userId)
        {
            try
            {
                return Ok(await _service.GetInboxAsync(userId));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DEV ONLY: userId must come from auth identity in production.
        [HttpPatch("{id:int}/read")]
        public async Task<ActionResult<NotificationDto>> MarkRead(
            int id, [FromQuery] int userId)
        {
            try
            {
                var result = await _service.MarkReadAsync(id, userId);
                if (result == null)
                    return NotFound(new { message = "Thông báo không thuộc hộp thư của tài khoản này." });
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Chỉ ẩn bản ghi người nhận đã đọc (soft-delete), không xóa thông báo gốc.
        // DEV ONLY: userId must come from auth identity in production.
        [HttpDelete("{id:int}/inbox")]
        public async Task<IActionResult> DeleteReadFromInbox(int id, [FromQuery] int userId)
        {
            try
            {
                if (!await _service.HideReadAsync(id, userId))
                    return NotFound(new { message = "Không tìm thấy thông báo trong hộp thư." });
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
