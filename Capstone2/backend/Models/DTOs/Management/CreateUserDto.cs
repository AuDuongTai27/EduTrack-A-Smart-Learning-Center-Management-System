using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class UserSubjectGradeInputDto
    {
        public int SubjectId { get; set; }
        public System.Collections.Generic.List<int> GradeIds { get; set; } = new();
    }

    public class CreateUserDto
    {
        [StringLength(20, ErrorMessage = "UserCode không được vượt quá 20 ký tự")]
        public string? UserCode { get; set; }

        [Required(ErrorMessage = "FullName là bắt buộc")]
        [StringLength(150, ErrorMessage = "FullName không được vượt quá 150 ký tự")]
        public string FullName { get; set; } = null!;

        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        [StringLength(150)]
        public string? Email { get; set; }

        [StringLength(20)]
        public string? Phone { get; set; }

        [Required(ErrorMessage = "Role là bắt buộc")]
        public string Role { get; set; } = "teacher";

        [StringLength(100)]
        public string? Specialty { get; set; }

        public System.Collections.Generic.List<UserSubjectGradeInputDto>? SubjectGrades { get; set; }

        public System.Collections.Generic.List<int>? SubjectIds { get; set; }

        public System.Collections.Generic.List<int>? GradeIds { get; set; }

        [StringLength(20)]
        public string? Gender { get; set; }

        public string? Password { get; set; }
    }
}
