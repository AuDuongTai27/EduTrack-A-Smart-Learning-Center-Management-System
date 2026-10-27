using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _service;

        public NotificationsController(INotificationService service)
        {
            _service = service;
        }

        /// <summary>
        /// Láº¥y toÃ n bá»™ danh sÃ¡ch Notification
        /// GET: api/notifications
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetAll()
        {
            var list = await _service.GetAllNotificationsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Láº¥y chi tiáº¿t Notification theo ID
        /// GET: api/notifications/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<NotificationDto>> GetById(int id)
        {
            var item = await _service.GetNotificationByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u cÃ³ ID = " + id });
            }

            return Ok(item);
        }
    }
}

