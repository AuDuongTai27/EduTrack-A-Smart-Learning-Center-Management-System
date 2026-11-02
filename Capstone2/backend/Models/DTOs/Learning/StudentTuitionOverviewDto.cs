using System.Collections.Generic;

namespace EduTrack.API.Models.DTOs.Learning
{
    public class StudentTuitionOverviewDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public string DueDate { get; set; } = string.Empty;
        public string RemainingDaysText { get; set; } = string.Empty;
        public decimal TotalUnpaidAmount { get; set; }
        public List<TuitionInvoiceItemDto> UnpaidInvoices { get; set; } = new List<TuitionInvoiceItemDto>();
        public List<TuitionPaymentHistoryDto> PaymentHistory { get; set; } = new List<TuitionPaymentHistoryDto>();
    }

    public class TuitionInvoiceItemDto
    {
        public int InvoiceId { get; set; }
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public int PeriodMonth { get; set; }
        public int PeriodYear { get; set; }
        public decimal AmountDue { get; set; }
        public string DueDate { get; set; } = string.Empty;
        public string Status { get; set; } = "unpaid";
    }

    public class TuitionPaymentHistoryDto
    {
        public int PaymentId { get; set; }
        public int InvoiceId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaidAt { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string TransactionCode { get; set; } = string.Empty;
        public string Status { get; set; } = "Đã nộp";
    }

    public class PayStudentTuitionRequestDto
    {
        public int StudentId { get; set; } = 6;
        public int ParentId { get; set; } = 9;
        public string PaymentMethod { get; set; } = "bank_transfer";
        public List<int>? InvoiceIds { get; set; }
    }
}
