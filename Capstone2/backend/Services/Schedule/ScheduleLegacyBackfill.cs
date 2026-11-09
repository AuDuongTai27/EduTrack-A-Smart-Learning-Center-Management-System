using System.Data;
using System.Globalization;
using EduTrack.API.Models.EF;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace EduTrack.API.Services.Schedule;

public sealed record LegacyOccurrenceMapping(int SessionId, int ScheduleId, int ScheduleVersionId, DateOnly OriginalPlannedDate,
    string EvidenceReference, string ExpectedActualHash);
public sealed record LegacySessionEvidence(int SessionId, int ClassId, int? ScheduleId, int? ScheduleVersionId, DateOnly? PlannedDate, string ActualHash);

// Explicit, reviewed metadata mapping during Expand only. No HTTP endpoint, configuration,
// date inference, seeding, Session recreation or Attendance modification.
public static class ScheduleLegacyBackfill
{
    public static async Task<List<LegacySessionEvidence>> Inspect(EduTrackDbContext db, CancellationToken ct = default)
    {
        await db.Database.OpenConnectionAsync(ct);
        try {return await Read(db, ct);}
        finally {await db.Database.CloseConnectionAsync();}
    }
    private static async Task<List<LegacySessionEvidence>> Read(EduTrackDbContext db, CancellationToken ct)
    {
        await using var command = db.Database.GetDbConnection().CreateCommand();
        command.Transaction = db.Database.CurrentTransaction?.GetDbTransaction();
        command.CommandText = """
            SELECT s.session_id,s.class_id,s.schedule_id,s.schedule_version_id,s.planned_occurrence_date,
                   s.session_date,s.start_time,s.end_time,s.room,s.status
            FROM class_sessions s ORDER BY s.session_id
            """;
        static string? Value(object value) => value switch {DBNull => null, DateTime d => d.ToString("O", CultureInfo.InvariantCulture),
            TimeSpan time => time.ToString("c", CultureInfo.InvariantCulture), _ => Convert.ToString(value, CultureInfo.InvariantCulture)};
        var result = new List<(LegacySessionEvidence Evidence, string?[] Actual)>();
        await using (var reader = await command.ExecuteReaderAsync(ct))
        {
            while (await reader.ReadAsync(ct)) result.Add((new(reader.GetInt32(0), reader.GetInt32(1), reader.IsDBNull(2) ? null : reader.GetInt32(2), reader.IsDBNull(3) ? null : reader.GetInt32(3),
                reader.IsDBNull(4) ? null : DateOnly.FromDateTime(reader.GetDateTime(4)), ""), Enumerable.Range(5, 5).Select(i => Value(reader.GetValue(i))).ToArray()));
        }
        command.CommandText = "SELECT session_id,attendance_id,student_id,status,note,recorded_by,recorded_at FROM attendance ORDER BY session_id,attendance_id";
        var attendance = new Dictionary<int, List<string?[]>>();
        await using (var reader = await command.ExecuteReaderAsync(ct))
            while (await reader.ReadAsync(ct))
            {
                var id = reader.GetInt32(0); if (!attendance.ContainsKey(id)) attendance[id] = [];
                attendance[id].Add(Enumerable.Range(1, 6).Select(i => Value(reader.GetValue(i))).ToArray());
            }
        return result.Select(r => r.Evidence with {ActualHash = ScheduleManagementPolicy.Hash(new {r.Evidence.ClassId, r.Actual,
            Attendance = attendance.GetValueOrDefault(r.Evidence.SessionId) ?? []})}).ToList();
    }
    public static async Task<List<LegacySessionEvidence>> Apply(EduTrackDbContext db, IReadOnlyList<LegacyOccurrenceMapping> mappings, CancellationToken ct = default)
    {
        var applied = (await db.Database.GetAppliedMigrationsAsync(ct)).ToList();
        if (!applied.Any(m => m.EndsWith("_ScheduleVersionExpand", StringComparison.Ordinal)) || applied.Any(m => m.EndsWith("_ScheduleVersionContract", StringComparison.Ordinal)))
            throw new InvalidOperationException("Backfill chỉ được chạy sau Expand và trước Contract, bằng mapping có bằng chứng đã duyệt.");
        if (mappings.Select(m => m.SessionId).Distinct().Count() != mappings.Count || mappings.Any(m => string.IsNullOrWhiteSpace(m.EvidenceReference) || string.IsNullOrWhiteSpace(m.ExpectedActualHash)))
            throw new ArgumentException("Mỗi SessionId cần mapping duy nhất, bằng chứng và fingerprint actual/Attendance đã review.");
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var before = await Read(db, ct);
        foreach (var map in mappings)
        {
            var session = before.SingleOrDefault(s => s.SessionId == map.SessionId) ?? throw new ArgumentException("SessionId trong mapping không tồn tại.");
            if (session.ActualHash != map.ExpectedActualHash) throw new InvalidOperationException("Actual/Attendance đã thay đổi từ lúc review; chưa apply mapping nào.");
            if (session.ScheduleVersionId.HasValue && (session.ScheduleVersionId != map.ScheduleVersionId || session.ScheduleId != map.ScheduleId || session.PlannedDate != map.OriginalPlannedDate))
                throw new InvalidOperationException("Không remap planned identity đã được xác nhận.");
            var source = await db.ClassScheduleVersions.AsNoTracking().Include(v => v.Schedule).SingleOrDefaultAsync(v => v.ScheduleVersionId == map.ScheduleVersionId, ct);
            if (source == null || source.ScheduleId != map.ScheduleId || source.Schedule.ClassId != session.ClassId || source.EffectiveFrom > map.OriginalPlannedDate ||
                ScheduleManagementPolicy.Weekday(source.DayOfWeek) != map.OriginalPlannedDate.DayOfWeek)
                throw new ArgumentException("Mapping ca/version/Class/ngày planned không phù hợp bằng chứng nguồn.");
            await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE class_sessions SET schedule_id={map.ScheduleId}, schedule_version_id={map.ScheduleVersionId}, planned_occurrence_date={map.OriginalPlannedDate} WHERE session_id={map.SessionId}", ct);
        }
        var after = await Read(db, ct);
        if (after.Any(s => before.Single(x => x.SessionId == s.SessionId).ActualHash != s.ActualHash)) throw new InvalidOperationException("Actual/Attendance phải được giữ nguyên.");
        if (after.Where(s => s.ScheduleId.HasValue && s.PlannedDate.HasValue).GroupBy(s => new {s.ScheduleId, Week = ScheduleTimeline.Monday(s.PlannedDate!.Value)}).Any(g => g.Count() > 1))
            throw new InvalidOperationException("Mapping tạo duplicate logical occurrence. Không tự chọn winner hoặc đổi SessionId/Attendance.");
        await tx.CommitAsync(ct);
        return after.Where(s => !s.ScheduleId.HasValue || !s.ScheduleVersionId.HasValue || !s.PlannedDate.HasValue).ToList();
    }
}
