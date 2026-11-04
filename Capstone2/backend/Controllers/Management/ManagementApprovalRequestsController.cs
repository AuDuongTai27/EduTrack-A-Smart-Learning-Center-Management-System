using System;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Management.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Controllers.Management
{
    [ApiController]
    [Route("api/approvalrequests")]
    [Tags("Management - Approval Requests")]
    public class ManagementApprovalRequestsController : ControllerBase
    {
        private readonly IManagementApprovalRequestService _service;
        private readonly ILogger<ManagementApprovalRequestsController> _logger;

        public ManagementApprovalRequestsController(
            IManagementApprovalRequestService service,
            ILogger<ManagementApprovalRequestsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // POST /api/approvalrequests
        [HttpPost]
        public async Task<ActionResult<ApprovalRequestDto>> Create(
            [FromBody] CreateApprovalRequestDto dto)
        {
            try
            {
                var created = await _service.CreateAsync(dto);
                return Created($"/api/approvalrequests/{created.RequestId}", created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create approval request failed");
                return StatusCode(500, new { message = "Không thể tạo yêu cầu." });
            }
        }

        // PUT /api/approvalrequests/{id}
        [HttpPut("{id:int}")]
        public async Task<ActionResult<ApprovalRequestDto>> Update(
            int id, [FromBody] UpdateApprovalRequestDto dto)
        {
            try
            {
                var updated = await _service.UpdateAsync(id, dto);
                if (updated == null)
                    return NotFound(new { message = "Không tìm thấy yêu cầu." });
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update approval request failed: {RequestId}", id);
                return StatusCode(500, new { message = "Không thể chỉnh sửa yêu cầu." });
            }
        }

        // PUT /api/approvalrequests/{id}/review
        [HttpPut("{id:int}/review")]
        public async Task<ActionResult<ApprovalRequestDto>> Review(
            int id, [FromBody] ReviewApprovalRequestDto dto)
        {
            try
            {
                var updated = await _service.ReviewAsync(id, dto);
                if (updated == null)
                    return NotFound(new { message = "Không tìm thấy yêu cầu." });
                return Ok(updated);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Review approval request failed: {RequestId}", id);
                return StatusCode(500, new { message = "Không thể xử lý yêu cầu." });
            }
        }
    }
}
