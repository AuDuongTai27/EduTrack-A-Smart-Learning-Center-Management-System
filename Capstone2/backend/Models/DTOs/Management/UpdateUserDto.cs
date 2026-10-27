using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class UpdateUserDto
    {
        [Required(ErrorMessage = "FullName lÃ  báº¯t buá»™c")]
        [StringLength(150, ErrorMessage = "FullName khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 150 kÃ½ tá»±")]
        public string FullName { get; set; } = null!;

        [EmailAddress(ErrorMessage = "Email khÃ´ng Ä‘Ãºng Ä‘á»‹nh dáº¡ng")]
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
        [Required(ErrorMessage = "Status lÃ  báº¯t buá»™c")]
        [StringLength(20)]
        public string Status { get; set; } = "active";
    }
}

