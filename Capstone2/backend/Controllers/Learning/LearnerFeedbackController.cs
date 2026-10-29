using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs.Learning;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Learning.Interfaces;

namespace EduTrack.API.Controllers.Learning
{
    /// <summary>
    /// [Bounded Context: Learning] Gửi & Chỉnh sửa Ý kiến Phản hồi (Feedback) của Học sinh / Phụ huynh về Admin Staff
    /// Phụ trách: Nhóm Student & Parent (Thành viên 3)
    /// </summary>
    [ApiController]
    [Route("api/learning/feedback")]
    [Tags("Learning - Student & Parent Feedback")]
    public class LearnerFeedbackController : ControllerBase
    {
        private readonly ILearnerDashboardService _dashboardService;
        private readonly IApprovalRequestService _requestService;

        public LearnerFeedbackController(
            ILearnerDashboardService dashboardService,
            IApprovalRequestService requestService)
        {
            _dashboardService = dashboardService;
            _requestService = requestService;
        }

        /// <summary>
        /// Lấy lịch sử Phản hồi (request_type = 'feedback') của Học sinh hoặc Phụ huynh
        /// </summary>
        [HttpGet("user/{userId:int}")]
        public async Task<IActionResult> GetLearnerFeedbacks(int userId, [FromQuery] int? studentId = null)
        {
            var data = await _dashboardService.GetLearnerFeedbacksAsync(userId, studentId);
            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Học sinh hoặc Phụ huynh gửi Phản hồi mới tới Admin Staff (Mặc định request_type = 'feedback', trạng thái 'Chưa xem xét giải quyết' cho phép Edit)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateLearnerFeedback([FromBody] CreateLearnerFeedbackRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest(new { success = false, message = "Tiêu đề và nội dung phản hồi không được để trống." });
            }

            var created = await _dashboardService.CreateLearnerFeedbackAsync(request);
            return StatusCode(StatusCodes.Status201Created, new
            {
                success = true,
                message = "Đã gửi phản hồi thành công lên hệ thống Giáo vụ!",
                data = created
            });
        }

        /// <summary>
        /// Chỉnh sửa nội dung Phản hồi (Chỉ được phép sửa khi đơn đang ở trạng thái 'Chưa xem xét giải quyết' - Admin Staff chưa tiếp nhận)
        /// </summary>
        [HttpPut("{requestId:int}")]
        public async Task<IActionResult> UpdateLearnerFeedback(int requestId, [FromBody] UpdateLearnerFeedbackRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest(new { success = false, message = "Tiêu đề và nội dung phản hồi không được để trống." });
            }

            try
            {
                var updated = await _dashboardService.UpdateLearnerFeedbackAsync(requestId, request);
                if (updated == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy phản hồi #{requestId}" });
                }

                return Ok(new
                {
                    success = true,
                    message = "Đã cập nhật nội dung phản hồi thành công!",
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
