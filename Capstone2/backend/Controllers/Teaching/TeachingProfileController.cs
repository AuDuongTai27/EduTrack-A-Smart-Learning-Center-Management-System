using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs.Teaching;
using EduTrack.API.Services.Teaching.Interfaces;

namespace EduTrack.API.Controllers.Teaching
{
    /// <summary>
    /// [Bounded Context: Teaching] Quản lý & Cập nhật Hồ sơ cá nhân của Teacher và TA
    /// Phụ trách: Nhóm Teacher & Teaching Assistant (Thành viên 2)
    /// </summary>
    [ApiController]
    [Route("api/teaching/profile")]
    [Tags("Teaching - Teacher & TA Profile")]
    public class TeachingProfileController : ControllerBase
    {
        private readonly ITeachingProfileService _profileService;

        public TeachingProfileController(ITeachingProfileService profileService)
        {
            _profileService = profileService;
        }

        /// <summary>
        /// Lấy thông tin hồ sơ chi tiết của Giáo viên hoặc Trợ giảng theo userId
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetProfile([FromQuery] int userId)
        {
            if (userId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã định danh người dùng (userId) không hợp lệ." });
            }

            var profile = await _profileService.GetProfileAsync(userId);
            if (profile == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy hồ sơ người dùng ID = {userId}" });
            }

            return Ok(new { success = true, data = profile });
        }

        /// <summary>
        /// Lấy thông tin hồ sơ theo route param /api/teaching/profile/{userId}
        /// </summary>
        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetProfileById(int userId)
        {
            return await GetProfile(userId);
        }

        /// <summary>
        /// Cập nhật thông tin hồ sơ cá nhân của Giáo viên hoặc Trợ giảng
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromQuery] int userId, [FromBody] UpdateTeacherProfileRequestDto request)
        {
            if (userId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã định danh người dùng (userId) không hợp lệ." });
            }

            if (request == null || string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest(new { success = false, message = "Họ và tên không được để trống." });
            }

            var updated = await _profileService.UpdateProfileAsync(userId, request);
            if (updated == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy hồ sơ người dùng ID = {userId}" });
            }

            return Ok(new
            {
                success = true,
                message = "Cập nhật hồ sơ cá nhân thành công!",
                data = updated
            });
        }

        /// <summary>
        /// Cập nhật hồ sơ theo route param /api/teaching/profile/{userId}
        /// </summary>
        [HttpPut("{userId:int}")]
        public async Task<IActionResult> UpdateProfileById(int userId, [FromBody] UpdateTeacherProfileRequestDto request)
        {
            return await UpdateProfile(userId, request);
        }
    }
}

