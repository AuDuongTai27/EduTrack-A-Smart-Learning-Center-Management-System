using System;
using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Teaching
{
    public class CreateTeachingRequestDto
    {
        [Required(ErrorMessage = "Loại đơn không được để trống")]
        [StringLength(50)]
        public string RequestType { get; set; } = "leave_request"; // leave_request, schedule_change, teaching_support

        [Required(ErrorMessage = "Tiêu đề đơn không được để trống")]
        [StringLength(255)]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "Nội dung yêu cầu không được để trống")]
        public string Description { get; set; } = null!;

        public int? ClassId { get; set; }

        public int? StudentId { get; set; }

        public int RequestedBy { get; set; } = 2;

        [StringLength(20)]
        public string Priority { get; set; } = "medium";

        public string? Reason { get; set; }
    }

    public class UpdateTeachingRequestDto
    {
        [Required(ErrorMessage = "Tiêu đề đơn không được để trống")]
        [StringLength(255)]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "Nội dung yêu cầu không được để trống")]
        public string Description { get; set; } = null!;

        [StringLength(50)]
        public string? RequestType { get; set; }

        public int? ClassId { get; set; }

        public int? StudentId { get; set; }

        [StringLength(20)]
        public string? Priority { get; set; }

        public string? Reason { get; set; }
    }
}
