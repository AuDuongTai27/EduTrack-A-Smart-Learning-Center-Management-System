using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/centersettings")]
    [Tags("Center Settings")]
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

        // PUT /api/centersettings/bulk
        // Development only until real authentication/authorization is integrated.
        [HttpPut("bulk")]
        public async Task<ActionResult<IReadOnlyList<CenterSettingDto>>> UpdateBulk(
            [FromBody] CenterSettingsBulkUpdateDto request)
        {
            try
            {
                var saved = await _service.SaveSettingsAsync(request.Settings);
                return Ok(saved);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (DbUpdateException)
            {
                return Conflict(new { message = "Settings could not be saved. Please retry." });
            }
        }
    }
}
