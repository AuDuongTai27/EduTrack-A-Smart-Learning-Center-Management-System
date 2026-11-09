using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities;

[Table("class_schedule_versions")]
public sealed class ClassScheduleVersion
{
    [Key, Column("schedule_version_id")] public int ScheduleVersionId { get; set; }
    [Column("schedule_id")] public int ScheduleId { get; set; }
    [Column("effective_from")] public DateOnly EffectiveFrom { get; set; }
    [Column("effective_to")] public DateOnly? EffectiveTo { get; set; }
    [Required, StringLength(20), Column("day_of_week")] public string DayOfWeek { get; set; } = "";
    [Column("start_time")] public TimeSpan StartTime { get; set; }
    [Column("end_time")] public TimeSpan EndTime { get; set; }
    [StringLength(50), Column("room")] public string? Room { get; set; }
    public ClassSchedule Schedule { get; set; } = null!;
    public ICollection<ClassSession> ClassSessions { get; set; } = new List<ClassSession>();
}
