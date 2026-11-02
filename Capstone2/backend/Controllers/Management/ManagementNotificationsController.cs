using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Management.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.API.Controllers.Management
{
    [ApiController]
    [Route("api/management/notifications")]
    [Tags("Management - Notifications")]
    public class ManagementNotificationsController : ControllerBase
    {
        private readonly IManagementNotificationService _service;

        public ManagementNotificationsController(IManagementNotificationService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<NotificationDto>> Create(
            [FromBody] CreateManagementNotificationDto dto)
        {
            try
            {
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
                return Ok(await _service.GetSentAsync(senderId));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
