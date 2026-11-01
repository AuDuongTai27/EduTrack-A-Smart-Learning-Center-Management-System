using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Teaching;
using EduTrack.API.Services.Teaching.Interfaces;

namespace EduTrack.API.Controllers.Teaching
{
    /// <summary>
    /// [Bounded Context: Teaching] Gửi Đơn từ, Đề xuất Giảng dạy & Yêu cầu Hỗ trợ của Teacher/TA
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

        // POST /api/teaching/requests
        [HttpPost]
        public async Task<ActionResult<ApprovalRequestDto>> CreateRequest([FromBody] CreateTeachingRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _requestService.CreateTeachingRequestAsync(dto);
            return Ok(result);
        }
    }
}
