using System.Data;
using System.Globalization;
using System.Text.RegularExpressions;
using EduTrack.API.Models.DTOs.Schedule;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using static EduTrack.API.Services.Schedule.ScheduleManagementPolicy;
using static EduTrack.API.Services.Schedule.ScheduleTimeline;

namespace EduTrack.API.Services.Schedule;

// Both flags default OFF. Owner-reviewed routing and Attendance concurrency integration
// are deployment prerequisites, never enabled by a client header/body or test identity.
public sealed record ScheduleChangeIntegration(bool GenericRoutesGuarded = true, bool AttendanceWritesCoordinated = true);

public sealed class ScheduleChangeRequestService(EduTrackDbContext db, ScheduleChangeIntegration? integration = null, TimeProvider? clock = null)
{
    private readonly ScheduleChangeIntegration safety = integration ?? new();
    private sealed record Actor(int Id, bool Teacher, bool Manager);
    private sealed record Destination(DateTime? Date, TimeSpan? Start, TimeSpan? End, string? Room);
    private sealed record State(List<Class> Classes, List<ClassSchedule> Roots, List<ClassSession> Sessions);
    private DateTime Now {get {var utc=(clock??TimeProvider.System).GetUtcNow().UtcDateTime;return new(utc.Ticks-utc.Ticks%10,DateTimeKind.Utc);}}
    private async Task<Actor> ActorFor(int userId, CancellationToken ct)
    {
        var id = ScheduleReadService.RequireSelectedUser(userId);
        var user = await db.Users.AsNoTracking().Include(u => u.UserRoles).ThenInclude(r => r.Role).SingleOrDefaultAsync(u => u.UserId == id, ct);
        var roles = user?.UserRoles.Select(r => r.Role.RoleName).ToHashSet() ?? [];
        var actor = new Actor(id, roles.Contains("teacher"), roles.Contains("admin_staff") || roles.Contains("center_manager"));
        if (user?.Status != "active" || !actor.Teacher && !actor.Manager) throw new ScheduleAccessException(400, "Tài khoản không có quyền Schedule Change Requests.");
        return actor;
    }
    private void RequireIntegration(bool apply = false)
    {
        if (!safety.GenericRoutesGuarded || apply && !safety.AttendanceWritesCoordinated)
            throw new ScheduleAccessException(503, "Chức năng ghi lịch tạm thời chưa được mở. Vui lòng liên hệ quản lý.");
    }
    private static void Teacher(Actor actor) {if (!actor.Teacher) throw new ScheduleAccessException(400, "Chỉ Teacher được gửi yêu cầu đổi lịch.");}
    private static void Manager(Actor actor) {if (!actor.Manager) throw new ScheduleAccessException(400, "Chỉ Admin Staff/Center Manager được xử lý yêu cầu đổi lịch.");}
    private static void Reviewer(Actor actor, ApprovalRequest header)
    {
        if (!actor.Manager || header.RequestedBy == actor.Id) throw new ScheduleAccessException(400, "AD/CM không được tự duyệt yêu cầu của mình.");
    }
    private async Task<State> Load(CancellationToken ct) => new(
        await db.Classes.AsNoTracking().Include(c => c.TeacherClasses).Include(c => c.TaClasses).AsSplitQuery().ToListAsync(ct),
        await db.ClassSchedules.AsNoTracking().Include(s => s.Versions).AsSplitQuery().ToListAsync(ct),
        await db.ClassSessions.AsNoTracking().Include(s => s.Attendances).AsSplitQuery().ToListAsync(ct));
    private static Class ForClass(State state, ClassSession session) => state.Classes.Single(c => c.ClassId == session.ClassId);
    private static ClassSession Target(State state, int id) => state.Sessions.SingleOrDefault(s => s.SessionId == id)
        ?? throw new ScheduleAccessException(404, "Không tìm thấy Session.");
    private static bool Assigned(Class c, int teacher) => c.TeacherClasses.Any(a => a.TeacherId == teacher && a.Status == "active");
    private static HashSet<int> Staff(Class c) => c.TeacherClasses.Where(a => a.Status == "active").Select(a => a.TeacherId)
        .Concat(c.TaClasses.Where(a => a.Status == "active").Select(a => a.TaId)).ToHashSet();
    private static bool Resource(Class a, string? room, Class b, string? other) => a.ClassId == b.ClassId || Staff(a).Overlaps(Staff(b)) || SameRoom(room, other);
    public static string SessionFingerprint(ClassSession s) => Hash(new {s.SessionId, s.ClassId, s.ScheduleId, s.ScheduleVersionId,
        s.PlannedOccurrenceDate, s.OccurrenceWeekStart, s.SessionDate, s.StartTime, s.EndTime, s.Room, s.Status});
    private static object Allocation(State state) => new {Classes = state.Classes.OrderBy(c => c.ClassId).Select(c => new {c.ClassId,c.StartDate,c.EndDate,c.Status, Staff = Staff(c).Order().ToArray()}),
        Roots = state.Roots.OrderBy(r => r.ScheduleId).Select(r => new {r.ScheduleId, Version = Version(r)}),
        Sessions = state.Sessions.OrderBy(s => s.SessionId).Select(s => new {Fingerprint = SessionFingerprint(s), Attendance = s.Attendances.Count})};
    private static ScheduleChangeActual Actual(ClassSession s) => new(FormatDate(s.SessionDate), FormatTime(s.StartTime), FormatTime(s.EndTime), s.Room, s.Status);
    private static ScheduleChangeSession SessionDto(State state, ClassSession s)
    {
        if (!s.ScheduleId.HasValue || !s.ScheduleVersionId.HasValue || !s.PlannedOccurrenceDate.HasValue || !s.OccurrenceWeekStart.HasValue)
            throw new ScheduleAccessException(409, "Session legacy chưa mapping planned identity/version.");
        return new(s.SessionId, s.ClassId, ForClass(state,s).ClassName, s.ScheduleId.Value,s.ScheduleVersionId.Value,
            s.PlannedOccurrenceDate.Value.ToString("yyyy-MM-dd"),s.OccurrenceWeekStart.Value.ToString("yyyy-MM-dd"),Actual(s),s.Attendances.Count>0);
    }
    private static ScheduleChangeActual? Proposed(Destination d, string kind) => d.Date.HasValue
        ? new(FormatDate(d.Date.Value),FormatTime(d.Start!.Value),FormatTime(d.End!.Value),d.Room,"scheduled") : null;
    private static TimeSpan TargetTime(string? value)
    {
        if(value==null||!Regex.IsMatch(value,@"^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,7})?)?$")||
            !TimeSpan.TryParse(value,CultureInfo.InvariantCulture,out var parsed)||parsed.Ticks%10!=0)
            throw new ArgumentException("Giờ đề xuất phải HH:mm[:ss], tối đa độ chính xác TIME(6).");
        return parsed;
    }
    private static Destination DestinationFor(ScheduleChangeInput input)
    {
        if (input.ChangeKind is not ("reschedule" or "cancel" or "makeup")) throw new ArgumentException("Loại yêu cầu không hợp lệ.");
        if (input.ChangeKind == "cancel")
        {
            if (input.ProposedSessionDate != null || input.ProposedStartTime != null || input.ProposedEndTime != null || input.ProposedRoom != null)
                throw new ArgumentException("Yêu cầu hủy không có destination.");
            return new(null,null,null,null);
        }
        var d = new Destination(Date(input.ProposedSessionDate),TargetTime(input.ProposedStartTime),TargetTime(input.ProposedEndTime),string.IsNullOrWhiteSpace(input.ProposedRoom)?null:input.ProposedRoom.Trim());
        if (!ValidSlot(d.Start!.Value,d.End!.Value) || d.Room?.Length>50) throw new ArgumentException("Giờ/phòng đề xuất không hợp lệ.");
        return d;
    }
    private static Destination DestinationFor(ScheduleChangeRequestDetail d) => new(d.ProposedSessionDate,d.ProposedStartTime,d.ProposedEndTime,d.ProposedRoom);
    private static string Reason(string value) => !string.IsNullOrWhiteSpace(value) && value.Trim().Length<=2000 ? value.Trim() : throw new ArgumentException("Nhập lý do, tối đa 2000 ký tự.");
    private static string Key(string value) => Guid.TryParseExact(value,"D",out var key) ? key.ToString("D") : throw new ArgumentException("ClientRequestKey phải là UUID.");
    private List<string> Validate(State state, ClassSession session, string kind, Destination dest)
    {
        var result = new List<string>(); var c = ForClass(state,session);
        if (!ValidSlot(session.StartTime,session.EndTime)) result.Add("Actual Session có giờ legacy không hợp lệ; cần kiểm tra dữ liệu.");
        if (!ValidClass(c)) result.Add("Class không còn active/upcoming hợp lệ.");
        if (session.Attendances.Count>0) result.Add("Session đã có Attendance; không được dời/hủy/bù.");
        if (session.Status != (kind=="makeup"?"cancelled":"scheduled")) result.Add("Trạng thái Session không phù hợp; completed luôn bị chặn.");
        if (kind!="makeup" && session.SessionDate.Date.Add(session.StartTime)<=Now.AddHours(7)) result.Add("Chỉ đổi/hủy Session chưa bắt đầu.");
        if (dest.Date.HasValue)
        {
            var date=dest.Date.Value;
            if (!InClass(c,date) || date.Add(dest.Start!.Value)<=Now.AddHours(7)) result.Add("Destination phải trong tương lai và thuộc thời gian Class.");
            if (kind=="reschedule" && date==session.SessionDate && dest.Start==session.StartTime && dest.End==session.EndTime && dest.Room==session.Room) result.Add("Lịch đề xuất phải khác actual hiện tại.");
            foreach(var other in state.Sessions.Where(s=>s.SessionId!=session.SessionId && s.Status!="cancelled" && s.SessionDate.Date==date.Date))
                if(Resource(c,dest.Room,ForClass(state,other),other.Room) && (!ValidSlot(other.StartTime,other.EndTime)||Overlap(dest.Start!.Value,dest.End!.Value,other.StartTime,other.EndTime)))
                    result.Add($"Conflict Class/Teacher/TA/Room với Session #{other.SessionId}.");
            var day=DateOnly.FromDateTime(date);var week=Monday(day);
            foreach(var root in state.Roots)
            {
                // Materialized occurrences are represented by actual bookings above. A cancelled
                // or moved occurrence must not also reserve its obsolete template destination.
                if(root.ScheduleId==session.ScheduleId && week==session.OccurrenceWeekStart || state.Sessions.Any(s=>s.ScheduleId==root.ScheduleId && s.OccurrenceWeekStart==week))continue;
                var other=state.Classes.Single(c=>c.ClassId==root.ClassId);if(!ValidClass(other)||!InClass(other,date))continue;
                var version=At(root,day);if(version==null||Weekday(version.DayOfWeek)!=day.DayOfWeek)continue;
                if(Resource(c,dest.Room,other,version.Room)&&(!ValidSlot(version.StartTime,version.EndTime)||Overlap(dest.Start!.Value,dest.End!.Value,version.StartTime,version.EndTime)))
                    result.Add($"Conflict Class/Teacher/TA/Room với ca #{root.ScheduleId}.");
            }
        }
        return result.Distinct().ToList();
    }
    private async Task<ScheduleChangeRequestDetail> Detail(int id, Actor actor, CancellationToken ct)
    {
        var detail=await db.ScheduleChangeRequestDetails.AsNoTracking().Include(d=>d.Request).SingleOrDefaultAsync(d=>d.RequestId==id,ct);
        if(detail==null||!actor.Manager&&detail.Request.RequestedBy!=actor.Id)throw new ScheduleAccessException(404,"Không tìm thấy typed request trong phạm vi của bạn. Legacy text không có typed detail.");
        if(detail.Request.RequestType!="schedule_change")throw new ScheduleAccessException(409,"Header type không còn khớp typed detail; cần owner kiểm tra.");
        return detail;
    }
    private static ScheduleChangeDto Map(ScheduleChangeRequestDetail d, State state)
    {
        if(d.Request.RequestType!="schedule_change"||(d.Request.Status=="approved")!=d.AppliedAt.HasValue)
            throw new ScheduleAccessException(409,"Header/detail không nhất quán; cần owner kiểm tra. Không coi Approved là đã apply.");
        return new(d.RequestId,d.Request.RequestCode,d.Request.RequestedBy,d.Request.ReviewedBy,d.Request.Status,d.ChangeKind,
            d.Request.Reason??"",d.Request.ReviewNotes,d.ClientRequestKey,DateTime.SpecifyKind(d.Request.CreatedAt,DateTimeKind.Utc),
            d.Request.ReviewedAt.HasValue?DateTime.SpecifyKind(d.Request.ReviewedAt.Value,DateTimeKind.Utc):null,d.AppliedAt.HasValue?DateTime.SpecifyKind(d.AppliedAt.Value,DateTimeKind.Utc):null,
            new(FormatDate(d.OriginalSessionDate),FormatTime(d.OriginalStartTime),FormatTime(d.OriginalEndTime),d.OriginalRoom,d.OriginalStatus),Proposed(DestinationFor(d),d.ChangeKind),SessionDto(state,Target(state,d.SessionId)));
    }
    public async Task<ScheduleChangeCapabilities> Capabilities(int userId,CancellationToken ct)
    {
        var a=await ActorFor(userId,ct);return new(a.Id,a.Teacher,a.Teacher&&safety.GenericRoutesGuarded,a.Manager&&safety.GenericRoutesGuarded,a.Manager&&safety.GenericRoutesGuarded&&safety.AttendanceWritesCoordinated,a.Manager,
            !safety.GenericRoutesGuarded?"Tạm thời chỉ xem/xem trước yêu cầu; chức năng gửi và xử lý chưa được mở.":!safety.AttendanceWritesCoordinated?"Tạm thời chưa mở phê duyệt và áp dụng lịch; vẫn có thể xem/từ chối yêu cầu.":null);
    }
    public async Task<List<ScheduleChangeDto>> List(int userId,CancellationToken ct)
    {
        var a=await ActorFor(userId,ct);var rows=await db.ScheduleChangeRequestDetails.AsNoTracking().Include(d=>d.Request)
            .Where(d=>a.Manager||d.Request.RequestedBy==a.Id).OrderByDescending(d=>d.RequestId).ToListAsync(ct);var state=await Load(ct);return rows.Select(d=>Map(d,state)).ToList();
    }
    public async Task<ScheduleChangeDto> Get(int userId,int id,CancellationToken ct)
    {var a=await ActorFor(userId,ct);return Map(await Detail(id,a,ct),await Load(ct));}
    private async Task<ScheduleChangePreview> PrepareSubmit(Actor actor,ScheduleChangeInput input,State state,CancellationToken ct)
    {
        Teacher(actor);var session=Target(state,input.SessionId);var c=ForClass(state,session);
        if(!Assigned(c,actor.Id))throw new ScheduleAccessException(404,"Session không thuộc Class được phân công active.");
        var dest=DestinationFor(input);var reason=Reason(input.Reason);var key=Key(input.ClientRequestKey);var reasons=Validate(state,session,input.ChangeKind,dest);
        if(await db.ScheduleChangeRequestDetails.AnyAsync(d=>d.SessionId==session.SessionId&&d.Request.Status=="pending",ct))reasons.Add("Session đã có typed request pending.");
        var dto=SessionDto(state,session);return new(Hash(new {actor.Id,input.SessionId,input.ChangeKind,reason,key,dest,Allocation=Allocation(state),reasons}),reasons.Count==0,reasons,dto,Proposed(dest,input.ChangeKind));
    }
    public async Task<ScheduleChangePreview> Preview(int userId,ScheduleChangeInput input,CancellationToken ct)
    {
        var actor=await ActorFor(userId,ct);await using var tx=await db.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead,ct);
        var preview=await PrepareSubmit(actor,input,await Load(ct),ct);await tx.CommitAsync(ct);return preview;
    }
    public async Task<ScheduleChangeDto> Submit(int userId,ScheduleChangeInput input,CancellationToken ct)
    {
        var actor=await ActorFor(userId,ct);Teacher(actor);RequireIntegration();
        return await ScheduleWriteTransaction.Run(db,async()=>
        {
            actor=await ActorFor(userId,ct);Teacher(actor);var key=Key(input.ClientRequestKey);var dest=DestinationFor(input);var reason=Reason(input.Reason);
            var prior=await db.ScheduleChangeRequestDetails.AsNoTracking().Include(d=>d.Request).SingleOrDefaultAsync(d=>d.ClientRequestKey==key,ct);var state=await Load(ct);
            if(prior!=null)
            {
                if(prior.Request.RequestedBy!=actor.Id)throw new ScheduleAccessException(404,"ClientRequestKey không thuộc bạn.");
                if(prior.SessionId!=input.SessionId||prior.ChangeKind!=input.ChangeKind||prior.Request.Reason!=reason||DestinationFor(prior)!=dest)throw new ScheduleAccessException(409,"Không tái sử dụng key cho payload khác.");
                return Map(prior,state);
            }
            var preview=await PrepareSubmit(actor,input,state,ct);
            if(!preview.Allowed||preview.PreviewToken!=input.PreviewToken)throw new ScheduleAccessException(409,"Preview cũ/không hợp lệ. Xem lại trước khi gửi.");
            var s=Target(state,input.SessionId);var header=new ApprovalRequest {RequestCode="SC"+Guid.NewGuid().ToString("N")[..16],RequestType="schedule_change",ClassId=s.ClassId,
                Title=$"{input.ChangeKind} Session #{s.SessionId}",Description=reason,Reason=reason,RequestedBy=actor.Id,Status="pending",Priority="medium",CreatedAt=Now};
            var detail=new ScheduleChangeRequestDetail {Request=header,SessionId=s.SessionId,ChangeKind=input.ChangeKind,ClientRequestKey=key,ExpectedSessionFingerprint=SessionFingerprint(s),
                OriginalSessionDate=s.SessionDate,OriginalStartTime=s.StartTime,OriginalEndTime=s.EndTime,OriginalRoom=s.Room,OriginalStatus=s.Status,
                ProposedSessionDate=dest.Date,ProposedStartTime=dest.Start,ProposedEndTime=dest.End,ProposedRoom=dest.Room};
            db.ScheduleChangeRequestDetails.Add(detail);await db.SaveChangesAsync(ct);return Map(detail,state);
        },ct);
    }
    public async Task<ScheduleChangeDto> Claim(int userId,int id,CancellationToken ct)
    {
        Manager(await ActorFor(userId,ct));RequireIntegration();return await ScheduleWriteTransaction.Run(db,async()=>
        {
            var a=await ActorFor(userId,ct);var d=await Detail(id,a,ct);Reviewer(a,d.Request);
            if(d.Request.Status!="pending"||d.Request.ReviewedBy.HasValue&&d.Request.ReviewedBy!=a.Id)throw new ScheduleAccessException(409,"Request đã được xử lý/claim bởi người khác.");
            if(!d.Request.ReviewedBy.HasValue){d.Request.ReviewedBy=a.Id;d.Request.ReviewedAt=Now;db.ApprovalRequests.Update(d.Request);await db.SaveChangesAsync(ct);}
            return Map(d,await Load(ct));
        },ct);
    }
    private async Task<ScheduleChangePreview> PrepareDecision(Actor a,ScheduleChangeRequestDetail d,ScheduleChangeDecisionInput input,State state,CancellationToken ct)
    {
        Reviewer(a,d.Request);if(input.Decision is not ("approved" or "rejected"))throw new ArgumentException("Decision phải approved hoặc rejected.");
        var notes=input.ReviewNotes?.Trim();if(notes?.Length>2000||input.Decision=="rejected"&&string.IsNullOrWhiteSpace(notes))throw new ArgumentException("Từ chối cần lý do, tối đa 2000 ký tự.");
        if(d.Request.Status!="pending"||d.AppliedAt.HasValue||d.Request.ReviewedBy!=a.Id)throw new ScheduleAccessException(409,"Cần claim request pending trước khi quyết định.");
        var session=Target(state,d.SessionId);var reasons=new List<string>();
        if(input.Decision=="approved")
        {
            reasons=Validate(state,session,d.ChangeKind,DestinationFor(d));
            if(SessionFingerprint(session)!=d.ExpectedSessionFingerprint)reasons.Add("Actual Session đã đổi sau khi submit; không apply snapshot cũ.");
            var requester=await db.Users.AsNoTracking().Include(u=>u.UserRoles).ThenInclude(r=>r.Role).SingleOrDefaultAsync(u=>u.UserId==d.Request.RequestedBy,ct);
            if(requester?.Status!="active"||!requester.UserRoles.Any(r=>r.Role.RoleName=="teacher")||!Assigned(ForClass(state,session),d.Request.RequestedBy))reasons.Add("Teacher requester không còn active/được phân công.");
            if(d.Request.ClassId!=session.ClassId)reasons.Add("Header Class không khớp Session.");
        }
        var dto=Map(d,state);return new(Hash(new {a.Id,input.Decision,notes,Request=dto,Allocation=Allocation(state),reasons}),reasons.Count==0,reasons,dto.Session,dto.Proposed,dto);
    }
    public async Task<ScheduleChangePreview> DecisionPreview(int userId,int id,ScheduleChangeDecisionInput input,CancellationToken ct)
    {
        var a=await ActorFor(userId,ct);await using var tx=await db.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead,ct);
        var p=await PrepareDecision(a,await Detail(id,a,ct),input,await Load(ct),ct);await tx.CommitAsync(ct);return p;
    }
    public async Task<ScheduleChangeDto> Decide(int userId,int id,ScheduleChangeDecisionInput input,CancellationToken ct)
    {
        Manager(await ActorFor(userId,ct));RequireIntegration(input.Decision=="approved");return await ScheduleWriteTransaction.Run(db,async()=>
        {
            var a=await ActorFor(userId,ct);
            await db.ApprovalRequests.FromSqlInterpolated($"SELECT * FROM approval_requests WHERE request_id={id} FOR UPDATE").AsNoTracking().ToListAsync(ct);
            var d=await Detail(id,a,ct);Reviewer(a,d.Request);
            await db.ClassSessions.FromSqlInterpolated($"SELECT * FROM class_sessions WHERE session_id={d.SessionId} FOR UPDATE").AsNoTracking().ToListAsync(ct);
            var state=await Load(ct);
            if(d.Request.Status==input.Decision && (input.Decision=="approved"&&d.AppliedAt.HasValue||input.Decision=="rejected"&&!d.AppliedAt.HasValue))return Map(d,state);
            var preview=await PrepareDecision(a,d,input,state,ct);
            if(!preview.Allowed||preview.PreviewToken!=input.PreviewToken)throw new ScheduleAccessException(409,"Decision Preview cũ/không hợp lệ; chưa thay lịch hoặc đánh dấu Approved.");
            if(input.Decision=="approved")
            {
                var session=await db.ClassSessions.SingleAsync(s=>s.SessionId==d.SessionId,ct);
                if(d.ChangeKind=="cancel")session.Status="cancelled";
                else {session.SessionDate=d.ProposedSessionDate!.Value;session.StartTime=d.ProposedStartTime!.Value;session.EndTime=d.ProposedEndTime!.Value;session.Room=d.ProposedRoom;session.Status="scheduled";}
                d.AppliedAt=Now;db.ScheduleChangeRequestDetails.Attach(d);db.Entry(d).Property(x=>x.AppliedAt).IsModified=true;
            }
            d.Request.Status=input.Decision;d.Request.ReviewedBy=a.Id;d.Request.ReviewedAt=Now;d.Request.ReviewNotes=input.ReviewNotes?.Trim();
            db.ApprovalRequests.Update(d.Request);await db.SaveChangesAsync(ct);
            return Map(d,await Load(ct));
        },ct);
    }
}
