using System.Data;
using EduTrack.API.Models.DTOs.Schedule;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using static EduTrack.API.Services.Schedule.ScheduleManagementPolicy;
using static EduTrack.API.Services.Schedule.ScheduleTimeline;

namespace EduTrack.API.Services.Schedule;

public sealed class ScheduleManagementService(EduTrackDbContext db, TimeProvider? clock = null)
{
    private sealed record Actor(int Id, bool Manager, bool Teacher);
    private sealed record State(List<Class> Classes, List<ClassSchedule> Templates, List<ClassSession> Sessions);
    private async Task<Actor> RequireActor(int userId, bool teacherOnly, CancellationToken ct)
    {
        var id = ScheduleReadService.RequireSelectedUser(userId);
        var user = await db.Users.AsNoTracking().Include(u => u.UserRoles).ThenInclude(r => r.Role).SingleOrDefaultAsync(u => u.UserId == id, ct);
        var roles = user?.UserRoles.Select(r => r.Role.RoleName).ToHashSet() ?? [];
        var actor = new Actor(id, roles.Contains("center_manager") || roles.Contains("admin_staff"), roles.Contains("teacher"));
        if (user?.Status != "active" || (teacherOnly ? !actor.Teacher : !actor.Manager && !actor.Teacher))
            throw new ScheduleAccessException(400, "Tài khoản không có quyền thực hiện chức năng Schedule này.");
        return actor;
    }
    private async Task<Actor> Manager(int userId, CancellationToken ct)
    {
        var actor = await RequireActor(userId, false, ct);
        if (!actor.Manager) throw new ScheduleAccessException(400, "Chỉ Center Manager/Admin Staff được cấp hoặc ngừng lịch cố định.");
        return actor;
    }
    private async Task<State> Load(CancellationToken ct) => new(
        await db.Classes.AsNoTracking().Include(c => c.TeacherClasses).Include(c => c.TaClasses).AsSplitQuery().OrderBy(c => c.ClassId).ToListAsync(ct),
        await db.ClassSchedules.AsNoTracking().Include(s => s.Versions).AsSplitQuery().OrderBy(s => s.ScheduleId).ToListAsync(ct),
        await db.ClassSessions.AsNoTracking().Include(s => s.Attendances).AsSplitQuery().OrderBy(s => s.SessionId).ToListAsync(ct));

    private static Class RequireClass(State state, Actor actor, int id, bool teacherOnly = false)
    {
        var c = state.Classes.SingleOrDefault(c => c.ClassId == id);
        if (c == null || (!actor.Manager || teacherOnly) && !c.TeacherClasses.Any(a => a.TeacherId == actor.Id && a.Status == "active"))
            throw new ScheduleAccessException(404, "Không tìm thấy Class trong phạm vi được phân công.");
        if (!ValidClass(c)) throw new ArgumentException("Class phải còn hoạt động hoặc sắp mở, với ngày bắt đầu/kết thúc hợp lệ.");
        return c;
    }
    private static void RequireMapped(State state, int classId)
    {
        if (state.Templates.Any(s => s.ClassId == classId && s.Versions.Count == 0) ||
            state.Sessions.Any(s => s.ClassId == classId && (!s.ScheduleId.HasValue || !s.ScheduleVersionId.HasValue || !s.PlannedOccurrenceDate.HasValue || !s.OccurrenceWeekStart.HasValue)))
            throw new ScheduleAccessException(409, "Class còn dữ liệu legacy chưa mapping planned occurrence/version. Cần đối soát trước khi quản lý hoặc generate.");
    }
    public async Task<ScheduleCapabilities> Capabilities(int userId, CancellationToken ct)
    {
        var actor = await RequireActor(userId, false, ct);
        var classes = await db.Classes.AsNoTracking().Where(c => actor.Manager || c.TeacherClasses.Any(a => a.TeacherId == actor.Id && a.Status == "active"))
            .OrderBy(c => c.ClassName).ToListAsync(ct);
        return new(actor.Manager, actor.Teacher, classes.Where(ValidClass).Select(c => new ScheduleClassOption(c.ClassId, c.ClassName, c.Status,
            FormatDate(c.StartDate), c.EndDate.HasValue ? FormatDate(c.EndDate.Value) : null)).ToList(), NextMonday(clock).ToString("yyyy-MM-dd"));
    }
    private ScheduleTemplateDto Map(ClassSchedule s, State state)
    {
        var list = s.Versions.OrderBy(v => v.EffectiveFrom).ToList();
        var display = At(s, Today(clock)) ?? list.FirstOrDefault(v => v.EffectiveFrom > Today(clock)) ?? list.LastOrDefault()
            ?? throw new ScheduleAccessException(409, "Template legacy chưa có version được đối soát.");
        return new(s.ScheduleId, s.ClassId, Weekday(display.DayOfWeek).ToString(), FormatTime(display.StartTime), FormatTime(display.EndTime), display.Room,
            state.Sessions.Any(x => x.ScheduleId == s.ScheduleId), Version(s), list.Select(v => new ScheduleVersionDto(v.ScheduleVersionId,
                v.EffectiveFrom.ToString("yyyy-MM-dd"), v.EffectiveTo?.ToString("yyyy-MM-dd"), Weekday(v.DayOfWeek).ToString(), FormatTime(v.StartTime), FormatTime(v.EndTime), v.Room)).ToList());
    }
    public async Task<List<ScheduleTemplateDto>> Templates(int userId, int classId, CancellationToken ct)
    {
        var actor = await RequireActor(userId, false, ct); var state = await Load(ct);
        RequireClass(state, actor, classId); RequireMapped(state, classId);
        return state.Templates.Where(s => s.ClassId == classId).Select(s => Map(s, state)).ToList();
    }
    private static HashSet<int> Staff(Class c) => c.TeacherClasses.Where(a => a.Status == "active").Select(a => a.TeacherId)
        .Concat(c.TaClasses.Where(a => a.Status == "active").Select(a => a.TaId)).ToHashSet();
    private static string? ResourceConflict(Class a, string? aRoom, Class b, string? bRoom)
    {
        if (a.ClassId == b.ClassId) return "Class có khung giờ giao nhau.";
        if (Staff(a).Overlaps(Staff(b))) return "Teacher/TA có khung giờ giao nhau.";
        if (SameRoom(aRoom, bRoom)) return "Phòng học có khung giờ giao nhau.";
        return null;
    }
    private static bool InRange(Class c, ClassScheduleVersion v, DateOnly date) => Applies(v, date) && InClass(c, date.ToDateTime(TimeOnly.MinValue));
    private static bool SharesDate(Class a, ClassScheduleVersion x, Class b, ClassScheduleVersion y)
    {
        var day = Weekday(x.DayOfWeek);
        if (day != Weekday(y.DayOfWeek)) return false;
        var start = new[] {a.StartDate.Date, b.StartDate.Date, x.EffectiveFrom.ToDateTime(TimeOnly.MinValue), y.EffectiveFrom.ToDateTime(TimeOnly.MinValue)}.Max();
        var end = new[] {a.EndDate?.Date ?? DateTime.MaxValue.Date, b.EndDate?.Date ?? DateTime.MaxValue.Date,
            x.EffectiveTo?.AddDays(-1).ToDateTime(TimeOnly.MinValue) ?? DateTime.MaxValue.Date,
            y.EffectiveTo?.AddDays(-1).ToDateTime(TimeOnly.MinValue) ?? DateTime.MaxValue.Date}.Min();
        return (end - start).TotalDays >= ((int)day - (int)start.DayOfWeek + 7) % 7;
    }
    private static void ValidateAllocation(Class c, int? rootId, ClassScheduleVersion candidate, State state)
    {
        var first = PlannedDate(candidate, Monday(DateOnly.FromDateTime(c.StartDate) > candidate.EffectiveFrom ? DateOnly.FromDateTime(c.StartDate) : candidate.EffectiveFrom));
        if (first < DateOnly.FromDateTime(c.StartDate)) first = first.AddDays(7);
        if (!InRange(c, candidate, first)) throw new ArgumentException("Version không có ngày học trong thời gian hoạt động của Class.");
        foreach (var root in state.Templates.Where(s => s.ScheduleId != rootId))
        {
            var other = state.Classes.Single(x => x.ClassId == root.ClassId);
            if (!ValidClass(other)) continue;
            foreach (var version in root.Versions)
            {
                var reason = ResourceConflict(c, candidate.Room, other, version.Room);
                if (reason == null || !SharesDate(c, candidate, other, version)) continue;
                if (!ValidSlot(version.StartTime, version.EndTime)) throw new ScheduleAccessException(409, "Version liên quan có giờ không hợp lệ.");
                if (Overlap(candidate.StartTime, candidate.EndTime, version.StartTime, version.EndTime)) throw new ScheduleAccessException(409, reason);
            }
        }
        foreach (var session in state.Sessions.Where(s => s.Status != "cancelled"))
        {
            var date = DateOnly.FromDateTime(session.SessionDate);
            if (!InRange(c, candidate, date) || date.DayOfWeek != Weekday(candidate.DayOfWeek)) continue;
            // An already materialized occurrence remains pinned to its original booking.
            if (session.ScheduleId == rootId && session.OccurrenceWeekStart == Monday(date)) continue;
            var reason = ResourceConflict(c, candidate.Room, state.Classes.Single(x => x.ClassId == session.ClassId), session.Room);
            if (reason == null) continue;
            if (!ValidSlot(session.StartTime, session.EndTime)) throw new ScheduleAccessException(409, "Phiên học liên quan có giờ không hợp lệ.");
            if (Overlap(candidate.StartTime, candidate.EndTime, session.StartTime, session.EndTime)) throw new ScheduleAccessException(409, reason + " Đã có phiên học chính thức.");
        }
    }
    private (ScheduleTemplatePreview Preview, ClassScheduleVersion? Candidate) PrepareTemplate(State state, Actor actor, ScheduleTemplateInput input)
    {
        var c = RequireClass(state, actor, input.ClassId); RequireMapped(state, input.ClassId);
        var from = DateOnly.FromDateTime(Date(input.EffectiveFrom));
        if (from != Monday(from) || from < NextMonday(clock)) throw new ArgumentException("Ngày hiệu lực phải là Thứ Hai của tuần tương lai (giờ Việt Nam).");
        if (input.Operation is not ("create" or "replace" or "retire") || (input.Operation == "create") != !input.ScheduleId.HasValue)
            throw new ArgumentException("Thao tác create/replace/retire và ScheduleId không phù hợp.");
        var root = input.ScheduleId.HasValue ? state.Templates.SingleOrDefault(s => s.ScheduleId == input.ScheduleId && s.ClassId == c.ClassId)
            ?? throw new ScheduleAccessException(404, "Không tìm thấy ca lịch cố định của Class.") : null;
        if (root != null)
        {
            if (Version(root) != input.Version) throw new ScheduleAccessException(409, "Timeline đã thay đổi; tải lại trước khi xem Preview.");
            var last = root.Versions.OrderBy(v => v.EffectiveFrom).Last();
            if (last.EffectiveFrom >= from || (last.EffectiveTo.HasValue && (input.Operation == "retire" || last.EffectiveTo.Value > from)))
                throw new ScheduleAccessException(409, "Đã có version/retire tương lai tại hoặc sau mốc này. Cần review timeline; không tự ghi đè.");
        }
        ClassScheduleVersion? candidate = null;
        if (input.Operation != "retire")
        {
            candidate = new() {ScheduleId = root?.ScheduleId ?? 0, EffectiveFrom = from, DayOfWeek = Weekday(input.DayOfWeek).ToString(),
                StartTime = Time(input.StartTime), EndTime = Time(input.EndTime), Room = string.IsNullOrWhiteSpace(input.Room) ? null : input.Room.Trim()};
            if (!ValidSlot(candidate.StartTime, candidate.EndTime) || candidate.Room?.Length > 50) throw new ArgumentException("Giờ bắt đầu phải trước kết thúc; phòng tối đa 50 ký tự.");
            ValidateAllocation(c, root?.ScheduleId, candidate, state);
        }
        var affected = state.Sessions.Where(s => root != null && s.ScheduleId == root.ScheduleId && s.OccurrenceWeekStart >= from)
            .Select(s => new ScheduleAffectedSession(s.SessionId, s.ScheduleVersionId, s.PlannedOccurrenceDate?.ToString("yyyy-MM-dd"), s.OccurrenceWeekStart!.Value.ToString("yyyy-MM-dd"),
                FormatDate(s.SessionDate), FormatTime(s.StartTime), FormatTime(s.EndTime), s.Room, s.Status, s.Attendances.Count > 0)).ToList();
        var token = Hash(new {actor.Id, input.ClassId, input.ScheduleId, input.Operation, from, Timeline = root == null ? null : Version(root),
            Candidate = candidate == null ? null : new {candidate.DayOfWeek, candidate.StartTime, candidate.EndTime, candidate.Room},
            c.StartDate, c.EndDate, c.Status, Staff = Staff(c).Order().ToArray(), affected});
        return (new(token, input.Operation, from.ToString("yyyy-MM-dd"), affected,
            $"Giữ nguyên {affected.Count} phiên đã tạo, kể cả buổi đã dời/hủy hoặc có Attendance. Đổi template không áp lại các phiên này."), candidate);
    }
    public async Task<ScheduleTemplatePreview> PreviewTemplate(int userId, ScheduleTemplateInput input, CancellationToken ct)
    {
        var actor = await Manager(userId, ct);
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, ct);
        var preview = PrepareTemplate(await Load(ct), actor, input).Preview;
        await tx.CommitAsync(ct); return preview;
    }
    public async Task<ScheduleTemplatePreview> ConfirmTemplate(int userId, ScheduleTemplateInput input, CancellationToken ct)
    {
        await Manager(userId, ct);
        if (string.IsNullOrWhiteSpace(input.PreviewToken)) throw new ArgumentException("Hãy xem Preview thay đổi lịch trước khi xác nhận.");
        return await ScheduleWriteTransaction.Run(db, async () =>
        {
            var actor = await Manager(userId, ct);
            if (input.ScheduleId.HasValue) await db.ClassSchedules.FromSqlInterpolated($"SELECT * FROM class_schedules WHERE schedule_id={input.ScheduleId.Value} FOR UPDATE").ToListAsync(ct);
            var state = await Load(ct); var (preview, candidate) = PrepareTemplate(state, actor, input);
            if (preview.PreviewToken != input.PreviewToken) throw new ScheduleAccessException(409, "Preview thay đổi lịch đã cũ; timeline/phân công/phiên đã tạo đã đổi. Chưa lưu thay đổi.");
            ClassSchedule root;
            if (!input.ScheduleId.HasValue)
            {
                // Legacy columns are an immutable initial snapshot until the remaining
                // legacy seeder/consumers are retired. All schedule reads use Versions.
                root = new() {ClassId = input.ClassId, DayOfWeek = candidate!.DayOfWeek, StartTime = candidate.StartTime, EndTime = candidate.EndTime, Room = candidate.Room};
                db.ClassSchedules.Add(root); await db.SaveChangesAsync(ct);
            }
            else
            {
                root = await db.ClassSchedules.SingleAsync(s => s.ScheduleId == input.ScheduleId, ct);
                var old = state.Templates.Single(s => s.ScheduleId == root.ScheduleId).Versions.OrderBy(v => v.EffectiveFrom).Last();
                if (!old.EffectiveTo.HasValue)
                    (await db.ClassScheduleVersions.SingleAsync(v => v.ScheduleVersionId == old.ScheduleVersionId, ct)).EffectiveTo = DateOnly.FromDateTime(Date(input.EffectiveFrom));
            }
            if (candidate != null) {candidate.ScheduleId = root.ScheduleId; db.ClassScheduleVersions.Add(candidate);}
            await db.SaveChangesAsync(ct);
            var after = await Load(ct);
            return preview with {Template = Map(after.Templates.Single(s => s.ScheduleId == root.ScheduleId), after)};
        }, ct);
    }
    public async Task<ScheduleGenerationPreview> Preview(int userId, ScheduleGenerationInput input, CancellationToken ct)
    {
        var actor = await RequireActor(userId, true, ct);
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, ct);
        var preview = Build(await Load(ct), actor, input);
        await tx.CommitAsync(ct); return preview;
    }
    private static string? SessionConflict(State state, Class c, ClassScheduleVersion version, DateOnly date)
    {
        foreach (var s in state.Sessions.Where(s => s.Status != "cancelled" && DateOnly.FromDateTime(s.SessionDate) == date))
        {
            var reason = ResourceConflict(c, version.Room, state.Classes.Single(x => x.ClassId == s.ClassId), s.Room);
            if (reason == null) continue;
            if (!ValidSlot(s.StartTime, s.EndTime)) return "Phiên học liên quan có giờ không hợp lệ.";
            if (Overlap(version.StartTime, version.EndTime, s.StartTime, s.EndTime)) return reason;
        }
        foreach (var root in state.Templates.Where(s => s.ScheduleId != version.ScheduleId))
        {
            var other = state.Classes.Single(x => x.ClassId == root.ClassId);
            if (!ValidClass(other) || !InClass(other, date.ToDateTime(TimeOnly.MinValue))) continue;
            var v = At(root, date); if (v == null) continue;
            var reason = ResourceConflict(c, version.Room, other, v.Room);
            if (reason == null) continue;
            if (!ValidSlot(v.StartTime, v.EndTime)) return "Version liên quan có giờ không hợp lệ.";
            if (Weekday(v.DayOfWeek) == date.DayOfWeek && Overlap(version.StartTime, version.EndTime, v.StartTime, v.EndTime)) return reason;
        }
        return null;
    }
    private static ScheduleGenerationRow Existing(ClassSchedule root, ClassSession existing, ClassScheduleVersion? proposed)
    {
        var week = existing.OccurrenceWeekStart!.Value;
        return new(Key(root.ScheduleId, week), root.ScheduleId, root.ClassId, FormatDate(existing.SessionDate), FormatTime(existing.StartTime), FormatTime(existing.EndTime),
            existing.Room, "existing", proposed == null || proposed.ScheduleVersionId != existing.ScheduleVersionId
                ? "Đã tạo theo version trước/đã retire; giữ nguyên phiên. Muốn đổi lịch cần Phase 3."
                : "Occurrence đã tồn tại, kể cả buổi đã dời/hủy; không tạo lại.", existing.SessionId,
            existing.PlannedOccurrenceDate!.Value.ToString("yyyy-MM-dd"), week.ToString("yyyy-MM-dd"), existing.ScheduleVersionId!.Value,
            proposed == null ? null : PlannedDate(proposed, week).ToString("yyyy-MM-dd"), existing.Status);
    }
    private static ScheduleGenerationPreview Build(State state, Actor actor, ScheduleGenerationInput input)
    {
        var c = RequireClass(state, actor, input.ClassId, true); RequireMapped(state, c.ClassId);
        if (input.Mode is not ("single" or "month")) throw new ArgumentException("Chế độ phải là single hoặc month.");
        var roots = state.Templates.Where(s => s.ClassId == c.ClassId && (input.Mode == "month" || s.ScheduleId == input.ScheduleId)).ToList();
        if (roots.Count == 0 || roots.Count > 50) throw new ArgumentException("Class chưa được cấp ca lịch phù hợp hoặc vượt 50 ca.");
        DateOnly from, until;
        if (input.Mode == "single") {from = DateOnly.FromDateTime(Date(input.SessionDate)); until = from.AddDays(1);}
        else
        {
            if (input.Year is null or < 2000 or > 2100 || input.Month is null or < 1 or > 12) throw new ArgumentException("Tháng/năm không hợp lệ (2000–2100).");
            from = new(input.Year.Value, input.Month.Value, 1); until = from.AddMonths(1);
        }
        var rows = new Dictionary<string, ScheduleGenerationRow>();
        foreach (var root in roots)
        {
            var owned = state.Sessions.Where(s => s.ScheduleId == root.ScheduleId).ToList();
            if (owned.GroupBy(s => s.OccurrenceWeekStart).Any(g => g.Count() > 1)) throw new ScheduleAccessException(409, "Legacy có nhiều Session cùng occurrence; cần đối soát, không tự chọn một record.");
            for (var week = Monday(from); week < until; week = week.AddDays(7))
            {
                var v = At(root, week);
                var existing = owned.SingleOrDefault(s => s.OccurrenceWeekStart == week);
                var date = v == null ? (DateOnly?)null : PlannedDate(v, week);
                if (input.Mode == "single" && existing != null) {rows.Add(Key(root.ScheduleId, week), Existing(root, existing, v)); continue;}
                if (input.Mode == "single" && (v == null || date != from)) throw new ArgumentException("Ngày planned phải đúng thứ/version đang hiệu lực; ca có thể đã retire.");
                if (!date.HasValue || date < from || date >= until) continue;
                if (existing != null) {rows.Add(Key(root.ScheduleId, week), Existing(root, existing, v)); continue;}
                if (!ValidSlot(v!.StartTime, v.EndTime)) throw new ArgumentException("Version có giờ không hợp lệ; cần kiểm tra lịch.");
                var outcome = "eligible"; var reason = "Hợp lệ, sẵn sàng tạo occurrence chính thức.";
                if (!InClass(c, date.Value.ToDateTime(TimeOnly.MinValue))) {outcome = "outside_class"; reason = "Ngoài thời gian hoạt động của Class.";}
                else if (SessionConflict(state, c, v, date.Value) is { } conflict) {outcome = "conflict"; reason = conflict;}
                rows.Add(Key(root.ScheduleId, week), new(Key(root.ScheduleId, week), root.ScheduleId, c.ClassId, date.Value.ToString("yyyy-MM-dd"),
                    FormatTime(v.StartTime), FormatTime(v.EndTime), v.Room, outcome, reason, null, date.Value.ToString("yyyy-MM-dd"), week.ToString("yyyy-MM-dd"),
                    v.ScheduleVersionId, date.Value.ToString("yyyy-MM-dd"), "scheduled"));
            }
            // Include retained original plans even when retired/moved out of the actual month,
            // or a weekday change has moved the newly proposed date across the month boundary.
            if (input.Mode == "month") foreach (var s in owned.Where(s => s.PlannedOccurrenceDate >= from && s.PlannedOccurrenceDate < until))
                rows.TryAdd(Key(root.ScheduleId, s.OccurrenceWeekStart!.Value), Existing(root, s, At(root, s.OccurrenceWeekStart.Value)));
        }
        var result = rows.Values.OrderBy(r => r.OccurrenceWeekStart).ThenBy(r => r.StartTime).ThenBy(r => r.ScheduleId).ToList();
        var token = Hash(new {actor.Id, c.ClassId, c.Status, c.StartDate, c.EndDate, Staff = Staff(c).Order().ToArray(),
            input.Mode, input.ScheduleId, input.SessionDate, input.Year, input.Month, Timelines = roots.Select(Version).ToArray(), Keys = result.Select(r => r.Key).Order().ToArray()});
        return new(token, result);
    }
    public async Task<ScheduleGenerationPreview> Confirm(int userId, ScheduleGenerationInput input, CancellationToken ct)
    {
        await RequireActor(userId, true, ct);
        if (string.IsNullOrWhiteSpace(input.PreviewToken) || input.SelectedKeys is not {Count: > 0 and <= 1550} || input.SelectedKeys.Distinct().Count() != input.SelectedKeys.Count)
            throw new ArgumentException("Hãy Preview và chọn occurrence hợp lệ trước khi xác nhận.");
        async Task<ScheduleGenerationPreview> Write(bool insert)
        {
            var actor = await RequireActor(userId, true, ct); var state = await Load(ct); var preview = Build(state, actor, input);
            if (preview.PreviewToken != input.PreviewToken) throw new ScheduleAccessException(409, "Preview đã cũ: timeline, Class hoặc phân công thay đổi. Xem lại trước khi xác nhận.");
            var selected = preview.Rows.Where(r => input.SelectedKeys.Contains(r.Key)).ToList();
            if (selected.Count != input.SelectedKeys.Count || selected.Any(r => r.Outcome is not ("eligible" or "existing")))
                throw new ScheduleAccessException(409, "Occurrence đã chọn có conflict hoặc ngoài Class. Chưa tạo phiên nào; xem lại Preview.");
            if (!insert && selected.Any(r => r.Outcome != "existing")) throw new ScheduleAccessException(409, "Không xác nhận được toàn bộ occurrence sau xung đột unique. Xem lại Preview.");
            var added = new Dictionary<string, ClassSession>();
            foreach (var row in selected.Where(r => insert && r.Outcome == "eligible"))
            {
                var source = state.Templates.Single(s => s.ScheduleId == row.ScheduleId).Versions.Single(v => v.ScheduleVersionId == row.ScheduleVersionId);
                var session = new ClassSession {ClassId = row.ClassId, ScheduleId = row.ScheduleId, ScheduleVersionId = row.ScheduleVersionId,
                    PlannedOccurrenceDate = DateOnly.FromDateTime(Date(row.PlannedOccurrenceDate)), SessionDate = Date(row.SessionDate),
                    StartTime = source.StartTime, EndTime = source.EndTime, Room = source.Room, Status = "scheduled"};
                db.ClassSessions.Add(session); added.Add(row.Key, session);
            }
            await db.SaveChangesAsync(ct);
            return preview with {Created = added.Count, Rows = preview.Rows.Select(r => added.TryGetValue(r.Key, out var session)
                ? r with {Outcome = "created", Reason = "Đã tạo occurrence chính thức.", SessionId = session.SessionId} : r).ToList()};
        }
        try {return await ScheduleWriteTransaction.Run(db, () => Write(true), ct);}
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException {Number: 1062} sql && sql.Message.Contains("UQ_schedule_occurrence_week", StringComparison.Ordinal))
        {
            // The failed transaction is disposed/rolled back before re-reading, and no
            // failed Added entities can leak into the new transaction's SaveChanges.
            db.ChangeTracker.Clear();
            return await ScheduleWriteTransaction.Run(db, () => Write(false), ct);
        }
    }
}
