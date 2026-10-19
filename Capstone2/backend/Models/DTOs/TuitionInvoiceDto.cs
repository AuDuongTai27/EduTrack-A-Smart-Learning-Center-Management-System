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
        public string ClassName { get; set; } = null!;
        public decimal AmountDue { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = null!;
    }
}
