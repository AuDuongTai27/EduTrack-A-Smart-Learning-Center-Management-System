using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class CenterSettingsController : ControllerBase
    {
        private readonly ICenterSettingService _service;

        public CenterSettingsController(ICenterSettingService service)
        {
            _service = service;
        }

        /// <summary>
        /// Láº¥y toÃ n bá»™ danh sÃ¡ch CenterSetting
        /// GET: api/centersettings
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CenterSettingDto>>> GetAll()
        {
            var list = await _service.GetAllCenterSettingsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Láº¥y chi tiáº¿t CenterSetting theo ID
        /// GET: api/centersettings/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CenterSettingDto>> GetById(int id)
        {
            var item = await _service.GetCenterSettingByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u cÃ³ ID = " + id });
            }

            return Ok(item);
        }
    }
}

