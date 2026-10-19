using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers
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
        /// Lấy toàn bộ danh sách CenterSetting
        /// GET: api/centersettings
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CenterSettingDto>>> GetAll()
        {
            var list = await _service.GetAllCenterSettingsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết CenterSetting theo ID
        /// GET: api/centersettings/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CenterSettingDto>> GetById(int id)
        {
            var item = await _service.GetCenterSettingByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}
