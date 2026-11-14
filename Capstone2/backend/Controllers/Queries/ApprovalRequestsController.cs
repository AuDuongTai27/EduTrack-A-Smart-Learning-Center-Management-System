using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Management.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/approvalrequests")]
    [Tags("Approval Requests")]
    public class ApprovalRequestsController : ControllerBase
    {
        private readonly IApprovalRequestService? _queryService;
        private readonly IManagementApprovalRequestService? _managementService;
        private readonly ILogger<ApprovalRequestsController>? _logger;

        public ApprovalRequestsController(
            IApprovalRequestService? queryService = null,
            IManagementApprovalRequestService? managementService = null,
            ILogger<ApprovalRequestsController>? logger = null)
        {
            _queryService = queryService;
            _managementService = managementService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách ApprovalRequest
        /// GET: api/approvalrequests
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApprovalRequestDto>>> GetAll()
        {
            var list = await _queryService!.GetAllApprovalRequestsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết ApprovalRequest theo ID
        /// GET: api/approvalrequests/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApprovalRequestDto>> GetById(int id)
        {
            var item = await _queryService!.GetApprovalRequestByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }

        // POST /api/approvalrequests
        [HttpPost]
        public async Task<ActionResult<ApprovalRequestDto>> Create([FromBody] CreateApprovalRequestDto dto)
        {
            try
            {
                var created = await _managementService!.CreateAsync(dto);
                return Created($"/api/approvalrequests/{created.RequestId}", created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Create approval request failed");
                return StatusCode(500, new { message = "Không thể tạo yêu cầu." });
            }
        }

        // PUT /api/approvalrequests/{id}
        [HttpPut("{id:int}")]
        public async Task<ActionResult<ApprovalRequestDto>> Update(int id, [FromBody] UpdateApprovalRequestDto dto)
        {
            try
            {
                var updated = await _managementService!.UpdateAsync(id, dto);
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
                _logger?.LogError(ex, "Update approval request failed: {RequestId}", id);
                return StatusCode(500, new { message = "Không thể chỉnh sửa yêu cầu." });
            }
        }

        // PUT /api/approvalrequests/{id}/review
        [HttpPut("{id:int}/review")]
        public async Task<ActionResult<ApprovalRequestDto>> Review(int id, [FromBody] ReviewApprovalRequestDto dto)
        {
            try
            {
                var updated = await _managementService!.ReviewAsync(id, dto);
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
                _logger?.LogError(ex, "Review approval request failed: {RequestId}", id);
                return StatusCode(500, new { message = "Không thể xử lý yêu cầu." });
            }
        }
    }
}
