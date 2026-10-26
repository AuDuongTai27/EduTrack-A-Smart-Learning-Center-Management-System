using System;
using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs
{
    public class CreateClassDto
    {
        [Required(ErrorMessage = "Tên lớp học không được để trống")]
        [StringLength(150, ErrorMessage = "Tên lớp học không được vượt quá 150 ký tự")]
        public string ClassName { get; set; } = null!;

        [Required(ErrorMessage = "Môn học không được để trống")]
        public int SubjectId { get; set; }

        [StringLength(50)]
        public string? Room { get; set; }

        public decimal TuitionFee { get; set; } = 0.00m;

        [Required(ErrorMessage = "Ngày bắt đầu không được để trống")]
        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        public DateTime? EndDate { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "active";
    }
}
