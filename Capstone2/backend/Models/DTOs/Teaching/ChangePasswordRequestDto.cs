using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Teaching
{
    /// <summary>
    /// DTO yêu cầu đổi mật khẩu cho Teacher / TA
    /// </summary>
    public class ChangePasswordRequestDto
    {
        [Required(ErrorMessage = "Mật khẩu hiện tại không được để trống.")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu mới không được để trống.")]
        [MinLength(6, ErrorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự.")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Xác nhận mật khẩu mới không được để trống.")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}

