using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class CreateSubjectDto
    {
        [Required(ErrorMessage = "SubjectCode lÃ  báº¯t buá»™c")]
        [StringLength(20, ErrorMessage = "SubjectCode khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 20 kÃ½ tá»±")]
        public string SubjectCode { get; set; } = null!;

        [Required(ErrorMessage = "SubjectName lÃ  báº¯t buá»™c")]
        [StringLength(100, ErrorMessage = "SubjectName khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 100 kÃ½ tá»±")]
        public string SubjectName { get; set; } = null!;

        public string? Description { get; set; }
    }
}

