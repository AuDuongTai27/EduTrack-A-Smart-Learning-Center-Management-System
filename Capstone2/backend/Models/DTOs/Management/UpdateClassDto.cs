using System;
using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class UpdateClassDto
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
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Required(ErrorMessage = "Trạng thái không được để trống")]
        [StringLength(20)]
        public string Status { get; set; } = "active";
    }
}
