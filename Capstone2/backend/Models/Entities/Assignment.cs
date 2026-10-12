using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("assignments")]
    public class Assignment
    {
        [Key]
        [Column("assignment_id")]
        public int AssignmentId { get; set; }

        [Column("content_unit_id")]
        public int? ContentUnitId { get; set; }

        [Column("class_id")]
        public int ClassId { get; set; }

        [Required]
        [StringLength(200)]
        [Column("title")]
        public string Title { get; set; } = null!;

        [Column("description")]
        public string? Description { get; set; }

        [StringLength(500)]
        [Column("file_url")]
        public string? FileUrl { get; set; }

        [Column("due_date")]
        public DateTime DueDate { get; set; }

        [Column("max_score", TypeName = "decimal(5,2)")]
        public decimal MaxScore { get; set; } = 10.00m;

        [Column("created_by")]
        public int CreatedBy { get; set; }

        [Column("answer_key_text")]
        public string? AnswerKeyText { get; set; }

        [StringLength(500)]
        [Column("answer_key_file_url")]
        public string? AnswerKeyFileUrl { get; set; }

        [Column("rubric_json", TypeName = "json")]
        public string? RubricJson { get; set; }

        [Column("is_ai_grading_enabled")]
        public bool IsAiGradingEnabled { get; set; } = true;

        // Navigation Properties
        [ForeignKey("ClassId")]
        public virtual Class Class { get; set; } = null!;

        [ForeignKey("ContentUnitId")]
        public virtual ContentUnit? ContentUnit { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual User Creator { get; set; } = null!;

        public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }
}
