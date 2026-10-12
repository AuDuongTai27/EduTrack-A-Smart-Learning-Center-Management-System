using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("submissions")]
    public class Submission
    {
        [Key]
        [Column("submission_id")]
        public int SubmissionId { get; set; }

        [Column("assignment_id")]
        public int AssignmentId { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [StringLength(500)]
        [Column("file_url")]
        public string? FileUrl { get; set; }

        [Column("submitted_at")]
        public DateTime? SubmittedAt { get; set; }

        [Column("score", TypeName = "decimal(5,2)")]
        public decimal? Score { get; set; }

        [Column("feedback")]
        public string? Feedback { get; set; }

        [Column("ai_score", TypeName = "decimal(5,2)")]
        public decimal? AiScore { get; set; }

        [Column("ai_feedback_json", TypeName = "json")]
        public string? AiFeedbackJson { get; set; }

        [Required]
        [StringLength(20)]
        [Column("status")]
        public string Status { get; set; } = "submitted";

        [Column("graded_by")]
        public int? GradedBy { get; set; }

        // Navigation Properties
        [ForeignKey("AssignmentId")]
        public virtual Assignment Assignment { get; set; } = null!;

        [ForeignKey("StudentId")]
        public virtual User Student { get; set; } = null!;

        [ForeignKey("GradedBy")]
        public virtual User? Grader { get; set; }

        public virtual ICollection<AiEvaluation> AiEvaluations { get; set; } = new List<AiEvaluation>();
    }
}
