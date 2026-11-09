using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EduTrack.API.Models.DTOs.Schedule;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class ScheduleChangeInput
{
    [Range(1, int.MaxValue)] public int SessionId { get; set; }
    [Required] public string ChangeKind { get; set; } = "";
    public string? ProposedSessionDate { get; set; }
    public string? ProposedStartTime { get; set; }
    public string? ProposedEndTime { get; set; }
    [StringLength(50)] public string? ProposedRoom { get; set; }
    [Required, StringLength(2000)] public string Reason { get; set; } = "";
    [Required] public string ClientRequestKey { get; set; } = "";
    public string? PreviewToken { get; set; }
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class ScheduleChangeDecisionInput
{
    [Required] public string Decision { get; set; } = "";
    [StringLength(2000)] public string? ReviewNotes { get; set; }
    public string? PreviewToken { get; set; }
}

public sealed record ScheduleChangeCapabilities(int CurrentUserId, bool CanPreview, bool CanSubmit, bool CanReview, bool CanApply, bool CanViewAll, string? Blocker);
public sealed record ScheduleChangeActual(string SessionDate, string StartTime, string EndTime, string? Room, string Status);
public sealed record ScheduleChangeSession(int SessionId, int ClassId, string ClassName, int ScheduleId, int ScheduleVersionId,
    string PlannedOccurrenceDate, string OccurrenceWeekStart, ScheduleChangeActual Actual, bool HasAttendance);
public sealed record ScheduleChangeDto(int RequestId, string RequestCode, int RequestedBy, int? ReviewedBy, string Status, string ChangeKind,
    string Reason, string? ReviewNotes, string ClientRequestKey, DateTime CreatedAt, DateTime? ReviewedAt, DateTime? AppliedAt,
    ScheduleChangeActual Original, ScheduleChangeActual? Proposed, ScheduleChangeSession Session);
public sealed record ScheduleChangePreview(string PreviewToken, bool Allowed, List<string> Reasons, ScheduleChangeSession Session,
    ScheduleChangeActual? Proposed, ScheduleChangeDto? Request = null);
