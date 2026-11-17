using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class UpdateApprovalRequestDto
    {
        public int RequestedBy { get; set; }

        [Required(ErrorMessage = "Loại yêu cầu không được để trống")]
        [StringLength(50)]
        public string RequestType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tiêu đề yêu cầu không được để trống")]
        [StringLength(255, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Lý do yêu cầu không được để trống")]
        [StringLength(2000, MinimumLength = 1)]
        public string Reason { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Description { get; set; }

        [Required]
        [StringLength(20)]
        public string Priority { get; set; } = "medium";

        [Range(1, int.MaxValue)]
        public int? StudentId { get; set; }

        [Range(1, int.MaxValue)]
        public int? ClassId { get; set; }

        [Range(1, int.MaxValue)]
        public int? InvoiceId { get; set; }
    }
}
