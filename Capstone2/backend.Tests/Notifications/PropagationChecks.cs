using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Implementation;
using EduTrack.API.Services.Learning.Implementation;
using EduTrack.API.Services.Management.Implementation;
using EduTrack.API.Services.Notifications;
using Microsoft.EntityFrameworkCore;

static class PropagationChecks
{
    public static async Task RunAsync(Func<EduTrackDbContext> factory, Action<bool, string> check)
    {
        await using var db = factory();
        db.Roles.Add(new() { RoleId = 600, RoleName = "parent" });
        foreach (var (id, role, status) in new[] {
            (508,507,"active"), (509,507,"active"), (510,507,"inactive"), (511,507,"active"),
            (601,600,"active"), (602,600,"active"), (603,600,"inactive"), (604,503,"active"), (605,0,"active") })
            db.Users.Add(new() { UserId = id, UserCode = "NOTIFY-QA-" + id, FullName = "Propagation QA " + id,
                PasswordHash = "isolated-fixture", Status = status,
                UserRoles = role == 0 ? [] : [new() { RoleId = role }] });
        await db.SaveChangesAsync();
        // Sender also has a valid parent link; must still never receive a copy.
        db.UserRoles.Add(new() { UserId = 501, RoleId = 600 });
        db.ParentStudents.AddRange(new() { ParentId = 601, StudentId = 507 }, new() { ParentId = 602, StudentId = 507 },
            new() { ParentId = 601, StudentId = 508 }, new() { ParentId = 603, StudentId = 507 },
            new() { ParentId = 604, StudentId = 507 }, new() { ParentId = 605, StudentId = 507 },
            new() { ParentId = 501, StudentId = 507 }, new() { ParentId = 601, StudentId = 503 });
        db.Classes.Add(new() { ClassId = 701, ClassName = "Notification QA Class", Status = "active", StartDate = DateTime.UtcNow.Date,
            Subject = new() { SubjectName = "Notification QA Subject", SubjectCode = "NTF-QA" } });
        foreach (var id in new[] { 507, 508, 509, 510, 511 })
            db.StudentClasses.Add(new() { ClassId = 701, StudentId = id, Status = id == 511 ? "dropped" : "active" });
        db.TeacherClasses.AddRange(new() { ClassId = 701, TeacherId = 503, Status = "active" }, new() { ClassId = 701, TeacherId = 506, Status = "active" });
        db.TaClasses.Add(new() { ClassId = 701, TaId = 504, Status = "active" });
        await db.SaveChangesAsync();
        var repository = new NotificationRepository(db);
        var service = new ManagementNotificationService(repository, new UserRepository(db), new ClassRepository(db));
        var oldRecipients = await db.NotificationRecipients.AsNoTracking().OrderBy(r => r.RecipientId).ToListAsync();
        var approvalsBefore = await db.ApprovalRequests.CountAsync();
        async Task<int> Send(string scope, int[] expected, int? userId = null, string? role = null, int? classId = null, int sender = 501)
        {
            var before = await db.Notifications.CountAsync();
            var sent = await service.CreateAsync(new() { SenderId = sender, Title = "Propagation " + scope,
                Content = "Isolated real database propagation check", Type = "announcement", TargetScope = scope,
                UserId = userId, TargetRole = role, ClassId = classId });
            var rows = await db.NotificationRecipients.AsNoTracking().Where(r => r.NotificationId == sent.NotificationId).ToListAsync();
            check(rows.Select(r => r.UserId).Order().SequenceEqual(expected.Order()), "NTF-01 exact audience " + scope + "/" + (userId?.ToString() ?? role ?? classId?.ToString() ?? "all"));
            check(rows.Select(r => r.UserId).Distinct().Count() == rows.Count && rows.All(r => r.UserId != sender), "Unique recipients and no sender: " + scope);
            check(await db.Notifications.CountAsync() == before + 1 && rows.All(r => !r.IsRead && r.ReadAt == null && r.DeletedAt == null), "One root and independent initial states: " + scope);
            return sent.NotificationId;
        }
        var direct = await Send("user", [507, 601, 602], userId: 507);
        await Send("user", [508, 601], userId: 508);
        await Send("user", [509], userId: 509);
        await Send("user", [503], userId: 503);
        await Send("user", [601], userId: 601);
        await Send("role", [507, 508, 509, 511, 601, 602], role: "student");
        await Send("class", [503, 504, 507, 508, 509, 601, 602], classId: 701);
        await Send("all", [502, 503, 504, 505, 507, 508, 509, 511, 601, 602, 604]);
        await Send("role", [505], role: "center_manager");
        await Send("role", [501, 505], role: "center_manager", sender: 502);
        foreach (var dto in new[] {
            new CreateManagementNotificationDto { SenderId = 501, Title = "Self only", Content = "No audience", Type = "system", TargetScope = "user", UserId = 501 },
            new CreateManagementNotificationDto { SenderId = 501, Title = "Inactive", Content = "No audience", Type = "system", TargetScope = "user", UserId = 510 },
            new CreateManagementNotificationDto { SenderId = 501, Title = "Parent role", Content = "Not a primary role", Type = "system", TargetScope = "role", TargetRole = "parent" },
            new CreateManagementNotificationDto { SenderId = 501, Title = "   ", Content = "Whitespace", Type = "system" },
            new CreateManagementNotificationDto { SenderId = 501, Title = new string('a',201), Content = "Length", Type = "system" },
            new CreateManagementNotificationDto { SenderId = 501, Title = "Length", Content = new string('a',4001), Type = "system" } })
        {
            var before = await db.Notifications.CountAsync();
            try { await service.CreateAsync(dto); throw new Exception("Invalid send accepted"); }
            catch (InvalidOperationException e) { check(!string.IsNullOrWhiteSpace(e.Message) && await db.Notifications.CountAsync() == before, "Rejected without writes: " + dto.Title.Trim()[..Math.Min(dto.Title.Trim().Length, 24)]); }
        }
        await repository.MarkReadAsync(direct, 507);
        var studentRead = (await new NotificationInboxService(db).SnapshotAsync(507)).Inbox.Single(n => n.NotificationId == direct).ReadAt;
        check(studentRead.HasValue && !(await new NotificationInboxService(db).SnapshotAsync(601)).Inbox.Single(n => n.NotificationId == direct).IsRead, "Student read never changes parent read state");
        await repository.HideReadAsync(direct, 507);
        check(!(await new NotificationInboxService(db).SnapshotAsync(507)).Inbox.Any(n => n.NotificationId == direct)
            && (await new NotificationInboxService(db).SnapshotAsync(601)).Inbox.Any(n => n.NotificationId == direct), "Student soft delete never hides parent Inbox");
        await repository.MarkReadAsync(direct, 601); await repository.HideReadAsync(direct, 601);
        check((await new NotificationInboxService(db).SnapshotAsync(602)).Inbox.Single(n => n.NotificationId == direct).ReadAt == null,
            "Parent read/delete never changes sibling parent state");
        check((await db.NotificationRecipients.AsNoTracking().SingleAsync(r => r.NotificationId == direct && r.UserId == 507)).ReadAt == studentRead,
            "Parent read/delete never changes student's original ReadAt");
        var learner = new LearnerDashboardService(db); var countBefore = await db.Notifications.CountAsync();
        check(!(await learner.GetStudentNotificationsAsync(507)).Any(n => n.NotificationId == direct)
            && !(await learner.GetParentNotificationsAsync(601, 508)).Any(n => n.NotificationId == direct), "Legacy learning endpoints respect own soft delete");
        check(!await learner.MarkNotificationAsReadAsync(direct, 509), "Legacy mark-read cannot invent recipients");
        await learner.MarkAllNotificationsAsReadAsync(602, 507);
        check((await db.NotificationRecipients.AsNoTracking().SingleAsync(r => r.NotificationId == direct && r.UserId == 507)).ReadAt == studentRead,
            "Legacy parent Read All cannot mark the child's account");
        check(await db.Notifications.CountAsync() == countBefore, "Legacy notification GET never seeds or backfills");
        check(await db.ApprovalRequests.CountAsync() == approvalsBefore, "Every notification send leaves Approval Requests unchanged");
        var oldIds = oldRecipients.Select(r => r.RecipientId).ToArray();
        var unchanged = await db.NotificationRecipients.AsNoTracking().Where(r => oldIds.Contains(r.RecipientId)).OrderBy(r => r.RecipientId).ToListAsync();
        check(oldRecipients.Zip(unchanged).All(pair => pair.First.IsRead == pair.Second.IsRead && pair.First.ReadAt == pair.Second.ReadAt && pair.First.DeletedAt == pair.Second.DeletedAt), "No old-notification backfill or recipient modification");
        for (var id = 800; id < 825; id++) db.Users.Add(new() { UserId = id, UserCode = "SEARCH-QA-" + id, FullName = "Search Recipient " + id,
            PasswordHash = "isolated-fixture", Status = "active", UserRoles = [new() { RoleId = 503 }] });
        await db.SaveChangesAsync();
        var search = new NotificationRecipientSearchService(db);
        check((await search.SearchAsync(501, "Search Recipient", 999)).Count == 20, "Search applies SQL result cap of 20");
        check((await search.SearchAsync(501, "SEARCH-QA-824")).Single().UserId == 824, "Search matches UserCode");
        check((await search.SearchAsync(501, "Propagation QA 601")).Single().UserId == 601, "Legacy Parent is searchable individually");
        check((await search.SearchAsync(501, "NOTIFY-QA-501")).Count == 0 && (await search.SearchAsync(501, "NOTIFY-QA-603")).Count == 0
            && (await search.SearchAsync(501, "NOTIFY-QA-605")).Count == 0, "Search excludes self, inactive and unsupported accounts");
        check((await search.SearchAsync(501, " ")).Count == 0 && (await search.SearchAsync(501, "absent-recipient")).Count == 0, "Search short-query and empty results");
    }
}
