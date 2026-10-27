using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class CreateUserDto
    {
        [StringLength(20, ErrorMessage = "UserCode khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 20 kÃ½ tá»±")]
        public string? UserCode { get; set; }

        [Required(ErrorMessage = "FullName lÃ  báº¯t buá»™c")]
        [StringLength(150, ErrorMessage = "FullName khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 150 kÃ½ tá»±")]
        public string FullName { get; set; } = null!;

        [EmailAddress(ErrorMessage = "Email khÃ´ng Ä‘Ãºng Ä‘á»‹nh dáº¡ng")]
        [StringLength(150)]
        public string? Email { get; set; }

        [StringLength(20)]
        public string? Phone { get; set; }

        [Required(ErrorMessage = "Role lÃ  báº¯t buá»™c")]
        public string Role { get; set; } = "teacher";

        [StringLength(100)]
        public string? Specialty { get; set; }

        [StringLength(20)]
        public string? Gender { get; set; }

        public string? Password { get; set; }
    }
}

