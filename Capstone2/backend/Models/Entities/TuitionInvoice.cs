using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("tuition_invoices")]
    public class TuitionInvoice
    {
        [Key]
        [Column("invoice_id")]
        public int InvoiceId { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("class_id")]
        public int ClassId { get; set; }

        [Column("period_month")]
        public byte PeriodMonth { get; set; }

        [Column("period_year")]
        public short PeriodYear { get; set; }

        [Column("amount_due", TypeName = "decimal(12,2)")]
        public decimal AmountDue { get; set; }

        [Column("due_date")]
        public DateTime DueDate { get; set; }

        [Required]
        [StringLength(20)]
        [Column("status")]
        public string Status { get; set; } = "unpaid";

        // Navigation Properties
        [ForeignKey("StudentId")]
        public virtual User Student { get; set; } = null!;

        [ForeignKey("ClassId")]
        public virtual Class Class { get; set; } = null!;

        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public virtual ICollection<ApprovalRequest> ApprovalRequests { get; set; } = new List<ApprovalRequest>();
    }
}
