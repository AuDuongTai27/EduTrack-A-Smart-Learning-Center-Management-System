using System;

namespace EduTrack.API.Models.DTOs
{
    public class PaymentDto
    {
        public int PaymentId { get; set; }
        public int InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = null!;
        public string? TransactionCode { get; set; }
        public DateTime PaidAt { get; set; }
        public int? PaidByUserId { get; set; }
        public string? PayerName { get; set; }
        public int? RecordedBy { get; set; }
        public string? RecorderName { get; set; }
        public string? Note { get; set; }
    }
}
