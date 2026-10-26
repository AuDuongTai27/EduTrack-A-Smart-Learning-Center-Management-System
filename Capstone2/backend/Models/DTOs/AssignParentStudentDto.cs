using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs
{
    public class AssignParentStudentDto
    {
        [Required(ErrorMessage = "ParentId là bắt buộc")]
        public int ParentId { get; set; }

        [Required(ErrorMessage = "StudentId là bắt buộc")]
        public int StudentId { get; set; }

        [Required(ErrorMessage = "Relationship là bắt buộc")]
        [StringLength(50)]
        public string Relationship { get; set; } = "Parent";

        public bool IsPrimaryContact { get; set; } = true;
    }
}
