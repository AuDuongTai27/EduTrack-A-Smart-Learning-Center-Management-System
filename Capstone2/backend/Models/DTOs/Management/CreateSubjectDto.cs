using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class CreateSubjectDto
    {
        [Required(ErrorMessage = "SubjectCode là bắt buộc")]
        [StringLength(20, ErrorMessage = "SubjectCode không được vượt quá 20 ký tự")]
        public string SubjectCode { get; set; } = null!;

        [Required(ErrorMessage = "SubjectName là bắt buộc")]
        [StringLength(100, ErrorMessage = "SubjectName không được vượt quá 100 ký tự")]
        public string SubjectName { get; set; } = null!;

        public string? Description { get; set; }
    }
}
