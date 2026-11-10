using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using EduTrack.API.Controllers.Management;
using EduTrack.API.Controllers.Queries;
using EduTrack.API.Controllers.Teaching;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Implementation;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Management.Implementation;
using EduTrack.API.Services.Management.Interfaces;
using EduTrack.API.Services.Notifications;
using EduTrack.API.Services.Teaching.Implementation;
using EduTrack.API.Services.Teaching.Interfaces;
using EduTrack.API.Helpers.DependencyInjection;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using MySqlConnector;

var checks = 0;
void Check(bool condition, string name) { if (!condition) throw new Exception("FAIL " + name); checks++; Console.WriteLine("PASS " + name); }
int SelectedUser(int id) => id;
Check(NotificationInboxService.IsManager(new(501, "QA", "QA", null, null, ["center_manager"])), "Manager role policy");
Check(!NotificationInboxService.IsManager(new(503, "QA", "QA", null, null, ["teacher"])), "Teacher cannot manage Trash");
if (!args.Contains("--mysql")) { Console.WriteLine($"{checks} offline checks; no host/database accessed."); return; }
var cs = new MySqlConnectionStringBuilder { Server = "127.0.0.1", Port = 33308, UserID = "root", Password = "", Pooling = false, SslMode = MySqlSslMode.Disabled };
await using (var probe = new MySqlConnection(cs.ConnectionString))
{
    await probe.OpenAsync(); await using var command = new MySqlCommand("SELECT @@port,@@datadir", probe);
    await using var reader = await command.ExecuteReaderAsync(); await reader.ReadAsync();
    if (reader.GetInt32(0) != 33308 || !reader.GetString(1).Replace('\\', '/').Contains("/edutrack-enrollment-mysql-"))
        throw new Exception("Verified independent MySQL required BEFORE any write");
}
cs.Database = "edutrack_notify_test_" + Guid.NewGuid().ToString("N");
var options = new DbContextOptionsBuilder<EduTrackDbContext>().UseMySql(cs.ConnectionString, new MySqlServerVersion(new Version(8, 0, 44))).Options;
var clock = new FixtureClock();
EduTrackDbContext Db() => new(options);
async Task<T> Use<T>(Func<NotificationInboxService, Task<T>> action) { await using var db = Db(); return await action(new(db, clock)); }
async Task Denied(Func<Task> action, int code, string name)
{
    try { await action(); throw new Exception("Expected denial " + name); }
    catch (NotificationAccessException e) { Check(e.Status == code, name); }
}
WebApplication? app = null;
try
{
    await using (var db = Db())
    {
        await db.Database.EnsureCreatedAsync();
        foreach (var (id, role) in new[] { (501, "center_manager"), (502, "admin_staff"), (503, "teacher"), (504, "teaching_assistant"), (505, "center_manager"), (506, "teacher"), (507, "student") })
            db.Users.Add(new() { UserId = id, UserCode = "NOTIFY-QA-" + id, FullName = "Verified " + role + " " + id, Email = $"qa{id}@example.test", PasswordHash = "isolated-fixture", Status = id == 506 ? "inactive" : "active", UserRoles = [new() { Role = new() { RoleId = id, RoleName = role + (id == 505 || id == 506 ? "_unused" : "") } }] });
        var avatar = "data:image/svg+xml;base64," + Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes("<svg xmlns='http://www.w3.org/2000/svg' width='38' height='38'><circle cx='19' cy='19' r='19' fill='#3153bf'/><text x='19' y='24' text-anchor='middle' fill='white' font-size='16'>QA</text></svg>"));
        foreach (var user in db.Users.Local.Where(u => u.UserId is 501 or 505)) user.AvatarUrl = avatar;
        await db.SaveChangesAsync();
        // Reuse role rows to satisfy the existing unique role_name constraint.
        db.UserRoles.RemoveRange(await db.UserRoles.Where(r => r.UserId == 505 || r.UserId == 506).ToListAsync());
        db.UserRoles.AddRange(new() { UserId = 505, RoleId = 501 }, new() { UserId = 506, RoleId = 503 });
        for (var id = 1; id <= 26; id++)
            db.Notifications.Add(new() { NotificationId = id, SenderId = 505, Title = "Shared notice " + id, Content = "Notification integration fixture with long content. Read/delete state belongs only to each recipient.", Type = id % 2 == 0 ? "schedule" : "announcement", TargetScope = "all", CreatedAt = clock.GetUtcNow().UtcDateTime.AddDays(-10), IsRead = true,
                Recipients = new[] { 501, 502, 503, 504 }.Select(uid => new NotificationRecipient { UserId = uid, IsRead = id > 20, ReadAt = id > 20 ? clock.GetUtcNow().UtcDateTime : null }).ToList() });
        db.Notifications.Add(new() { NotificationId = 100, SenderId = 505, Title = "AD private", Content = "Only AD recipient", Type = "system", CreatedAt = clock.GetUtcNow().UtcDateTime, Recipients = [new() { UserId = 502 }] });
        db.Notifications.Add(new() { NotificationId = 101, SenderId = 505, Title = "Legacy read without ReadAt", Content = "No invented read timestamp", Type = "system", CreatedAt = clock.GetUtcNow().UtcDateTime, Recipients = [new() { UserId = 501, IsRead = true }] });
        await db.SaveChangesAsync();
    }
    await Denied(async () => await Use(s => s.SnapshotAsync(0)), 400, "Missing user selector is rejected");
    await Denied(async () => await Use(s => s.SnapshotAsync(SelectedUser(506))), 400, "Inactive account denied");
    var cm = await Use(s => s.SnapshotAsync(SelectedUser(501))); var adBefore = await Use(s => s.SnapshotAsync(SelectedUser(502)));
    Check(cm.Inbox.Count == 27 && cm.UnreadCount == 20, "Complete own Inbox and recipient unread count, never global IsRead");
    Check(!cm.Inbox.Any(n => n.NotificationId == 100), "AD-only notification never leaks to CM");
    Check(cm.Inbox.First(n => n.NotificationId <= 26).SenderAvatarUrl?.StartsWith("data:image/svg+xml;base64,") == true, "Snapshot preserves existing sender avatar metadata");
    foreach (var id in new[] { 503, 504 })
        Check((await Use(s => s.SnapshotAsync(SelectedUser(id)))).Inbox.Count == 26, "Teacher/TA only recipient membership " + id);
    Check(!JsonSerializer.Serialize(cm).Contains("PasswordHash"), "Verified identity never returns password hashes");
    Check(cm.Inbox.Where(n => n.NotificationId <= 26).First().NotificationId == 26, "Stable createdAt/ID descending ordering");
    await Denied(async () => await Use(s => s.ItemAsync(SelectedUser(501), 100)), 404, "Detail IDOR denied");
    await Denied(async () => await Use(s => s.MutateAsync(SelectedUser(501), "read", 100)), 404, "Read IDOR denied");
    await Denied(async () => await Use(s => s.MutateAsync(SelectedUser(501), "restore", 100)), 404, "CM cannot restore AD-only recipient");
    await Denied(async () => await Use(s => s.MutateAsync(SelectedUser(501), "delete", 1)), 409, "Unread delete rejected");
    await Denied(async () => await Use(s => s.MutateAsync(SelectedUser(503), "delete", 26)), 400, "Teacher Trash action denied");
    var first = await Use(s => s.MutateAsync(SelectedUser(501), "read", 1)); var readAt = first.Inbox.Single(n => n.NotificationId == 1).ReadAt;
    Check(first.UnreadCount == 19 && readAt == clock.GetUtcNow().UtcDateTime, "Mark read persists real server UTC and decreases count");
    clock.Advance(TimeSpan.FromMinutes(2));
    var reopen = await Use(s => s.MutateAsync(SelectedUser(501), "read", 1));
    Check(reopen.Inbox.Single(n => n.NotificationId == 1).ReadAt == readAt, "Reopen does not reset ReadAt");
    var legacy = await Use(s => s.MutateAsync(SelectedUser(501), "read", 101));
    Check(legacy.Inbox.Single(n => n.NotificationId == 101).ReadAt == null, "Legacy read NULL never receives invented time");
    var removed = await Use(s => s.MutateAsync(SelectedUser(501), "delete", 1));
    Check(!removed.Inbox.Any(n => n.NotificationId == 1) && removed.Trash.Single(n => n.NotificationId == 1).ReadAt == readAt, "Soft delete moves own read row to Trash and preserves read time");
    await Denied(async () => await Use(s => s.ItemAsync(SelectedUser(501), 1)), 404, "Deleted deep link is not an Inbox detail");
    clock.Advance(TimeSpan.FromMinutes(4));
    var restored = await Use(s => s.MutateAsync(SelectedUser(501), "restore", 1));
    Check(restored.Inbox.Single(n => n.NotificationId == 1).ReadAt == readAt && restored.Trash.Count == 0, "Restore after grace retains original ReadAt and state");
    var adAfter = await Use(s => s.SnapshotAsync(SelectedUser(502)));
    Check(JsonSerializer.Serialize(adBefore.Inbox) == JsonSerializer.Serialize(adAfter.Inbox), "CM mutations preserve every AD recipient field");
    await Use(s => s.MutateAsync(SelectedUser(501), "delete", 26));
    var readAll = await Use(s => s.MutateAsync(SelectedUser(501), "read-all"));
    Check(readAll.UnreadCount == 0 && readAll.Trash.Count == 1 && readAll.Trash[0].ReadAt == cm.Inbox.Single(n => n.NotificationId == 26).ReadAt, "Read all excludes deleted recipients and preserves prior read times");
    await using (var db = Db())
    {
        Check(await db.Notifications.CountAsync() == 28 && await db.NotificationRecipients.CountAsync() == 106, "No root delete or recipient creation during Inbox actions");
        Check(await db.Notifications.AllAsync(n => n.NotificationId > 26 || n.IsRead), "No mutation of legacy root IsRead");
        var service = new TeachingNotificationService(db); var count = await db.Notifications.CountAsync();
        Check((await service.GetNotificationsAsync(507)).Count == 0 && await db.Notifications.CountAsync() == count, "Teaching GET never seeds sample notifications");
        Check(!await service.MarkAsReadAsync(100, 503), "Teaching legacy service never creates unauthorized recipient");
        var management = new ManagementNotificationService(new NotificationRepository(db), new UserRepository(db), new ClassRepository(db));
        Check((await management.GetSentAsync(505)).Count == 28, "Recipient soft delete preserves sender's complete Sent history");
    }
    // Concurrent marking must retain a single first-read timestamp.
    var concurrent = await Task.WhenAll(Enumerable.Range(0, 5).Select(_ => Use(s => s.MutateAsync(SelectedUser(503), "read", 2))));
    Check(concurrent.All(s => s.Inbox.Single(n => n.NotificationId == 2).ReadAt == clock.GetUtcNow().UtcDateTime), "Concurrent same-row mark read is atomic/idempotent");
    await PropagationChecks.RunAsync(Db, Check);
    if (args.Contains("--http"))
    {
        var hostRoot = Path.Combine(Path.GetTempPath(), "edutrack-notification-host-" + Guid.NewGuid().ToString("N")); Directory.CreateDirectory(hostRoot);
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { ContentRootPath = hostRoot, EnvironmentName = "IsolatedNotifications" });
        builder.Logging.ClearProviders(); builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddDbContext<EduTrackDbContext>(o => o.UseMySql(cs.ConnectionString, new MySqlServerVersion(new Version(8, 0, 44))));
        builder.Services.AddSingleton<TimeProvider>(clock);
        builder.Services.AddCoreInfrastructure();
        builder.Services.AddScoped<INotificationRepository, NotificationRepository>(); builder.Services.AddScoped<IUserRepository, UserRepository>(); builder.Services.AddScoped<IClassRepository, ClassRepository>();
        builder.Services.AddScoped<IManagementNotificationService, ManagementNotificationService>(); builder.Services.AddScoped<ITeachingNotificationService, TeachingNotificationService>();
        builder.Services.AddControllers().AddApplicationPart(typeof(NotificationInboxController).Assembly).ConfigureApplicationPartManager(m => m.FeatureProviders.Add(new OnlyNotifications()));
        app = builder.Build();
        var actors = new Dictionary<string, int> { ["center-manager"] = 501, ["admin-staff"] = 502, ["teacher"] = 503, ["teaching-assistant"] = 504 };
        app.MapControllers();
        var frontend = Environment.GetEnvironmentVariable("EDUTRACK_TEST_FRONTEND_ROOT");
        if (!string.IsNullOrEmpty(frontend))
        {
            var dist = Path.GetFullPath(Path.Combine(frontend, "dist")); app.UseStaticFiles(new StaticFileOptions { FileProvider = new PhysicalFileProvider(dist) });
            app.MapFallback(async http => { if (http.Request.Path.StartsWithSegments("/api")) { http.Response.StatusCode = 404; return; } http.Response.ContentType = "text/html"; await http.Response.SendFileAsync(Path.Combine(dist, "index.html")); }).WithMetadata(new Microsoft.AspNetCore.Routing.HttpMethodMetadata(["GET"]));
        }
        await app.StartAsync(); var origin = app.Urls.Single(); using var client = new HttpClient { BaseAddress = new Uri(origin) };
        Check((await client.GetAsync("/api/notifications/inbox")).StatusCode == HttpStatusCode.BadRequest, "Missing selector is input validation, never missing-session 401");
        var response = await client.GetFromJsonAsync<NotificationInboxSnapshot>("/api/notifications/inbox/snapshot?userId=503");
        Check(response!.Identity.UserId == 503 && !response.Inbox.Any(n => n.NotificationId == 100), "Anonymous caller selects Teacher recipient data");
        var adResponse = await client.GetFromJsonAsync<NotificationInboxSnapshot>("/api/notifications/inbox/snapshot?userId=502");
        Check(adResponse!.Inbox.Any(n => n.NotificationId == 100), "Selecting a different user is intentionally possible, not access protection");
        Check((await client.PostAsync("/api/notifications/100/restore?userId=503", null)).StatusCode == HttpStatusCode.BadRequest, "Teacher persona has no Trash workflow");
        Check((await client.GetAsync("/api/notifications/100?userId=503")).StatusCode == HttpStatusCode.NotFound, "Detail must belong to selected recipient");
        Check((await client.PutAsync("/api/teaching/notifications/100/read?userId=503", null)).StatusCode == HttpStatusCode.NotFound, "Mark-read never creates a recipient");
        var priorSent = await client.GetFromJsonAsync<List<EduTrack.API.Models.DTOs.NotificationDto>>("/api/management/notifications/sent?senderId=501");
        var sent = await client.PostAsJsonAsync("/api/management/notifications", new { senderId = 501, title = "Selected sender", content = "Synthetic send without login", type = "announcement", targetScope = "user", userId = 503 });
        Check(sent.StatusCode == HttpStatusCode.Created, "Anonymous manual send uses selected sender");
        var sentJson = await sent.Content.ReadFromJsonAsync<JsonElement>(); Check(sentJson.GetProperty("senderId").GetInt32() == 501, "Selected sender is persisted");
        var ownSent = await client.GetFromJsonAsync<List<EduTrack.API.Models.DTOs.NotificationDto>>("/api/management/notifications/sent?senderId=501");
        Check(ownSent!.Count == priorSent!.Count + 1 && ownSent.All(n => n.SenderId == 501), "Sent filters selected sender without login");
        var selectedUsers = await client.GetFromJsonAsync<List<JsonElement>>("/api/user-selection?role=center_manager");
        Check(selectedUsers!.Count == 2 && selectedUsers[0].GetProperty("userId").GetInt32() == 501, "User selection discovers actual non-seed IDs from database");
        foreach (var (scope, role, targetUser, targetClass, expectedCount) in new[] {
            ("user", (string?)null, (int?)507, (int?)null, 3),
            ("role", "student", (int?)null, (int?)null, 6),
            ("class", (string?)null, (int?)null, (int?)701, 7),
            ("all", (string?)null, (int?)null, (int?)null, 36) })
        {
            var delivery = await client.PostAsJsonAsync("/api/management/notifications", new {
                senderId = 501, title = "HTTP NTF " + scope, content = "Real HTTP and independent MySQL audience",
                type = "academic", targetScope = scope, targetRole = role, userId = targetUser, classId = targetClass });
            Check(delivery.StatusCode == HttpStatusCode.Created, "HTTP send scope " + scope);
            var notification = await delivery.Content.ReadFromJsonAsync<EduTrack.API.Models.DTOs.NotificationDto>();
            Check(notification!.RecipientCount == expectedCount, "HTTP exact expanded recipient count " + scope);
            var childInbox = await client.GetFromJsonAsync<NotificationInboxSnapshot>("/api/notifications/inbox/snapshot?userId=507");
            var parentInbox = await client.GetFromJsonAsync<NotificationInboxSnapshot>("/api/notifications/inbox/snapshot?userId=601");
            Check(childInbox!.Inbox.Any(n => n.NotificationId == notification.NotificationId)
                && parentInbox!.Inbox.Any(n => n.NotificationId == notification.NotificationId), "HTTP Student/Parent share NotificationId " + scope);
        }
        var results = await client.GetFromJsonAsync<List<NotificationRecipientOption>>("/api/management/notifications/recipients?senderId=501&query=Search%20Recipient&limit=100");
        Check(results!.Count == 20, "HTTP recipient search caps excessive limit");
        var invalidSend = await client.PostAsJsonAsync("/api/management/notifications", new {
            senderId = 501, title = new string('x', 201), content = "Model validation", type = "system", targetScope = "all" });
        Check(invalidSend.StatusCode == HttpStatusCode.BadRequest, "HTTP model validation preserves title limit");
        foreach (var endpoint in new[] { "users", "classes", "subjects", "grades", "tuitioninvoices", "teacherclasses", "taclasses", "studentclasses", "centersettings" })
            Check((await client.GetAsync("/api/" + endpoint)).IsSuccessStatusCode, "Anonymous existing module GET " + endpoint);
        if (!string.IsNullOrEmpty(frontend))
        {
            await using (var db = Db())
            {
                var fixtureNow = clock.GetUtcNow().UtcDateTime;
                await db.NotificationRecipients.Where(r => r.NotificationId <= 20).ExecuteUpdateAsync(s => s.SetProperty(r => r.IsRead, false).SetProperty(r => r.ReadAt, (DateTime?)null).SetProperty(r => r.DeletedAt, (DateTime?)null));
                await db.NotificationRecipients.Where(r => r.NotificationId >= 21 && r.NotificationId <= 26).ExecuteUpdateAsync(s => s.SetProperty(r => r.ReadAt, fixtureNow).SetProperty(r => r.DeletedAt, (DateTime?)null));
            }
            var info = new ProcessStartInfo("node") { WorkingDirectory = frontend, UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true };
            info.ArgumentList.Add("tests/notifications.http.browser.mjs"); info.Environment["EDUTRACK_NOTIFICATION_TEST_ORIGIN"] = origin;
            using var process = Process.Start(info)!; var stdout = process.StandardOutput.ReadToEndAsync(); var stderr = process.StandardError.ReadToEndAsync(); await process.WaitForExitAsync(); Console.WriteLine(await stdout); Console.Error.WriteLine(await stderr); Check(process.ExitCode == 0, "Browser acceptance on independent HTTP/MySQL");
        }
    }
    Console.WriteLine($"{checks} notification assertions passed. Independent schema: {cs.Database}");
}
catch (Exception error) { Console.Error.WriteLine(error); Environment.ExitCode = 1; }
finally { if (app != null) { await app.StopAsync(); await app.DisposeAsync(); } await using var db = Db(); await db.Database.EnsureDeletedAsync(); }

sealed class FixtureClock : TimeProvider
{
    private DateTimeOffset now = new(2026, 11, 9, 3, 2, 0, TimeSpan.Zero);
    public override DateTimeOffset GetUtcNow() => now;
    public void Advance(TimeSpan duration) => now += duration;
}
sealed class OnlyNotifications : IApplicationFeatureProvider<ControllerFeature>
{
    public void PopulateFeature(IEnumerable<ApplicationPart> parts, ControllerFeature feature)
    {
        var allowed = new[] { typeof(NotificationInboxController),typeof(UserSelectionController), typeof(NotificationsController), typeof(ManagementNotificationsController), typeof(TeachingNotificationsController),
            typeof(UsersController), typeof(ClassesController), typeof(SubjectsController), typeof(GradesController), typeof(TuitionInvoicesController),
            typeof(TeacherClassesController), typeof(TaClassesController), typeof(StudentClassesController), typeof(CenterSettingsController) };
        foreach (var controller in feature.Controllers.Where(c => !allowed.Contains(c.AsType())).ToList()) feature.Controllers.Remove(controller);
    }
}
