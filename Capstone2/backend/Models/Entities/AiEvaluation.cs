using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("ai_evaluations")]
    public class AiEvaluation
    {
        [Key]
        [Column("evaluation_id")]
        public int EvaluationId { get; set; }

        [Column("submission_id")]
        public int SubmissionId { get; set; }

        [Column("requested_by")]
        public int RequestedBy { get; set; }

        [Column("ai_score", TypeName = "decimal(5,2)")]
        public decimal? AiScore { get; set; }

        [Column("ai_feedback")]
        public string? AiFeedback { get; set; }

        [Column("raw_response")]
        public string? RawResponse { get; set; }

        [Required]
        [StringLength(20)]
        [Column("status")]
        public string Status { get; set; } = null!;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("SubmissionId")]
        public virtual Submission Submission { get; set; } = null!;

        [ForeignKey("RequestedBy")]
        public virtual User Requester { get; set; } = null!;
    }
}
