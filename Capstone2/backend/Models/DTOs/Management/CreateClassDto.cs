using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using EduTrack.API.Services.Management;

namespace EduTrack.API.Models.DTOs.Management
{
    public class CreateClassDto : IValidatableObject
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

        [StringLength(20)]
        public string Status { get; set; } = "active";

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext) =>
            ClassValidation.Validate(ClassName, SubjectId, Room, TuitionFee, StartDate, EndDate, Status, creating: true);
    }
}
