using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs.Landing;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    /// <summary>
    /// [Public Portal] API phục vụ toàn bộ dữ liệu thật cho Landing Page
    /// </summary>
    [ApiController]
    [Route("api/landing")]
    [Tags("Landing - Public Portal")]
    public class LandingPortalController : ControllerBase
    {
        private readonly ILandingPortalService _landingService;

        public LandingPortalController(ILandingPortalService landingService)
        {
            _landingService = landingService;
        }

        /// <summary>
        /// Lấy toàn bộ dữ liệu tổng hợp cho trang Landing Page (Quy mô, Khóa học, Môn học, Giảng viên, Cấu hình)
        /// GET: api/landing/overview
        /// </summary>
        [HttpGet("overview")]
        public async Task<IActionResult> GetLandingOverview()
        {
            var data = await _landingService.GetLandingOverviewAsync();
            return Ok(new
            {
                success = true,
                message = "Tải dữ liệu Landing Page thành công.",
                data
            });
        }

        [HttpGet("classes")]
        public async Task<IActionResult> GetClasses([FromQuery] int? subjectId, [FromQuery] int page = 1,
            [FromQuery] int pageSize = 3, System.Threading.CancellationToken ct = default)
        {
            if ((subjectId.HasValue && subjectId <= 0) || page < 1 || page > 10000 || pageSize < 1 || pageSize > 12)
                return BadRequest(new { success = false, message = "Invalid class filters. Use a positive subjectId, page 1–10000, and pageSize 1–12." });
            return Ok(new { success = true, data = await _landingService.GetClassesAsync(subjectId, page, pageSize, ct) });
        }

        /// <summary>
        /// Tiếp nhận đăng ký nhận bản tin tuyển sinh từ khách hàng trên Landing Page
        /// POST: api/landing/newsletter
        /// </summary>
        [HttpPost("newsletter")]
        public async Task<IActionResult> SubscribeNewsletter([FromBody] SubscribeNewsletterRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Vui lòng nhập địa chỉ email hợp lệ."
                });
            }

            var success = await _landingService.RecordNewsletterSubscriptionAsync(request.Email);
            if (!success)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Địa chỉ email không đúng định dạng."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Đăng ký nhận bản tin thành công! EduTrack sẽ gửi thông tin sớm nhất đến bạn."
            });
        }
    }
}

