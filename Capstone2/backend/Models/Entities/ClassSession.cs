using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("class_sessions")]
    public class ClassSession
    {
        [Key]
        [Column("session_id")]
        public int SessionId { get; set; }

        [Column("class_id")]
        public int ClassId { get; set; }

        [Column("schedule_id")]
        public int? ScheduleId { get; set; }

        // Original planned identity. Schedule mutations never change these values.
        [Column("schedule_version_id")]
        public int? ScheduleVersionId { get; set; }

        [Column("planned_occurrence_date")]
        public DateOnly? PlannedOccurrenceDate { get; set; }

        [Column("occurrence_week_start")]
        public DateOnly? OccurrenceWeekStart { get; private set; }

        public virtual ClassScheduleVersion? ScheduleVersion { get; set; }

        [Column("session_date")]
        public DateTime SessionDate { get; set; }

        [Column("start_time")]
        public TimeSpan StartTime { get; set; }

        [Column("end_time")]
        public TimeSpan EndTime { get; set; }

        [StringLength(50)]
        [Column("room")]
        public string? Room { get; set; }

        [Required]
        [StringLength(20)]
        [Column("status")]
        public string Status { get; set; } = "scheduled";

        // Navigation Properties
        [ForeignKey("ClassId")]
        public virtual Class Class { get; set; } = null!;

        [ForeignKey("ScheduleId")]
        public virtual ClassSchedule? Schedule { get; set; }

        public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    }
}
