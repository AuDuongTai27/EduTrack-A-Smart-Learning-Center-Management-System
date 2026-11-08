using System;

namespace EduTrack.API.Models.DTOs
{
    public class TuitionInvoiceDto
    {
        public int InvoiceId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = null!;
        public string StudentCode { get; set; } = null!;
        public int ClassId { get; set; }
        public int? ClassGradeId { get; set; }
        public string? ClassGradeName { get; set; }
        public string ClassName { get; set; } = null!;
        public byte PeriodMonth { get; set; }
        public short PeriodYear { get; set; }
        public decimal AmountDue { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = null!;
    }
}
