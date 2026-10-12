using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("payment")]
    public class Payment
    {
        [Key]
        [Column("payment_id")]
        public int PaymentId { get; set; }

        [Column("invoice_id")]
        public int InvoiceId { get; set; }

        [Column("amount", TypeName = "decimal(12,2)")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(30)]
        [Column("payment_method")]
        public string PaymentMethod { get; set; } = "bank_transfer";

        [StringLength(100)]
        [Column("transaction_code")]
        public string? TransactionCode { get; set; }

        [Column("paid_at")]
        public DateTime PaidAt { get; set; } = DateTime.UtcNow;

        [Column("paid_by_user_id")]
        public int? PaidByUserId { get; set; }

        [Column("recorded_by")]
        public int? RecordedBy { get; set; }

        [Column("note")]
        public string? Note { get; set; }

        // Navigation Properties
        [ForeignKey("InvoiceId")]
        public virtual TuitionInvoice Invoice { get; set; } = null!;

        [ForeignKey("PaidByUserId")]
        public virtual User? Payer { get; set; }

        [ForeignKey("RecordedBy")]
        public virtual User? Recorder { get; set; }
    }
}
