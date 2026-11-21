using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Auth
{
    public class LoginRequestDto
    {
        /// <summary>
        /// Số điện thoại hoặc Email
        /// </summary>
        [Required(ErrorMessage = "Vui lòng nhập Email hoặc Số điện thoại.")]
        public string Identifier { get; set; } = string.Empty;

        /// <summary>
        /// Mật khẩu đăng nhập
        /// </summary>
        [Required(ErrorMessage = "Vui lòng nhập mật khẩu.")]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthUserDto
    {
        public int UserId { get; set; }
        public string UserCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public string Status { get; set; } = "active";
        public int? GradeId { get; set; }
        public string? GradeName { get; set; }
        public string? Specialty { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        public string PrimaryRole { get; set; } = string.Empty;
        public string RedirectPath { get; set; } = "/";
    }

    public class LoginResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public AuthUserDto? User { get; set; }
    }
}
