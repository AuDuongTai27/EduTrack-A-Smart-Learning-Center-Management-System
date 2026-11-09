using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities;

[Table("schedule_change_request_details")]
public sealed class ScheduleChangeRequestDetail
{
    [Key, Column("request_id")] public int RequestId { get; set; }
    [Column("session_id")] public int SessionId { get; set; }
    [Required, StringLength(20), Column("change_kind")] public string ChangeKind { get; set; } = "";
    [Column("original_session_date")] public DateTime OriginalSessionDate { get; set; }
    [Column("original_start_time")] public TimeSpan OriginalStartTime { get; set; }
    [Column("original_end_time")] public TimeSpan OriginalEndTime { get; set; }
    [StringLength(50), Column("original_room")] public string? OriginalRoom { get; set; }
    [Required, StringLength(20), Column("original_status")] public string OriginalStatus { get; set; } = "";
    [Required, StringLength(64), Column("expected_session_fingerprint")] public string ExpectedSessionFingerprint { get; set; } = "";
    [Column("proposed_session_date")] public DateTime? ProposedSessionDate { get; set; }
    [Column("proposed_start_time")] public TimeSpan? ProposedStartTime { get; set; }
    [Column("proposed_end_time")] public TimeSpan? ProposedEndTime { get; set; }
    [StringLength(50), Column("proposed_room")] public string? ProposedRoom { get; set; }
    [Required, StringLength(36), Column("client_request_key")] public string ClientRequestKey { get; set; } = "";
    [Column("applied_at")] public DateTime? AppliedAt { get; set; }
    public ApprovalRequest Request { get; set; } = null!;
    public ClassSession Session { get; set; } = null!;
}
