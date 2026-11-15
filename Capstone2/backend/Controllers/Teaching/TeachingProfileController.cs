using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Helpers.Auth;
using EduTrack.API.Models.DTOs.Teaching;
using EduTrack.API.Services.Teaching.Interfaces;

namespace EduTrack.API.Controllers.Teaching
{
    /// <summary>
    /// [Bounded Context: Teaching] Quản lý & Cập nhật Hồ sơ cá nhân của Teacher và TA
    /// Phụ trách: Nhóm Teacher & Teaching Assistant (Thành viên 2)
    /// </summary>
    [ApiController]
    [Authorize(Roles = JwtAuthHelper.RolesTeaching)]
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
        /// GET: api/teaching/profile/{userId}
        /// </summary>
        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            var effectiveUserId = JwtAuthHelper.ResolveEffectiveUserId(User, userId, JwtAuthHelper.RoleTeacher, JwtAuthHelper.RoleTeachingAssistant);
            if (effectiveUserId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã định danh người dùng (userId) không hợp lệ." });
            }

            var profile = await _profileService.GetProfileAsync(effectiveUserId);
            if (profile == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy hồ sơ người dùng ID = {effectiveUserId}" });
            }

            return Ok(new { success = true, data = profile });
        }

        /// <summary>
        /// Cập nhật thông tin hồ sơ cá nhân của Giáo viên hoặc Trợ giảng
        /// PUT: api/teaching/profile/{userId}
        /// </summary>
        [HttpPut("{userId:int}")]
        public async Task<IActionResult> UpdateProfile(int userId, [FromBody] UpdateTeacherProfileRequestDto request)
        {
            var effectiveUserId = JwtAuthHelper.ResolveEffectiveUserId(User, userId, JwtAuthHelper.RoleTeacher, JwtAuthHelper.RoleTeachingAssistant);
            if (effectiveUserId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã định danh người dùng (userId) không hợp lệ." });
            }

            if (request == null || string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest(new { success = false, message = "Họ và tên không được để trống." });
            }

            var updated = await _profileService.UpdateProfileAsync(effectiveUserId, request);
            if (updated == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy hồ sơ người dùng ID = {effectiveUserId}" });
            }

            return Ok(new
            {
                success = true,
                message = "Cập nhật hồ sơ cá nhân thành công!",
                data = updated
            });
        }

        /// <summary>
        /// Đổi mật khẩu tài khoản Giáo viên hoặc Trợ giảng
        /// POST: api/teaching/profile/{userId}/change-password
        /// </summary>
        [HttpPost("{userId:int}/change-password")]
        public async Task<IActionResult> ChangePassword(int userId, [FromBody] ChangePasswordRequestDto request)
        {
            var effectiveUserId = JwtAuthHelper.ResolveEffectiveUserId(User, userId, JwtAuthHelper.RoleTeacher, JwtAuthHelper.RoleTeachingAssistant);
            if (effectiveUserId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã định danh người dùng (userId) không hợp lệ." });
            }

            var result = await _profileService.ChangePasswordAsync(effectiveUserId, request);
            if (!result.Success)
            {
                return BadRequest(new { success = false, message = result.Message });
            }

            return Ok(new
            {
                success = true,
                message = result.Message
            });
        }
    }
}
