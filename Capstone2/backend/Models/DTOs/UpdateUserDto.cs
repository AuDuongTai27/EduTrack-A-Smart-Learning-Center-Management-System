using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs
{
    public class UpdateUserDto
    {
        [Required(ErrorMessage = "FullName là bắt buộc")]
        [StringLength(150, ErrorMessage = "FullName không được vượt quá 150 ký tự")]
        public string FullName { get; set; } = null!;

        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        [StringLength(150)]
        public string? Email { get; set; }

        [StringLength(20)]
        public string? Phone { get; set; }

        public string? Role { get; set; }

        [StringLength(100)]
        public string? Specialty { get; set; }

        [StringLength(20)]
        public string? Gender { get; set; }

        [StringLength(20)]
        public string? Status { get; set; }
    }

    public class UpdateUserStatusDto
    {
        [Required(ErrorMessage = "Status là bắt buộc")]
        [StringLength(20)]
        public string Status { get; set; } = "active";
    }
}
