using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Controllers.Management
{
    [ApiController]
    [Route("api/centersettings")]
    [Tags("Management - Center Settings")]
    public class ManagementSettingsController : ControllerBase
    {
        private readonly ICenterSettingService _settingService;

        public ManagementSettingsController(ICenterSettingService settingService)
        {
            _settingService = settingService;
        }

        // PUT /api/centersettings/bulk
        // Development only until real authentication/authorization is integrated.
        [HttpPut("bulk")]
        public async Task<ActionResult<IReadOnlyList<CenterSettingDto>>> UpdateBulk(
            [FromBody] CenterSettingsBulkUpdateDto request)
        {
            try
            {
                var saved = await _settingService.SaveSettingsAsync(request.Settings);
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
