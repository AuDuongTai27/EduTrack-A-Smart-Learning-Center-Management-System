using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Teaching;
using EduTrack.API.Services.Teaching.Interfaces;

namespace EduTrack.API.Controllers.Teaching
{
    /// <summary>
    /// [Bounded Context: Teaching] Gửi & Chỉnh sửa Đơn từ, Đề xuất Giảng dạy & Yêu cầu Hỗ trợ của Teacher/TA
    /// Phụ trách: Nhóm Teacher & Teaching Assistant (Thành viên 2)
    /// </summary>
    [ApiController]
    [Route("api/teaching/requests")]
    [Tags("Teaching - Teacher & TA Requests")]
    public class TeachingRequestsController : ControllerBase
    {
        private readonly ITeachingRequestService _requestService;

        public TeachingRequestsController(ITeachingRequestService requestService)
        {
            _requestService = requestService;
        }

        /// <summary>
        /// Lấy danh sách đơn từ và yêu cầu đã gửi của Giáo viên hoặc Trợ giảng
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<ApprovalRequestDto>>> GetRequests([FromQuery] int userId, [FromQuery] string? status)
        {
            if (userId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã định danh người dùng (userId) không hợp lệ." });
            }

            var result = await _requestService.GetTeachingRequestsAsync(userId, status);
            return Ok(new { success = true, data = result });
        }

        /// <summary>
        /// Gửi đơn yêu cầu mới từ Giáo viên / Trợ giảng (Mặc định ở trạng thái 'Chưa xem xét giải quyết', cho phép Edit)
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApprovalRequestDto>> CreateRequest([FromBody] CreateTeachingRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _requestService.CreateTeachingRequestAsync(dto);
            return StatusCode(StatusCodes.Status201Created, new
            {
                success = true,
                message = "Gửi đơn yêu cầu thành công!",
                data = result
            });
        }

        /// <summary>
        /// Chỉnh sửa nội dung đơn yêu cầu (Chỉ được phép sửa khi đơn ở trạng thái 'Chưa xem xét giải quyết' - chưa có Reviewer tiếp nhận)
        /// </summary>
        [HttpPut("{requestId:int}")]
        public async Task<IActionResult> UpdateRequest(int requestId, [FromBody] UpdateTeachingRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await _requestService.UpdateTeachingRequestAsync(requestId, dto);
                if (updated == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy đơn yêu cầu #{requestId}" });
                }

                return Ok(new
                {
                    success = true,
                    message = "Cập nhật đơn yêu cầu thành công!",
                    data = updated
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
