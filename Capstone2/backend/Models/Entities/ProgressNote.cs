using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("progress_notes")]
    public class ProgressNote
    {
        [Key]
        [Column("note_id")]
        public int NoteId { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("class_id")]
        public int ClassId { get; set; }

        [Column("written_by")]
        public int WrittenBy { get; set; }

        [Required]
        [Column("content")]
        public string Content { get; set; } = null!;

        [Required]
        [StringLength(20)]
        [Column("note_type")]
        public string NoteType { get; set; } = "feedback";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("StudentId")]
        public virtual User Student { get; set; } = null!;

        [ForeignKey("ClassId")]
        public virtual Class Class { get; set; } = null!;

        [ForeignKey("WrittenBy")]
        public virtual User Author { get; set; } = null!;
    }
}
