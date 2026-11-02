using System;
using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class UpdateTuitionInvoiceDto
    {
        [Range(1, 12)]
        public byte PeriodMonth { get; set; }

        [Range(2000, 2100)]
        public short PeriodYear { get; set; }

        [Range(typeof(decimal), "0.01", "9999999999")]
        public decimal AmountDue { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [Required]
        public string Status { get; set; } = "unpaid";
    }
}