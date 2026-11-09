using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Schedule;

public sealed record ScheduleClassOption(int ClassId, string ClassName, string Status, string StartDate, string? EndDate);
public sealed record ScheduleCapabilities(bool CanManageTemplates, bool CanCreateSessions, List<ScheduleClassOption> Classes, string EarliestEffectiveFrom);
public sealed record ScheduleVersionDto(int ScheduleVersionId, string EffectiveFrom, string? EffectiveTo, string DayOfWeek, string StartTime, string EndTime, string? Room);
public sealed record ScheduleTemplateDto(int ScheduleId, int ClassId, string DayOfWeek, string StartTime, string EndTime,
    string? Room, bool HasSessions, string Version, List<ScheduleVersionDto> Versions);

public sealed class ScheduleTemplateInput
{
    public int? ScheduleId { get; set; }
    [Range(1, int.MaxValue)] public int ClassId { get; set; }
    [Required] public string Operation { get; set; } = "create";
    [Required] public string EffectiveFrom { get; set; } = "";
    [StringLength(20)] public string DayOfWeek { get; set; } = "";
    public string StartTime { get; set; } = "";
    public string EndTime { get; set; } = "";
    [StringLength(50)] public string? Room { get; set; }
    public string? Version { get; set; }
    public string? PreviewToken { get; set; }
}

public sealed record ScheduleAffectedSession(int SessionId, int? ScheduleVersionId, string? PlannedOccurrenceDate,
    string OccurrenceWeekStart, string SessionDate, string StartTime, string EndTime, string? Room, string Status, bool HasAttendance);
public sealed record ScheduleTemplatePreview(string PreviewToken, string Operation, string EffectiveFrom, List<ScheduleAffectedSession> RetainedSessions,
    string Message, ScheduleTemplateDto? Template = null);

public sealed class ScheduleGenerationInput
{
    [Range(1, int.MaxValue)] public int ClassId { get; set; }
    // SessionDate selects the planned occurrence, never the actual destination after a move.
    [Required] public string Mode { get; set; } = "single";
    public int? ScheduleId { get; set; }
    public string? SessionDate { get; set; }
    public int? Year { get; set; }
    public int? Month { get; set; }
    public string? PreviewToken { get; set; }
    public List<string>? SelectedKeys { get; set; }
}

public sealed record ScheduleGenerationRow(string Key, int ScheduleId, int ClassId, string SessionDate,
    string StartTime, string EndTime, string? Room, string Outcome, string Reason, int? SessionId,
    string PlannedOccurrenceDate, string OccurrenceWeekStart, int ScheduleVersionId, string? ProposedPlannedDate, string Status);
public sealed record ScheduleGenerationPreview(string PreviewToken, List<ScheduleGenerationRow> Rows, int Created = 0);
