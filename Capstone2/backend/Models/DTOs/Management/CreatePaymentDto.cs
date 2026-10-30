using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class CreatePaymentDto
    {
        [Range(typeof(decimal), "0.01", "9999999999")]
        public decimal Amount { get; set; }

        [Required]
        public string PaymentMethod { get; set; } = "bank_transfer";

        [StringLength(100)]
        public string? TransactionCode { get; set; }

        public int? PaidByUserId { get; set; }

        public int? RecordedBy { get; set; }

        public string? Note { get; set; }
    }
}