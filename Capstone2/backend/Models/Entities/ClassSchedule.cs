using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("class_schedules")]
    public class ClassSchedule
    {
        [Key]
        [Column("schedule_id")]
        public int ScheduleId { get; set; }

        [Column("class_id")]
        public int ClassId { get; set; }

        [Required]
        [StringLength(20)]
        [Column("day_of_week")]
        public string DayOfWeek { get; set; } = null!;

        [Column("start_time")]
        public TimeSpan StartTime { get; set; }

        [Column("end_time")]
        public TimeSpan EndTime { get; set; }

        [StringLength(50)]
        [Column("room")]
        public string? Room { get; set; }

        // Navigation Properties
        [ForeignKey("ClassId")]
        public virtual Class Class { get; set; } = null!;

        public virtual ICollection<ClassSession> ClassSessions { get; set; } = new List<ClassSession>();
    }
}
