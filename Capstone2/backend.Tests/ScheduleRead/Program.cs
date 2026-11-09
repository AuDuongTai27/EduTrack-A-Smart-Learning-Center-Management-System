using System.Data.Common;
using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using EduTrack.API.Controllers.Schedule;
using EduTrack.API.Models.DTOs.Schedule;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Services.Schedule;
using EduTrack.API.Services.Teaching.Implementation;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.FileProviders;
using MySqlConnector;

var checks = 0;
void Check(bool condition, string label) { if (!condition) throw new Exception("FAIL: " + label); checks++; Console.WriteLine("PASS " + label); }
ClaimsPrincipal Principal(int id, bool authenticated = true) => new(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, id.ToString())], authenticated ? "IsolatedScheduleTest" : null));
foreach (var principal in new[] { new ClaimsPrincipal(), Principal(501, false), new ClaimsPrincipal(new ClaimsIdentity([new Claim("name", "teacher")], "test")),
    new ClaimsPrincipal(new ClaimsIdentity([new Claim("sub", "501"), new Claim(ClaimTypes.NameIdentifier, "502")], "test")) })
{
    try { ScheduleReadService.RequireSubject(principal); throw new Exception("Expected denied identity"); }
    catch (ScheduleAccessException ex) { Check(ex.StatusCode == 401, "Anonymous/untrusted/ambiguous identity rejected without database"); }
}
Check(ScheduleReadService.RequireSubject(Principal(501)) == 501, "Subject comes only from authenticated identity");
foreach (var query in new[] { new ScheduleQuery(), new ScheduleQuery { From = "2026-02-30", ToExclusive = "2026-03-02" },
    new ScheduleQuery { From = "2026-12-28", ToExclusive = "2026-12-28" }, new ScheduleQuery { From = "2026-01-01", ToExclusive = "2027-01-01" },
    new ScheduleQuery { From = "2026-12-28", ToExclusive = "2027-01-04", TeacherId = -1 } })
{
    try { ScheduleReadService.ValidateRange(query); throw new Exception("Expected invalid range"); }
    catch (ArgumentException) { Check(true, "Invalid range/filter rejected"); }
}
if (!args.Contains("--mysql")) { Console.WriteLine($"{checks} offline schedule assertions; no database accessed."); return; }

// A fresh server started by Run-IsolatedMySql.ps1 is mandatory before any database write.
var cs = new MySqlConnectionStringBuilder { Server = "127.0.0.1", Port = 33308, UserID = "root", Password = "", Pooling = false, SslMode = MySqlSslMode.Disabled };
await using (var probe = new MySqlConnection(cs.ConnectionString))
{
    await probe.OpenAsync(); await using var command = new MySqlCommand("SELECT @@port, @@datadir", probe);
    await using var reader = await command.ExecuteReaderAsync(); await reader.ReadAsync();
    if (reader.GetInt32(0) != 33308 || !reader.GetString(1).Replace('\\', '/').Contains("/edutrack-enrollment-mysql-"))
        throw new Exception("Isolated MySQL identity required; refusing writes");
}
cs.Database = "edutrack_schedule_test_" + Guid.NewGuid().ToString("N");
var options = new DbContextOptionsBuilder<EduTrackDbContext>().UseMySql(cs.ConnectionString, new MySqlServerVersion(new Version(8, 0, 0))).Options;
var guard = new SelectOnlyGuard();
var readOptions = new DbContextOptionsBuilder<EduTrackDbContext>().UseMySql(cs.ConnectionString, new MySqlServerVersion(new Version(8, 0, 0))).AddInterceptors(guard).Options;
var week = new ScheduleQuery {From = "2026-12-28", ToExclusive = "2027-01-04"};
async Task<List<ScheduleSessionDto>> Read(int userId, ScheduleQuery? query = null)
{
    await using var db = new EduTrackDbContext(readOptions);
    return await new ScheduleReadService(db).GetSessions(Principal(userId), query ?? week);
}
async Task<string> Snapshot()
{
    await using var connection = new MySqlConnection(cs.ConnectionString); await connection.OpenAsync();
    var tables = new List<string>();
    await using (var command = new MySqlCommand("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() ORDER BY TABLE_NAME", connection))
    await using (var reader = await command.ExecuteReaderAsync()) while (await reader.ReadAsync()) tables.Add(reader.GetString(0));
    var text = new StringBuilder();
    foreach (var table in tables)
    {
        text.Append(table);
        await using var command = new MySqlCommand("SELECT * FROM `" + table.Replace("`", "``") + "` ORDER BY 1", connection);
        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync()) {var values = new object[reader.FieldCount]; reader.GetValues(values); text.Append(JsonSerializer.Serialize(values));}
    }
    return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(text.ToString())));
}
WebApplication? app = null;
try
{
    await using (var db = new EduTrackDbContext(options))
    {
        // Applies the new migrations only to this verified random synthetic test schema. No DbSeeder.
        await db.Database.MigrateAsync();
        db.Roles.AddRange(new Role {RoleId = 101, RoleName = "teacher"}, new Role {RoleId = 102, RoleName = "teaching_assistant"},
            new Role {RoleId = 103, RoleName = "student"}, new Role {RoleId = 104, RoleName = "center_manager"},
            new Role {RoleId = 105, RoleName = "admin_staff"}, new Role {RoleId = 106, RoleName = "parent"});
        foreach (var (id, roleId) in new[] {(501,101),(502,101),(503,102),(504,103),(505,104),(506,105),(507,101),(508,106),(509,101),(510,101),(512,103),(513,103),(514,103),(515,103)})
            db.Users.Add(new User {UserId = id, UserCode = "SQA_" + id, FullName = "Synthetic " + id, PasswordHash = "test-only", Status = id == 507 ? "inactive" : "active",
                UserRoles = new List<UserRole> {new() {RoleId = roleId}}});
        db.Users.Add(new User {UserId = 511, UserCode = "SQA_511", FullName = "Synthetic unknown", PasswordHash = "test-only", Status = "active"});
        db.Subjects.AddRange(new Subject {SubjectId = 701, SubjectName = "Synthetic Math", SubjectCode = "SQA_MATH"},
            new Subject {SubjectId = 702, SubjectName = "Synthetic English", SubjectCode = "SQA_ENG"});
        foreach (var id in new[] {801,802,803,804,805,806,807})
            db.Classes.Add(new Class {ClassId = id, ClassName = "SCHEDULE-QA Class " + id, SubjectId = id == 802 ? 702 : 701,
                StartDate = new(2026,1,1), EndDate = id == 805 ? new DateTime(2026,12,29) : null, Status = id == 805 ? "completed" : "active"});
        await db.SaveChangesAsync();
        db.TeacherClasses.AddRange(new TeacherClass {ClassId = 801, TeacherId = 501}, new TeacherClass {ClassId = 802, TeacherId = 502},
            new TeacherClass {ClassId = 801, TeacherId = 510}, new TeacherClass {ClassId = 803, TeacherId = 501, Status = "inactive"},
            new TeacherClass {ClassId = 807, TeacherId = 501});
        db.TaClasses.AddRange(new TaClass {ClassId = 802, TaId = 503}, new TaClass {ClassId = 807, TaId = 503});
        db.StudentClasses.AddRange(new StudentClass {ClassId = 801, StudentId = 504, EnrolledDate = new(2026,12,28,10,30,0), Status = "active"},
            new StudentClass {ClassId = 802, StudentId = 504, EnrolledDate = new(2026,1,1), DroppedAt = new(2026,12,29,11,0,0), Status = "dropped"},
            new StudentClass {ClassId = 804, StudentId = 504, Status = "active"},
            new StudentClass {ClassId = 805, StudentId = 504, EnrolledDate = new(2026,1,1), Status = "completed"},
            new StudentClass {ClassId = 801, StudentId = 512, EnrolledDate = new(2026,1,1), Status = "dropped"},
            new StudentClass {ClassId = 801, StudentId = 513, EnrolledDate = new(2026,1,1), Status = "unknown"},
            new StudentClass {ClassId = 801, StudentId = 514, EnrolledDate = new(2026,1,1), Status = "completed"},
            new StudentClass {ClassId = 801, StudentId = 515, EnrolledDate = new(2027,1,1), Status = "active"},
            new StudentClass {ClassId = 807, StudentId = 504, EnrolledDate = new(2026,1,1), Status = "active"});
        // Each synthetic test slot explicitly owns its own weekly ca, including deliberate
        // overlap fixtures. This is fixture declaration, never inference from historical DB data.
        ClassSession Session(int id, int classId, DateTime date, int start, int end, string? room = null, string status = "scheduled")
        {
            var scheduleId = 200000 + id; var versionId = 300000 + id;
            db.ClassSchedules.Add(new ClassSchedule {ScheduleId = scheduleId, ClassId = classId, DayOfWeek = date.DayOfWeek.ToString(), StartTime = TimeSpan.FromHours(start), EndTime = TimeSpan.FromHours(end), Room = room,
                Versions = [new() {ScheduleVersionId = versionId, EffectiveFrom = ScheduleTimeline.Monday(DateOnly.FromDateTime(date)), DayOfWeek = date.DayOfWeek.ToString(), StartTime = TimeSpan.FromHours(start), EndTime = TimeSpan.FromHours(end), Room = room}]});
            return new() {SessionId = id, ClassId = classId, ScheduleId = scheduleId, ScheduleVersionId = versionId, PlannedOccurrenceDate = DateOnly.FromDateTime(date), SessionDate = date, StartTime = TimeSpan.FromHours(start), EndTime = TimeSpan.FromHours(end), Room = room, Status = status};
        }
        db.ClassSessions.AddRange(Session(9001,801,new(2026,12,28),18,20), Session(9002,801,new(2026,12,28),19,21,"QA A"),
            Session(9003,801,new(2027,1,4),18,20), Session(9004,801,new(2026,12,21),18,20), Session(9005,802,new(2026,12,28),18,20,"QA B"),
            Session(9006,802,new(2026,12,29),18,20,"QA B"), Session(9007,801,new(2026,12,28),17,18),
            Session(9008,804,new(2026,12,29),8,10), Session(9009,805,new(2026,12,29),8,10,status:"completed"),
            Session(9010,806,new(2026,12,22),8,10));
        for (var i = 0; i < 12; i++) db.ClassSessions.Add(Session(9020+i,801,new(2026,12,30),7+i,8+i,"QA A", i == 11 ? "cancelled" : "scheduled"));
        // A separate week exercises jump-to-page without overcrowding review screenshots.
        for (var i = 0; i < 60; i++) db.ClassSessions.Add(Session(9100+i,807,new DateTime(2027,1,5).AddDays(i/10),7+i%10,8+i%10,"QA Jump"));
        await db.SaveChangesAsync();
        db.Attendances.Add(new Attendance {SessionId = 9009, StudentId = 504, RecordedBy = 501, Status = "present"}); await db.SaveChangesAsync();
    }
    var before = await Snapshot();
    var manager = await Read(505); var staff = await Read(506); var teacher = await Read(501); var ta = await Read(503); var student = await Read(504);
    Check(manager.Count == 19 && staff.Count == manager.Count, "CM/AD see all actual sessions in range; week crosses year");
    Check(teacher.Count == 15 && teacher.All(s => s.ClassId == 801), "Teacher sees only active assigned Class sessions");
    Check(ta.Count == 2 && ta.All(s => s.ClassId == 802), "TA sees only assigned Class sessions");
    Check(student.Any(s => s.SessionId == 9001) && !student.Any(s => s.SessionId == 9007), "Enrollment start checked at Vietnam session start, not only calendar day");
    Check(student.Any(s => s.SessionId == 9005) && !student.Any(s => s.SessionId == 9006), "Historical dropped enrollment visible only before exact drop time");
    Check(!student.Any(s => s.SessionId == 9008) && student.Any(s => s.SessionId == 9009), "Missing enrollment date excluded; completed history requires Class end evidence");
    Check(manager.All(s => s.SessionId != 9003 && s.SessionId != 9004), "Same weekday in previous/next week never repeats");
    Check(manager.Single(s => s.SessionId == 9001).Room == null && manager.Single(s => s.SessionId == 9001).Teachers.Count == 2, "No invented room; all active Class Teachers returned");
    Check(manager.Single(s => s.SessionId == 9009).HasAttendance, "Attendance is read without invoking Attendance service");
    Check((await Read(509)).Count == 0 && (await Read(505, new() {From=week.From,ToExclusive=week.ToExclusive,ClassId=803})).Count == 0, "Unassigned teacher and empty Class remain empty");
    foreach(var id in new[]{512,513,514,515}) Check((await Read(id)).Count==0,"Dropped/unknown/completed/future enrollment without valid time evidence is excluded");
    await using(var db = new EduTrackDbContext(readOptions))
    {
        var principal=Principal(501); ((ClaimsIdentity)principal.Identity!).AddClaim(new Claim(ClaimTypes.Role,"center_manager"));
        Check((await new ScheduleReadService(db).GetSessions(principal,week)).All(s=>s.ClassId==801),"Role claim cannot widen privileges beyond active DB role");
    }
    foreach (var (key, value, expected) in new[] {("ClassId","801",15),("SubjectId","702",2),("TeacherId","502",2),("TaId","503",2),("Room","QA B",2),("Status","cancelled",1)})
    {
        var query = new ScheduleQuery {From=week.From,ToExclusive=week.ToExclusive};
        typeof(ScheduleQuery).GetProperty(key)!.SetValue(query, key.EndsWith("Id") ? int.Parse(value) : value);
        Check((await Read(505,query)).Count == expected, "Server filter " + key + " uses actual data");
    }
    Check((await Read(501,new(){From=week.From,ToExclusive=week.ToExclusive,TeacherId=502})).Count == 0, "Filter cannot widen Teacher scope");
    foreach (var id in new[] {507,508,511})
    {
        try { await Read(id); throw new Exception("Expected forbidden account"); }
        catch (ScheduleAccessException ex) {Check(ex.StatusCode == 403,"Inactive/Parent/unknown-role account rejected");}
    }
    await using (var db = new EduTrackDbContext(readOptions))
    {
        Check(await new ScheduleReadService(db).GetSession(Principal(501),9005) == null, "Out-of-scope session detail is concealed");
        Check(await new ScheduleReadService(db).GetSession(Principal(505),9009) != null, "Scoped session detail available");
    }
    Check(before == await Snapshot(), "All database tables unchanged after read service calls");
    Check(guard.SelectCount > 0 && guard.WriteAttempts == 0,"SELECT-only interceptor saw no write attempts");
    // Reproduce teammate dependencies without allowing their known GET writers to write.
    foreach(var dependency in new[] {"sessions", "enrollment"})
    {
        var legacyGuard=new SelectOnlyGuard();
        var legacyOptions=new DbContextOptionsBuilder<EduTrackDbContext>().UseMySql(cs.ConnectionString,new MySqlServerVersion(new Version(8,0,0))).AddInterceptors(legacyGuard).Options;
        await using var db=new EduTrackDbContext(legacyOptions);
        try
        {
            var attendance=new TeachingAttendanceService(db);
            if(dependency=="sessions") await attendance.GetClassSessionsAsync(803);
            else await attendance.GetAttendanceSheetAsync(806,9010,501);
            throw new Exception("Expected existing unsafe GET dependency");
        }
        catch(Exception) when(legacyGuard.WriteAttempts>0)
        {Check(true,"UNRESOLVED dependency reproduced, blocked before SQL write: Attendance GET " + dependency);}
    }
    Check(before == await Snapshot(),"Dependency reproduction did not change any database table");

    // Production startup/Auth/seeder is NEVER invoked. The test host exposes only ScheduleController.
    var contentRoot = Path.Combine(Path.GetTempPath(),"edutrack-schedule-host-" + Guid.NewGuid().ToString("N")); Directory.CreateDirectory(contentRoot);
    var builder = WebApplication.CreateBuilder(new WebApplicationOptions {ContentRootPath=contentRoot, EnvironmentName="ScheduleIsolatedTest", Args=[]});
    builder.Logging.ClearProviders(); builder.WebHost.UseUrls("http://127.0.0.1:0");
    builder.Services.AddDbContext<EduTrackDbContext>(o => o.UseMySql(cs.ConnectionString,new MySqlServerVersion(new Version(8,0,0))).AddInterceptors(guard));
    builder.Services.AddControllers().AddApplicationPart(typeof(ScheduleController).Assembly).ConfigureApplicationPartManager(m => m.FeatureProviders.Add(new OnlyScheduleController()));
    app = builder.Build();
    var nonce = Guid.NewGuid().ToString("N");
    var actors = new Dictionary<string,int> { ["teacher"] = 501, ["teaching-assistant"] = 503, ["student"] = 504, ["center-manager"] = 505, ["admin-staff"] = 506, ["parent"] = 508 };
    app.Use(async (http,next) => {
        var token = http.Request.Headers["X-Schedule-Test-Identity"].FirstOrDefault() ?? http.Request.Cookies["schedule_test_actor"];
        if(token != null && token.StartsWith(nonce+":",StringComparison.Ordinal) && actors.TryGetValue(token[(nonce.Length+1)..],out var id)) http.User=Principal(id);
        await next();
    });
    app.MapControllers();
    var frontendRoot = Environment.GetEnvironmentVariable("EDUTRACK_TEST_FRONTEND_ROOT");
    if (!string.IsNullOrEmpty(frontendRoot))
    {
        var dist = Path.GetFullPath(Path.Combine(frontendRoot,"dist"));
        app.UseStaticFiles(new StaticFileOptions{FileProvider=new PhysicalFileProvider(dist)});
        app.MapFallback(async http => {
            if(http.Request.Path.StartsWithSegments("/api")) {http.Response.StatusCode=404; return;}
            http.Response.ContentType="text/html"; await http.Response.SendFileAsync(Path.Combine(dist,"index.html"));
        }).WithMetadata(new Microsoft.AspNetCore.Routing.HttpMethodMetadata(["GET"]));
    }
    await app.StartAsync(); var origin=app.Urls.Single(); using var client=new HttpClient{BaseAddress=new Uri(origin)};
    const string url="/api/schedule/sessions?from=2026-12-28&toExclusive=2027-01-04";
    foreach(var extra in new[]{"","&userId=505","&studentId=504","&teacherId=501"})
        Check((await client.GetAsync(url+extra)).StatusCode==HttpStatusCode.Unauthorized,"HTTP unauthenticated identity parameters do not authenticate");
    foreach(var actor in actors.Keys)
    {
        using var request=new HttpRequestMessage(HttpMethod.Get,url); request.Headers.Add("X-Schedule-Test-Identity",nonce+":"+actor);
        var response=await client.SendAsync(request);
        if(actor=="parent") {Check(response.StatusCode==HttpStatusCode.Forbidden,"HTTP Parent rejected");continue;}
        var rows=await response.Content.ReadFromJsonAsync<List<ScheduleSessionDto>>();
        Check(response.IsSuccessStatusCode && rows!.Count==(await Read(actors[actor])).Count,"HTTP controlled principal scope: "+actor);
        Check(response.Headers.CacheControl?.NoStore==true,"HTTP response cannot be cached across identities");
    }
    using(var request=new HttpRequestMessage(HttpMethod.Get,"/api/schedule/sessions/9005"))
    { request.Headers.Add("X-Schedule-Test-Identity",nonce+":teacher"); Check((await client.SendAsync(request)).StatusCode==HttpStatusCode.NotFound,"HTTP detail prevents IDOR"); }
    using(var request=new HttpRequestMessage(HttpMethod.Get,"/api/schedule/sessions?from=bad&toExclusive=2027-01-04"))
    { request.Headers.Add("X-Schedule-Test-Identity",nonce+":teacher"); Check((await client.SendAsync(request)).StatusCode==HttpStatusCode.BadRequest,"HTTP rejects invalid dates"); }
    Check((await client.PostAsJsonAsync(url,new{userId=505})).StatusCode==HttpStatusCode.MethodNotAllowed,"Schedule endpoint exposes no write action");
    if(!string.IsNullOrEmpty(frontendRoot))
    {
        var process = new ProcessStartInfo("node") {WorkingDirectory=frontendRoot,UseShellExecute=false,CreateNoWindow=true,RedirectStandardOutput=true,RedirectStandardError=true};
        process.ArgumentList.Add(Environment.GetEnvironmentVariable("EDUTRACK_SCHEDULE_BROWSER_SCRIPT") ?? "tests/schedule.http.browser.mjs");
        process.Environment["EDUTRACK_SCHEDULE_TEST_ORIGIN"]=origin; process.Environment["EDUTRACK_SCHEDULE_TEST_NONCE"]=nonce;
        using var browser=Process.Start(process)!;
        var browserOutput=browser.StandardOutput.ReadToEndAsync(); var browserError=browser.StandardError.ReadToEndAsync();
        await browser.WaitForExitAsync(); Console.WriteLine(await browserOutput); Console.WriteLine(await browserError);
        Check(browser.ExitCode==0,"Browser uses real isolated Schedule HTTP and synthetic MySQL");
    }
    Check(before == await Snapshot(),"All database tables unchanged after HTTP/browser GETs");
    Console.WriteLine($"{checks} schedule assertions; {guard.SelectCount} SELECT commands, {guard.WriteAttempts} write attempts. Synthetic DB: {cs.Database}");
}
finally
{
    if(app!=null) await app.DisposeAsync();
    // Only the random schema on our verified isolated server may be removed.
    if(!cs.Database.StartsWith("edutrack_schedule_test_",StringComparison.Ordinal)) throw new Exception("Refusing cleanup");
    await using var db=new EduTrackDbContext(options); await db.Database.EnsureDeletedAsync();
}

sealed class OnlyScheduleController : IApplicationFeatureProvider<ControllerFeature>
{
    public void PopulateFeature(IEnumerable<ApplicationPart> parts,ControllerFeature feature)
    {for(var i=feature.Controllers.Count-1;i>=0;i--)if(feature.Controllers[i].AsType()!=typeof(ScheduleController))feature.Controllers.RemoveAt(i);}
}
sealed class SelectOnlyGuard : DbCommandInterceptor
{
    public int SelectCount, WriteAttempts;
    private void Check(DbCommand command)
    {
        if(!command.CommandText.TrimStart().StartsWith("SELECT",StringComparison.OrdinalIgnoreCase)) {Interlocked.Increment(ref WriteAttempts);throw new Exception("Read path attempted non-SELECT SQL");}
        Interlocked.Increment(ref SelectCount);
    }
    public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(DbCommand c,CommandEventData e,InterceptionResult<DbDataReader> r,CancellationToken ct=default) {Check(c);return ValueTask.FromResult(r);}
    public override ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(DbCommand c,CommandEventData e,InterceptionResult<int> r,CancellationToken ct=default) {Check(c);return ValueTask.FromResult(r);}
    public override ValueTask<InterceptionResult<object>> ScalarExecutingAsync(DbCommand c,CommandEventData e,InterceptionResult<object> r,CancellationToken ct=default) {Check(c);return ValueTask.FromResult(r);}
}
