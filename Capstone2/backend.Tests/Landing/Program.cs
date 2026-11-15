using System.Data;
using System.Text.Json.Nodes;
using EduTrack.API.Controllers.Queries;
using EduTrack.API.Models.DTOs.Landing;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Services.Implementation;
using EduTrack.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

// This executable never invokes the production startup, seeder, or SaveChanges.
if (args.Length > 0 && args[0] is "--inspect-development" or "--serve-readonly")
{
    if (args.Length != 2) throw new ArgumentException("Pass the repository root.");
    var repo = Path.GetFullPath(args[1]);
    var config = new ConfigurationBuilder().SetBasePath(Path.Combine(repo, "Capstone2/backend"))
        .AddJsonFile("appsettings.json").AddJsonFile("appsettings.Development.json", true).AddEnvironmentVariables().Build();
    var connection = new MySqlConnectionStringBuilder(config.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Development connection is not configured."))
    { Pooling = false, ConnectionTimeout = 5, DefaultCommandTimeout = 15, AllowUserVariables = true, UseAffectedRows = false };
    if (connection.Server is not ("localhost" or "127.0.0.1") || connection.Port != 3306 || connection.Database != "edutrack_db")
        throw new InvalidOperationException("Refusing an unexpected development endpoint.");

    async Task<T> Read<T>(Func<LandingPortalService, EduTrackRuntimeDbContext, Task<T>> action)
    {
        await using var db = new MySqlConnection(connection.ConnectionString);
        await db.OpenAsync();
        await using (var protect = new MySqlCommand("SET SESSION TRANSACTION READ ONLY", db))
            await protect.ExecuteNonQueryAsync();
        await using var tx = await db.BeginTransactionAsync(IsolationLevel.RepeatableRead, true);
        await using (var check = new MySqlCommand("SELECT @@transaction_read_only", db, tx))
            if (Convert.ToInt32(await check.ExecuteScalarAsync()) != 1) throw new InvalidOperationException("Read-only protection is not active.");
        var options = new DbContextOptionsBuilder<EduTrackRuntimeDbContext>().UseMySql(db, new MySqlServerVersion(new Version(8, 0, 44))).Options;
        await using var context = new EduTrackRuntimeDbContext(options);
        await context.Database.UseTransactionAsync(tx);
        try { return await action(new LandingPortalService(context), context); }
        finally { await tx.RollbackAsync(); }
    }

    if (args[0] == "--inspect-development")
    {
        try
        {
            var result = await Read(async (service, context) => {
                var overview = await service.GetLandingOverviewAsync();
                var teachers = await context.Users.AsNoTracking().Where(u => u.UserRoles.Any(r => r.Role.RoleName == "teacher" || r.Role.RoleName == "teaching_assistant"))
                    .Select(u => new { u.AvatarUrl }).ToListAsync();
                var pages = new List<object>();
                foreach (var subject in overview.Subjects)
                {
                    var page = await service.GetClassesAsync(subject.SubjectId, 1, 3);
                    if (page.Items.Any(c => c.SubjectId != subject.SubjectId)) throw new Exception("Subject filter mismatch.");
                    pages.Add(new { subject.SubjectId, subject.SubjectCode, page.TotalCount, page.HasMore, scheduleCards = page.Items.Count(c => c.UpcomingSessions.Count > 0) });
                }
                return new { readOnly = true, productionStartupInvoked = false, subjectCount = overview.Subjects.Count,
                    teacherCount = teachers.Count, diceBearAvatars = teachers.Count(t => t.AvatarUrl?.Contains("dicebear", StringComparison.OrdinalIgnoreCase) == true),
                    missingAvatars = teachers.Count(t => string.IsNullOrWhiteSpace(t.AvatarUrl)), otherAvatars = teachers.Count(t => !string.IsNullOrWhiteSpace(t.AvatarUrl) && !t.AvatarUrl.Contains("dicebear", StringComparison.OrdinalIgnoreCase)),
                    publicTeacherContactEmpty = overview.Trainers.All(t => t.Email == "" && t.Phone == ""), pages };
            });
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(result, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
        }
        catch (MySqlException ex) { Console.Error.WriteLine($"Read-only development inspection unavailable (MySQL code {ex.Number}); no database write attempted."); Environment.ExitCode = 1; }
        return;
    }
    var builder = WebApplication.CreateBuilder();
    builder.Logging.ClearProviders();
    var app = builder.Build();
    app.MapGet("/api/landing/overview", () => Read(async (s, _) => new { success = true, data = await s.GetLandingOverviewAsync() }));
    app.MapGet("/api/landing/classes", async (int? subjectId, int? page, int? pageSize) => {
        if ((subjectId.HasValue && subjectId <= 0) || (page ?? 1) < 1 || (page ?? 1) > 10000 || (pageSize ?? 3) < 1 || (pageSize ?? 3) > 12)
            return Results.BadRequest(new { success = false, message = "Invalid public class pagination." });
        var data = await Read((s, _) => s.GetClassesAsync(subjectId, page ?? 1, pageSize ?? 3));
        return Results.Ok(new { success = true, data });
    });
    Console.WriteLine("Read-only landing QA host: http://127.0.0.1:5048 (each GET uses a verified READ ONLY transaction and rollback; production startup is not invoked).");
    await app.RunAsync("http://127.0.0.1:5048");
    return;
}

var passed = 0;
void Check(bool condition, string name) { if (!condition) throw new Exception(name); passed++; Console.WriteLine("PASS " + name); }
var now = new DateTime(2026, 11, 15, 17, 0, 0);
var old = new ClassScheduleVersion { ScheduleVersionId = 1, EffectiveFrom = new(2026, 11, 1), EffectiveTo = new(2026, 11, 18) };
var next = new ClassScheduleVersion { ScheduleVersionId = 2, EffectiveFrom = new(2026, 11, 18) };
ClassSession Slot(int day, int hour = 18, ClassScheduleVersion? version = null) => new() {
    SessionId = day, SessionDate = new(2026, 11, day), StartTime = TimeSpan.FromHours(hour), EndTime = TimeSpan.FromHours(hour + 1.5),
    Status = "scheduled", ScheduleVersionId = version?.ScheduleVersionId, ScheduleVersion = version,
    PlannedOccurrenceDate = version == null ? null : new DateOnly(2026, 11, day)
};
List<LandingSessionDto> Show(params ClassSession[] rows) => LandingSchedulePresentation.Upcoming(rows, new(2026, 11, 1), new(2026, 12, 31), now);
Check(Show().Count == 0, "missing schedule stays empty for contact fallback");
Check(Show(Slot(14), Slot(15, 16), Slot(16)).Single().Date == "2026-11-16", "past dates and elapsed times excluded in Vietnam time");
var cancelled = Slot(16); cancelled.Status = "cancelled";
Check(Show(cancelled).Count == 0, "cancelled sessions excluded");
Check(Show(Slot(20, 18, old)).Count == 0, "expired version cannot advertise a later planned occurrence");
var changing = Show(Slot(17, 18, old), Slot(19, 19, next));
Check(changing.Count == 2 && changing[0].StartTime == "18:00" && changing[1].StartTime == "19:00", "version changes stay separate dated sessions");
Check(Show(Slot(18, 18, old), Slot(18, 19, next)).Single().StartTime == "19:00", "effectiveTo is exclusive");
Check(LandingSchedulePresentation.Upcoming([Slot(20)], new(2026, 11, 21), null, now).Count == 0, "class start bounds respected");
Check(LandingSchedulePresentation.Upcoming([Slot(20)], new(2026, 11, 1), new(2026, 11, 19), now).Count == 0, "class end bounds respected");
var missingVersion = Slot(17); missingVersion.ScheduleVersionId = 999;
Check(Show(missingVersion).Count == 0, "missing referenced version fails closed");
var invalid = Slot(17); invalid.EndTime = invalid.StartTime;
Check(Show(invalid).Count == 0, "invalid time window excluded");
Check(Show(Slot(16), Slot(16), Slot(17), Slot(18)).Count == 2, "deduplicate and cap public occurrences");
var stub = new PublicStub();
var controller = new LandingPortalController(stub);
foreach (var (subjectId, page, size) in new (int?, int, int)[] { (-1, 1, 3), (null, 0, 3), (null, 10001, 3), (null, 1, 13), (null, 1, 0) })
    Check(await controller.GetClasses(subjectId, page, size) is BadRequestObjectResult, "invalid pagination/filter rejected");
Check(stub.Calls == 0, "invalid public query never reaches DAL/database");
Check(await controller.GetClasses(12, 2, 3) is OkObjectResult && stub.Calls == 1, "valid subject/page reaches read-only service");
Console.WriteLine($"{passed} landing backend checks passed; no database used.");

sealed class PublicStub : ILandingPortalService
{
    public int Calls { get; private set; }
    public Task<LandingOverviewDto> GetLandingOverviewAsync() => Task.FromResult(new LandingOverviewDto());
    public Task<bool> RecordNewsletterSubscriptionAsync(string email) => throw new NotSupportedException();
    public Task<LandingClassesPageDto> GetClassesAsync(int? subjectId, int page, int pageSize, CancellationToken ct = default) {
        Calls++; return Task.FromResult(new LandingClassesPageDto { Page = page, PageSize = pageSize });
    }
}
