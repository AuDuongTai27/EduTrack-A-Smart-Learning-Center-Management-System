using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("approval_requests")]
    public class ApprovalRequest
    {
        [Key]
        [Column("request_id")]
        public int RequestId { get; set; }

        [Required]
        [StringLength(20)]
        [Column("request_code")]
        public string RequestCode { get; set; } = null!;

        [Required]
        [StringLength(50)]
        [Column("request_type")]
        public string RequestType { get; set; } = null!;

        [StringLength(255)]
        [Column("title")]
        public string? Title { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("student_id")]
        public int? StudentId { get; set; }

        [Column("invoice_id")]
        public int? InvoiceId { get; set; }

        [Column("class_id")]
        public int? ClassId { get; set; }

        [Column("requested_by")]
        public int RequestedBy { get; set; }

        [Column("reviewed_by")]
        public int? ReviewedBy { get; set; }

        [Required]
        [StringLength(20)]
        [Column("priority")]
        public string Priority { get; set; } = "medium";

        [Required]
        [StringLength(20)]
        [Column("status")]
        public string Status { get; set; } = "pending";

        [Column("reason")]
        public string? Reason { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }

        [Column("review_notes")]
        public string? ReviewNotes { get; set; }

        // Navigation Properties
        [ForeignKey("StudentId")]
        public virtual User? Student { get; set; }

        [ForeignKey("InvoiceId")]
        public virtual TuitionInvoice? Invoice { get; set; }

        [ForeignKey("ClassId")]
        public virtual Class? Class { get; set; }

        [ForeignKey("RequestedBy")]
        public virtual User Requester { get; set; } = null!;

        [ForeignKey("ReviewedBy")]
        public virtual User? Reviewer { get; set; }
    }
}
