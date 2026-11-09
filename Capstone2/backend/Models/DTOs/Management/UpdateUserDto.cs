using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class UpdateUserDto
    {
        private int? _gradeId;
        [Range(1, int.MaxValue)]
        public int? GradeId
        {
            get => _gradeId;
            set { _gradeId = value; GradeSpecified = true; }
        }

        // Older callers omitting gradeId must not clear the saved grade.
        [System.Text.Json.Serialization.JsonIgnore]
        public bool GradeSpecified { get; private set; }

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
