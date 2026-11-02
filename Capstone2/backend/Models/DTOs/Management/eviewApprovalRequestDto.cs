using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class ReviewApprovalRequestDto
    {
        [Range(1, int.MaxValue)]
        public int ReviewedBy { get; set; }

        [Required]
        [RegularExpression("(?i)^(approved|rejected)$")]
        public string Status { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? ReviewNotes { get; set; }
    }
}