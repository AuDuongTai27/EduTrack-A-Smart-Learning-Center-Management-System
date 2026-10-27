using System;
using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class UpdateClassDto
    {
        [Required(ErrorMessage = "TÃªn lá»›p há»c khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")]
        [StringLength(150, ErrorMessage = "TÃªn lá»›p há»c khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 150 kÃ½ tá»±")]
        public string ClassName { get; set; } = null!;

        [Required(ErrorMessage = "MÃ´n há»c khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")]
        public int SubjectId { get; set; }

        [StringLength(50)]
        public string? Room { get; set; }

        public decimal TuitionFee { get; set; } = 0.00m;

        [Required(ErrorMessage = "NgÃ y báº¯t Ä‘áº§u khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Required(ErrorMessage = "Tráº¡ng thÃ¡i khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")]
        [StringLength(20)]
        public string Status { get; set; } = "active";
    }
}

