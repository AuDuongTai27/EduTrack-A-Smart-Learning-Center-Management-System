using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Management.Interfaces;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.EF;
using EduTrack.API.Services.Notifications;

namespace EduTrack.API.Controllers.Management
{
    [ApiController]
    [Route("api/management/notifications")]
    [Tags("Management - Notifications")]
    [NotificationErrors]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public class ManagementNotificationsController : ControllerBase
    {
        private readonly IManagementNotificationService _service;
        private readonly NotificationInboxService _inbox;
        private readonly NotificationRecipientSearchService _search;

        public ManagementNotificationsController(IManagementNotificationService service, EduTrackDbContext db)
        {
            _service = service;
            _inbox = new(db);
            _search = new(db);
        }

        [HttpGet("recipients")]
        public async Task<IActionResult> SearchRecipients([FromQuery] int senderId,
            [FromQuery] string? query, [FromQuery] int limit = 20, CancellationToken ct = default)
            => Ok(await _search.SearchAsync(senderId, query, limit, ct));

        [HttpPost]
        public async Task<ActionResult<NotificationDto>> Create(
            [FromBody] CreateManagementNotificationDto dto)
        {
            try
            {
                await _inbox.IdentifyAsync(dto.SenderId, true);
                var notification = await _service.CreateAsync(dto);
                return Created($"/api/notifications/{notification.NotificationId}", notification);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sent")]
        public async Task<ActionResult<IReadOnlyList<NotificationDto>>> GetSent([FromQuery] int senderId)
        {
            try
            {
                var sender = await _inbox.IdentifyAsync(senderId, true);
                return Ok(await _service.GetSentAsync(sender.UserId));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
