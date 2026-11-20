using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using EduTrack.API.Helpers.Auth;
using EduTrack.API.Models.DTOs.Auth;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;

namespace EduTrack.API.Controllers.Auth
{
    /// <summary>
    /// API Xác thực Đăng nhập (Authentication) bằng Số điện thoại hoặc Email
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    [Tags("Authentication")]
    public class AuthController : ControllerBase
    {
        private readonly EduTrackDbContext _db;
        private readonly IConfiguration _configuration;

        public AuthController(EduTrackDbContext db, IConfiguration configuration)
        {
            _db = db;
            _configuration = configuration;
        }

        /// <summary>
        /// Đăng nhập hệ thống bằng Số điện thoại hoặc Email (Gmail)
        /// POST: /api/auth/login
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto dto, CancellationToken ct)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Identifier) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new LoginResponseDto
                {
                    Success = false,
                    Message = "Vui lòng nhập Email hoặc Số điện thoại và Mật khẩu."
                });
            }

            var rawIdentifier = dto.Identifier.Trim();
            var lowerIdentifier = rawIdentifier.ToLowerInvariant();
            var normalizedPhone = JwtAuthHelper.NormalizePhone(rawIdentifier);

            // Truy vấn ứng viên khớp Email hoặc Số điện thoại (chỉ cho phép Email hoặc Số điện thoại, không đăng nhập bằng UserCode)
            var candidates = await _db.Users
                .AsNoTracking()
                .Include(u => u.Grade)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Where(u =>
                    (u.Email != null && u.Email.ToLower() == lowerIdentifier) ||
                    (u.Phone != null && u.Phone == rawIdentifier) ||
                    (!string.IsNullOrEmpty(normalizedPhone) && u.Phone != null && u.Phone.Replace(" ", "").Replace("-", "").Replace(".", "") == normalizedPhone))
                .ToListAsync(ct);

            // Nếu người dùng nhập SĐT có định dạng đặc biệt (+84...), lọc chính xác thêm ở bộ nhớ
            User? matchedUser = candidates.FirstOrDefault(u =>
                (!string.IsNullOrWhiteSpace(u.Email) && string.Equals(u.Email.Trim(), rawIdentifier, StringComparison.OrdinalIgnoreCase)) ||
                (!string.IsNullOrWhiteSpace(u.Phone) && !string.IsNullOrEmpty(normalizedPhone) && JwtAuthHelper.NormalizePhone(u.Phone) == normalizedPhone));

            if (matchedUser == null)
            {
                return Unauthorized(new LoginResponseDto
                {
                    Success = false,
                    Message = "Không tìm thấy tài khoản với Email hoặc Số điện thoại này."
                });
            }

            if (!string.Equals(matchedUser.Status, "active", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, new LoginResponseDto
                {
                    Success = false,
                    Message = "Tài khoản của bạn hiện đang bị khóa hoặc tạm ngưng hoạt động. Vui lòng liên hệ trung tâm."
                });
            }

            if (!JwtAuthHelper.VerifyPassword(dto.Password, matchedUser.PasswordHash))
            {
                return Unauthorized(new LoginResponseDto
                {
                    Success = false,
                    Message = "Mật khẩu không chính xác. Vui lòng kiểm tra lại."
                });
            }

            var authUser = MapToAuthUserDto(matchedUser);
            var token = JwtAuthHelper.GenerateToken(authUser, JwtAuthHelper.GetSecretKey(_configuration));

            return Ok(new LoginResponseDto
            {
                Success = true,
                Message = $"Đăng nhập thành công! Xin chào {authUser.FullName}.",
                Token = token,
                User = authUser
            });
        }

        /// <summary>
        /// Lấy thông tin người dùng hiện tại từ JWT Token
        /// GET: /api/auth/me
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<AuthUserDto>> GetCurrentUser(CancellationToken ct)
        {
            var userIdStr = User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId) || userId <= 0)
            {
                return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." });
            }

            var user = await _db.Users
                .AsNoTracking()
                .Include(u => u.Grade)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId, ct);

            if (user == null || !string.Equals(user.Status, "active", StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized(new { message = "Tài khoản không tồn tại hoặc đã ngưng hoạt động." });
            }

            return Ok(MapToAuthUserDto(user));
        }

        private static AuthUserDto MapToAuthUserDto(User u)
        {
            var roles = u.UserRoles?
                .Where(ur => ur.Role != null && !string.IsNullOrWhiteSpace(ur.Role.RoleName))
                .Select(ur => JwtAuthHelper.NormalizeRoleName(ur.Role.RoleName))
                .Distinct()
                .ToList() ?? new List<string>();

            if (roles.Count == 0)
            {
                roles.Add("student");
            }

            var primaryRole = JwtAuthHelper.ResolvePrimaryRole(roles);
            var redirectPath = JwtAuthHelper.ResolveRedirectPath(primaryRole);

            return new AuthUserDto
            {
                UserId = u.UserId,
                UserCode = u.UserCode,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                AvatarUrl = u.AvatarUrl,
                Status = u.Status,
                GradeId = u.GradeId,
                GradeName = u.Grade?.GradeName,
                Specialty = u.Specialty,
                Roles = roles,
                PrimaryRole = primaryRole,
                RedirectPath = redirectPath
            };
        }
    }
}
