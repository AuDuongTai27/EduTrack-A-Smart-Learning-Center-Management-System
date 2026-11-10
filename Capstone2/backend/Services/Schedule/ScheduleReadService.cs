using System.Globalization;
using EduTrack.API.Models.DTOs.Schedule;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Services.Schedule;

public sealed class ScheduleAccessException : Exception
{
    public int StatusCode { get; }
    public ScheduleAccessException(int statusCode, string message) : base(message) => StatusCode = statusCode;
}

// Read-only business scope selected by userId; no authentication is implemented.
// Selection is not access protection. No seeding or Attendance service calls.
public sealed class ScheduleReadService(EduTrackDbContext context)
{
    private static readonly string[] Actors = ["center_manager", "admin_staff", "teacher", "teaching_assistant", "student"];

    public static int RequireSelectedUser(int userId)
    {
        if (userId <= 0) throw new ScheduleAccessException(400, "Select a valid database userId.");
        return userId;
    }

    private async Task<IQueryable<ClassSession>> ScopedSessions(int userId, CancellationToken ct)
    {
        RequireSelectedUser(userId);
        var user = await context.Users.AsNoTracking().Include(u => u.UserRoles).ThenInclude(r => r.Role)
            .SingleOrDefaultAsync(u => u.UserId == userId, ct);
        if (user == null || user.Status != "active")
            throw new ScheduleAccessException(400, "Tài khoản không có quyền xem lịch học.");
        var roles = user.UserRoles.Select(r => r.Role.RoleName).Where(Actors.Contains).ToHashSet(StringComparer.Ordinal);
        if (roles.Count == 0) throw new ScheduleAccessException(400, "Tài khoản không có quyền xem lịch học.");

        var sessions = context.ClassSessions.AsNoTracking();
        if (roles.Contains("center_manager") || roles.Contains("admin_staff")) return sessions;
        var teacher = roles.Contains("teacher");
        var ta = roles.Contains("teaching_assistant");
        var student = roles.Contains("student");
        // Enrollment timestamps are UTC; session date and time are Vietnam civil time.
        // Unknown/missing enrollment evidence fails closed, including dropped without DroppedAt.
        return sessions.Where(s =>
            (teacher && s.Class.TeacherClasses.Any(a => a.TeacherId == userId && a.Status == "active")) ||
            (ta && s.Class.TaClasses.Any(a => a.TaId == userId && a.Status == "active")) ||
            (student && s.SessionDate.Date >= s.Class.StartDate.Date &&
                (!s.Class.EndDate.HasValue || s.SessionDate.Date <= s.Class.EndDate.Value.Date) &&
                s.Class.StudentClasses.Any(e => e.StudentId == userId && e.EnrolledDate.HasValue &&
                    (e.EnrolledDate.Value.AddHours(7).Date < s.SessionDate.Date ||
                        (e.EnrolledDate.Value.AddHours(7).Date == s.SessionDate.Date && e.EnrolledDate.Value.AddHours(7).TimeOfDay <= s.StartTime)) &&
                    (!e.DroppedAt.HasValue || e.DroppedAt.Value.AddHours(7).Date > s.SessionDate.Date ||
                        (e.DroppedAt.Value.AddHours(7).Date == s.SessionDate.Date && e.DroppedAt.Value.AddHours(7).TimeOfDay > s.StartTime)) &&
                    (e.Status == "active" || (e.Status == "dropped" && e.DroppedAt.HasValue) ||
                        (e.Status == "completed" && s.Class.EndDate.HasValue)))));
    }

    public static (DateTime From, DateTime ToExclusive) ValidateRange(ScheduleQuery query)
    {
        if (!DateTime.TryParseExact(query.From, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var from) ||
            !DateTime.TryParseExact(query.ToExclusive, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var to) ||
            to <= from || (to - from).TotalDays > 93)
            throw new ArgumentException("Khoảng ngày phải hợp lệ, tối đa 93 ngày (from bao gồm, toExclusive không bao gồm).");
        if (new[] { query.ClassId, query.SubjectId, query.TeacherId, query.TaId }.Any(id => id.HasValue && id <= 0) ||
            query.Room?.Length > 50 || query.Status?.Length > 20)
            throw new ArgumentException("Bộ lọc lịch học không hợp lệ.");
        return (from, to);
    }

    public async Task<List<ScheduleSessionDto>> GetSessions(int userId, ScheduleQuery query, CancellationToken ct = default)
    {
        // Validate the data selector before applying business filters.
        var sessions = await ScopedSessions(userId, ct);
        var (from, to) = ValidateRange(query);
        sessions = sessions.Where(s => s.SessionDate >= from && s.SessionDate < to);
        if (query.ClassId.HasValue) sessions = sessions.Where(s => s.ClassId == query.ClassId);
        if (query.SubjectId.HasValue) sessions = sessions.Where(s => s.Class.SubjectId == query.SubjectId);
        if (query.TeacherId.HasValue) sessions = sessions.Where(s => s.Class.TeacherClasses.Any(a => a.TeacherId == query.TeacherId && a.Status == "active"));
        if (query.TaId.HasValue) sessions = sessions.Where(s => s.Class.TaClasses.Any(a => a.TaId == query.TaId && a.Status == "active"));
        if (query.Room != null) { var room = query.Room.Trim(); sessions = sessions.Where(s => s.Room == room); }
        if (query.Status != null) { var status = query.Status.Trim(); sessions = sessions.Where(s => s.Status == status); }
        return await Read(sessions, ct);
    }

    public async Task<ScheduleSessionDto?> GetSession(int userId, int id, CancellationToken ct = default) =>
        (await Read((await ScopedSessions(userId, ct)).Where(s => s.SessionId == id), ct)).SingleOrDefault();

    private static async Task<List<ScheduleSessionDto>> Read(IQueryable<ClassSession> sessions, CancellationToken ct)
    {
        var rows = await sessions.OrderBy(s => s.SessionDate).ThenBy(s => s.StartTime).ThenBy(s => s.SessionId)
            .Select(s => new
            {
                s.SessionId, s.ClassId, s.Class.ClassName, s.ScheduleId, s.ScheduleVersionId, s.PlannedOccurrenceDate, s.OccurrenceWeekStart, s.Class.SubjectId,
                SubjectName = s.Class.Subject.SubjectName, s.SessionDate, s.StartTime, s.EndTime, s.Room, s.Status,
                Teachers = s.Class.TeacherClasses.Where(a => a.Status == "active").OrderBy(a => a.TeacherId)
                    .Select(a => new SchedulePersonDto(a.TeacherId, a.Teacher.FullName)).ToList(),
                Assistants = s.Class.TaClasses.Where(a => a.Status == "active").OrderBy(a => a.TaId)
                    .Select(a => new SchedulePersonDto(a.TaId, a.Ta.FullName)).ToList(),
                HasAttendance = s.Attendances.Any()
            }).ToListAsync(ct);
        return rows.Select(s => new ScheduleSessionDto
        {
            SessionId = s.SessionId, ClassId = s.ClassId, ClassName = s.ClassName, ScheduleId = s.ScheduleId,
            ScheduleVersionId = s.ScheduleVersionId, PlannedOccurrenceDate = s.PlannedOccurrenceDate?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            OccurrenceWeekStart = s.OccurrenceWeekStart?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            SubjectId = s.SubjectId, SubjectName = s.SubjectName, SessionDate = s.SessionDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            StartTime = s.StartTime.ToString("c", CultureInfo.InvariantCulture), EndTime = s.EndTime.ToString("c", CultureInfo.InvariantCulture),
            Room = s.Room, Status = s.Status, Teachers = s.Teachers, TeachingAssistants = s.Assistants, HasAttendance = s.HasAttendance
        }).ToList();
    }
}
