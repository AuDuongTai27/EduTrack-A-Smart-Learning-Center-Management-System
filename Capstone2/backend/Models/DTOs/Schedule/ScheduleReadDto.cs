namespace EduTrack.API.Models.DTOs.Schedule;

public sealed class ScheduleQuery
{
    public string? From { get; set; }
    public string? ToExclusive { get; set; }
    public int? ClassId { get; set; }
    public int? SubjectId { get; set; }
    public int? TeacherId { get; set; }
    public int? TaId { get; set; }
    public string? Room { get; set; }
    public string? Status { get; set; }
}

public sealed record SchedulePersonDto(int UserId, string Name);

public sealed class ScheduleSessionDto
{
    public int SessionId { get; set; }
    public int ClassId { get; set; }
    public string ClassName { get; set; } = "";
    public int? ScheduleId { get; set; }
    public int? ScheduleVersionId { get; set; }
    public string? PlannedOccurrenceDate { get; set; }
    public string? OccurrenceWeekStart { get; set; }
    public int SubjectId { get; set; }
    public string? SubjectName { get; set; }
    public string SessionDate { get; set; } = "";
    public string StartTime { get; set; } = "";
    public string EndTime { get; set; } = "";
    public string? Room { get; set; }
    public string Status { get; set; } = "";
    // These are current Class assignments, not historical per-session staffing.
    public List<SchedulePersonDto> Teachers { get; set; } = new();
    public List<SchedulePersonDto> TeachingAssistants { get; set; } = new();
    public bool HasAttendance { get; set; }
}

public sealed class ScheduleClassSummaryDto
{
    public int ClassId { get; set; }
    public string ClassName { get; set; } = "";
    public string StartDate { get; set; } = "";
    public string? EndDate { get; set; }
    public string Status { get; set; } = "";
}
