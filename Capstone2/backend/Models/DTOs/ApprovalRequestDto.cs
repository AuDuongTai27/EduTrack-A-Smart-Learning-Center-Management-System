using System;

namespace EduTrack.API.Models.DTOs
{
    public class ApprovalRequestDto
    {
        public int RequestId { get; set; }
        public string RequestCode { get; set; } = null!;
        public string RequestType { get; set; } = null!;
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? StudentId { get; set; }
        public string? StudentName { get; set; }
        public int? InvoiceId { get; set; }
        public int? ClassId { get; set; }
        public string? ClassName { get; set; }
        public int RequestedBy { get; set; }
        public string RequesterName { get; set; } = null!;
        public int? ReviewedBy { get; set; }
        public string? ReviewerName { get; set; }
        public string Priority { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? Reason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
    }
}
