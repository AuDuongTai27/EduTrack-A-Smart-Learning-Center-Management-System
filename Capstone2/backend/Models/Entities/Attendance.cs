using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("attendance")]
    public class Attendance
    {
        [Key]
        [Column("attendance_id")]
        public int AttendanceId { get; set; }

        [Column("session_id")]
        public int SessionId { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Required]
        [StringLength(20)]
        [Column("status")]
        public string Status { get; set; } = "present";

        [StringLength(255)]
        [Column("note")]
        public string? Note { get; set; }

        [Column("recorded_by")]
        public int RecordedBy { get; set; }

        [Column("recorded_at")]
        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("SessionId")]
        public virtual ClassSession Session { get; set; } = null!;

        [ForeignKey("StudentId")]
        public virtual User Student { get; set; } = null!;

        [ForeignKey("RecordedBy")]
        public virtual User Recorder { get; set; } = null!;
    }
}
