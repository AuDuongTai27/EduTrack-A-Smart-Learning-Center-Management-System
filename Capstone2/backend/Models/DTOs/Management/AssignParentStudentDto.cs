using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class AssignParentStudentDto
    {
        [Required(ErrorMessage = "ParentId lÃ  báº¯t buá»™c")]
        public int ParentId { get; set; }

        [Required(ErrorMessage = "StudentId lÃ  báº¯t buá»™c")]
        public int StudentId { get; set; }

        [Required(ErrorMessage = "Relationship lÃ  báº¯t buá»™c")]
        [StringLength(50)]
        public string Relationship { get; set; } = "Parent";

        public bool IsPrimaryContact { get; set; } = true;
    }
}

