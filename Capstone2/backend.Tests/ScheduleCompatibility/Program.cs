using System.Diagnostics;
using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using EduTrack.API.Controllers.Management;
using EduTrack.API.Controllers.Queries;
using EduTrack.API.Controllers.Schedule;
using EduTrack.API.Helpers.DependencyInjection;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Schedule;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Implementation;
using EduTrack.API.Services.Notifications;
using EduTrack.API.Services.Schedule;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MySqlConnector;

const string expand = "20261109004646_ScheduleVersionExpand", contract = "20261109005859_ScheduleVersionContract";
var checks = 0;
void Check(bool ok, string label) { if (!ok) throw new Exception("FAIL " + label); checks++; Console.WriteLine("PASS " + label); }
string Hash(string value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value))).ToLowerInvariant();
string Quote(string name) => "`" + name.Replace("`", "``") + "`";
DbContextOptions<EduTrackDbContext> MigrationOptions(string cs) => new DbContextOptionsBuilder<EduTrackDbContext>().UseMySql(cs, new MySqlServerVersion(new Version(8, 0, 44))).Options;
DbContextOptions<EduTrackRuntimeDbContext> RuntimeOptions(string cs) => new DbContextOptionsBuilder<EduTrackRuntimeDbContext>().UseMySql(cs, new MySqlServerVersion(new Version(8, 0, 44))).Options;
const string dummy = "Server=127.0.0.1;Port=1;Database=metadata_only;User=none;Connection Timeout=1";
// Offline checks cannot contact a database. Both models must coexist in one process.
await using (var runtime = new EduTrackRuntimeDbContext(RuntimeOptions(dummy)))
await using (var migration = new EduTrackDbContext(MigrationOptions(dummy)))
{
    var r = runtime.Model.FindEntityType(typeof(ClassSession))!; var m = migration.Model.FindEntityType(typeof(ClassSession))!;
    foreach (var name in new[] { "ScheduleId", "ScheduleVersionId", "PlannedOccurrenceDate" })
    {
        Check(r.FindProperty(name)!.IsNullable, "Runtime reads nullable legacy " + name);
        Check(!m.FindProperty(name)!.IsNullable, "Migration Contract still requires " + name);
    }
    Check(!ReferenceEquals(runtime.Model, migration.Model), "Runtime and migration model caches remain separate");
    foreach (var navigation in new[] { "Schedule", "ScheduleVersion" })
        Check(!r.FindNavigation(navigation)!.ForeignKey.IsRequired && m.FindNavigation(navigation)!.ForeignKey.IsRequired, "Only runtime relationship is optional: " + navigation);
    Check(!migration.Database.HasPendingModelChanges(), "Unchanged migration model matches existing snapshot; no new migration needed");
    var runtimeSql = runtime.ClassSessions.Include(x => x.Class).Include(x => x.Schedule).Include(x => x.ScheduleVersion).ToQueryString();
    Check(runtimeSql.Contains("LEFT JOIN `class_schedules`") && runtimeSql.Contains("LEFT JOIN `class_schedule_versions`"), "Runtime includes use LEFT JOIN for schedule/version");
    Check(migration.ClassSessions.Include(x => x.Schedule).ToQueryString().Contains("INNER JOIN `class_schedules`"), "Migration model retains its original required relationship");
}
using (var host = new HostBuilder().ConfigureServices(services =>
    services.AddDbContext<EduTrackDbContext, EduTrackRuntimeDbContext>(o => o.UseMySql(dummy, new MySqlServerVersion(new Version(8, 0, 44))))).Build())
using (var scope = host.Services.CreateScope()) Check(scope.ServiceProvider.GetRequiredService<EduTrackDbContext>() is EduTrackRuntimeDbContext, "Production-style DI resolves the runtime model for all existing consumers");
if (!args.Contains("--mysql")) { Console.WriteLine($"{checks} compatibility metadata assertions; no database/host accessed."); return; }

var evidence = Environment.GetEnvironmentVariable("EDUTRACK_COMPAT_EVIDENCE") ?? Path.Combine(Path.GetTempPath(), "edutrack-compatibility-" + Guid.NewGuid().ToString("N")); Directory.CreateDirectory(evidence);
void Save(string file, object data) => File.WriteAllText(Path.Combine(evidence, file), JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true }));
var cs = new MySqlConnectionStringBuilder { Server = "127.0.0.1", Port = 33308, UserID = "root", Password = "", Pooling = false, SslMode = MySqlSslMode.Disabled };
async Task<object?> Scalar(MySqlConnection c, string sql) { await using var cmd = new MySqlCommand(sql, c); return await cmd.ExecuteScalarAsync(); }
async Task<List<Dictionary<string, string?>>> Rows(MySqlConnection c, string sql)
{
    await using var command = new MySqlCommand(sql, c); await using var reader = await command.ExecuteReaderAsync(); var rows = new List<Dictionary<string, string?>>();
    while (await reader.ReadAsync())
    {
        var row = new Dictionary<string, string?>();
        for (var i = 0; i < reader.FieldCount; i++) row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i) switch
        { DateTime d => d.ToString("yyyy-MM-dd HH:mm:ss.ffffff", CultureInfo.InvariantCulture), byte[] b => Convert.ToBase64String(b), IFormattable f => f.ToString(null, CultureInfo.InvariantCulture), var v => v.ToString() };
        rows.Add(row);
    }
    return rows;
}
async Task<SortedDictionary<string, TableEvidence>> Snapshot(MySqlConnection c, SortedDictionary<string, TableEvidence>? originalColumns = null)
{
    var tables = originalColumns?.Keys.ToList() ?? (await Rows(c, "SELECT table_name AS name FROM information_schema.tables WHERE table_schema=DATABASE() AND table_type='BASE TABLE' ORDER BY table_name")).Select(r => r["name"]!).ToList();
    var result = new SortedDictionary<string, TableEvidence>();
    foreach (var table in tables)
    {
        var columns = originalColumns?[table].Columns ?? (await Rows(c, $"SELECT column_name AS name FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='{table}' ORDER BY ordinal_position")).Select(r => r["name"]!).ToList();
        var keys = (await Rows(c, $"SELECT column_name AS name FROM information_schema.key_column_usage WHERE table_schema=DATABASE() AND table_name='{table}' AND constraint_name='PRIMARY' ORDER BY ordinal_position")).Select(r => r["name"]!).ToList();
        var rows = await Rows(c, $"SELECT {string.Join(',', columns.Select(Quote))} FROM {Quote(table)} ORDER BY {string.Join(',', (keys.Count > 0 ? keys : columns).Select(Quote))}");
        result[table] = new(columns, rows.Count, Hash(JsonSerializer.Serialize(rows)));
    }
    return result;
}
bool SameBusiness(SortedDictionary<string, TableEvidence> before, SortedDictionary<string, TableEvidence> after) => before.Where(t => !t.Key.Equals("__efmigrationshistory", StringComparison.OrdinalIgnoreCase)).All(t => after[t.Key].Count == t.Value.Count && after[t.Key].Hash == t.Value.Hash);
WebApplication? app = null; var databases = new List<string>(); var results = new Dictionary<string, object?>();
try
{
    await using (var probe = new MySqlConnection(cs.ConnectionString))
    {
        await probe.OpenAsync(); var identity = await Rows(probe, "SELECT @@port AS port,@@datadir AS datadir,@@server_uuid AS server_uuid");
        Check(identity[0]["port"] == "33308" && identity[0]["datadir"]!.Replace('\\', '/').Contains("/edutrack-enrollment-mysql-"), "Independent MySQL identity verified BEFORE any write"); Save("server.json", identity);
        cs.Database = "edutrack_compat_test_" + Guid.NewGuid().ToString("N"); databases.Add(cs.Database);
        await using var create = new MySqlCommand($"CREATE DATABASE {Quote(cs.Database)} CHARACTER SET utf8mb4", probe); await create.ExecuteNonQueryAsync();
    }
    var backup = Environment.GetEnvironmentVariable("EDUTRACK_COMPAT_BACKUP") ?? throw new Exception("Explicit reviewed backup path required");
    var expectedHash = Environment.GetEnvironmentVariable("EDUTRACK_COMPAT_BACKUP_SHA256") ?? throw new Exception("Explicit reviewed backup SHA-256 required");
    var bytes = await File.ReadAllBytesAsync(backup); Check(Convert.ToHexString(SHA256.HashData(bytes)).Equals(expectedHash, StringComparison.OrdinalIgnoreCase), "Reviewed real backup checksum matches before restore");
    var sql = Encoding.UTF8.GetString(bytes);
    var routing = Regex.Replace(sql, @"'(?:\\[\s\S]|''|[^'\\])*'", "''");
    routing = Regex.Replace(routing, @"/\*!\d{5,6}\s*([\s\S]*?)\*/", "$1"); routing = Regex.Replace(routing, @"/\*[\s\S]*?\*/|(?m)^\s*--.*$", "");
    Check(!Regex.IsMatch(routing, @"\b(?:CREATE|DROP|ALTER)\s+(?:DATABASE|SCHEMA|USER)\b|\bUSE\s+[\w`]|`?edutrack_db`?\s*\.", RegexOptions.IgnoreCase), "Backup contains no executable database routing or original-qualified tables");
    var import = new ProcessStartInfo(Path.Combine(Environment.GetEnvironmentVariable("EDUTRACK_TEST_MYSQL_BIN")!, "mysql.exe")) { UseShellExecute = false, CreateNoWindow = true, RedirectStandardInput = true, RedirectStandardError = true, RedirectStandardOutput = true };
    foreach (var arg in new[] { "--no-defaults", "--protocol=TCP", "--host=127.0.0.1", "--port=33308", "--user=root", "--default-character-set=utf8mb4", "--binary-mode=1", "--database=" + cs.Database }) import.ArgumentList.Add(arg);
    using (var process = Process.Start(import)!) { var err = process.StandardError.ReadToEndAsync(); var stdout = process.StandardOutput.ReadToEndAsync(); await process.StandardInput.BaseStream.WriteAsync(bytes); process.StandardInput.Close(); await process.WaitForExitAsync(); File.WriteAllText(Path.Combine(evidence, "restore.log"), await stdout + await err); Check(process.ExitCode == 0, "Actual backup restored into explicit isolated database"); }
    await using var connection = new MySqlConnection(cs.ConnectionString); await connection.OpenAsync();
    await using (var timezone = new MySqlCommand("SET SESSION time_zone='+00:00'", connection)) await timezone.ExecuteNonQueryAsync();
    var before = await Snapshot(connection); Save("before.json", before);
    Check(before["class_sessions"].Count == 10 && before["class_schedules"].Count == 4 && before["attendance"].Count == 6, "Restored legacy counts: 10 Sessions / 4 Schedules / 6 Attendance");
    await using (var migration = new EduTrackDbContext(MigrationOptions(cs.ConnectionString)))
    {
        var applied = (await migration.Database.GetAppliedMigrationsAsync()).ToArray(); Check(applied.Length == 7 && applied.Last() == "20261107061101_AddStudentGrade", "Backup has the expected seven pre-Expand migrations");
        await migration.GetService<IMigrator>().MigrateAsync(expand);
        Check((await migration.Database.GetAppliedMigrationsAsync()).SequenceEqual(applied.Append(expand)), "Only Expand applied to real-backup copy");
    }
    var expanded = await Snapshot(connection, before); Check(SameBusiness(before, expanded), "Expand preserves every original business row/column hash");
    Check(Convert.ToInt64(await Scalar(connection, "SELECT COUNT(*) FROM class_schedule_versions")) == 0, "No versions or backfill invented");
    var allBeforeReads = await Snapshot(connection); var raw = await Rows(connection, "SELECT session_id,class_id,schedule_id,session_date,start_time,end_time,room,status FROM class_sessions ORDER BY session_id");
    var rawIds = raw.Select(r => int.Parse(r["session_id"]!)).Order().ToArray();
    await using (var runtime = new EduTrackRuntimeDbContext(RuntimeOptions(cs.ConnectionString)))
    {
        File.WriteAllText(Path.Combine(evidence, "after-runtime-query.sql"), runtime.ClassSessions.Include(s => s.Class).Include(s => s.Schedule).Include(s => s.ScheduleVersion).ToQueryString());
        await using var migration = new EduTrackDbContext(MigrationOptions(cs.ConnectionString)); File.WriteAllText(Path.Combine(evidence, "before-contract-query.sql"), migration.ClassSessions.Include(s => s.Class).Include(s => s.Schedule).ToQueryString());
        var repository = new ClassSessionRepository(runtime); var sessions = (await repository.GetAllAsync()).ToList();
        Check(sessions.Select(s => s.SessionId).Order().SequenceEqual(rawIds), "Repository returns all ten sessions, including missing Schedule");
        Check(sessions.Where(s => s.ScheduleId == null).Select(s => s.SessionId).Order().SequenceEqual(new[] { 6, 7, 8, 9, 10 }), "Legacy IDs 6-10 retain NULL ScheduleId");
        Check(sessions.All(s => s.ScheduleVersionId == null && s.PlannedOccurrenceDate == null && s.OccurrenceWeekStart == null), "Unknown planned/version values remain NULL");
        Check(sessions.Where(s => s.ScheduleId == null).All(s => s.Schedule == null), "Optional navigation stays NULL without fabricated Schedule");
        foreach (var id in rawIds) Check((await repository.GetByIdAsync(id))?.SessionId == id, "Repository detail preserves legacy Session " + id);
    }
    var cm = Convert.ToInt32(await Scalar(connection, "SELECT u.user_id FROM users u JOIN user_roles ur ON u.user_id=ur.user_id JOIN roles r ON r.role_id=ur.role_id WHERE u.status='active' AND r.role_name='center_manager' ORDER BY u.user_id LIMIT 1"));
    var minDate = raw.Min(r => DateTime.Parse(r["session_date"]!, CultureInfo.InvariantCulture)).Date;
    var maxDate = raw.Max(r => DateTime.Parse(r["session_date"]!, CultureInfo.InvariantCulture)).Date;
    var query = new ScheduleQuery { From = minDate.ToString("yyyy-MM-dd"), ToExclusive = maxDate.AddDays(1).ToString("yyyy-MM-dd") };
    int managementClassId; HttpStatusCode managementStatus;
    Check((maxDate - minDate).TotalDays < 93, "Real-backup acceptance range fits Schedule API contract");
    await using (var runtime = new EduTrackRuntimeDbContext(RuntimeOptions(cs.ConnectionString)))
    {
        var read = new ScheduleReadService(runtime); var rows = await read.GetSessions(cm, query);
        Check(rows.Select(s => s.SessionId).Order().SequenceEqual(rawIds), "Schedule read returns all actual sessions with NULL provenance");
        Check(rows.All(s => s.PlannedOccurrenceDate == null && s.ScheduleVersionId == null), "Read DTO preserves unknown provenance as NULL");
        var classId = int.Parse(raw[0]["class_id"]!); query.ClassId = classId;
        Check((await read.GetSessions(cm, query)).Select(s => s.SessionId).Order().SequenceEqual(raw.Where(r => int.Parse(r["class_id"]!) == classId).Select(r => int.Parse(r["session_id"]!)).Order()), "Class filter matches raw actual rows"); query.ClassId = null;
        var oldTo = query.ToExclusive; query.ToExclusive = minDate.AddDays(1).ToString("yyyy-MM-dd");
        Check((await read.GetSessions(cm, query)).Select(s => s.SessionId).Order().SequenceEqual(raw.Where(r => DateTime.Parse(r["session_date"]!, CultureInfo.InvariantCulture).Date == minDate).Select(r => int.Parse(r["session_id"]!)).Order()), "Date boundary filter does not invent recurring rows"); query.ToExclusive = oldTo;
        var status = raw[0]["status"]!; query.Status = status;
        Check((await read.GetSessions(cm, query)).Select(s => s.SessionId).Order().SequenceEqual(raw.Where(r => r["status"] == status).Select(r => int.Parse(r["session_id"]!)).Order()), "Status filter preserves scheduled/completed semantics"); query.Status = null;
        foreach (var role in new[] { "teacher", "teaching_assistant", "admin_staff", "student" })
        {
            var actor = Convert.ToInt32(await Scalar(connection, $"SELECT u.user_id FROM users u JOIN user_roles ur ON u.user_id=ur.user_id JOIN roles r ON r.role_id=ur.role_id WHERE u.status='active' AND r.role_name='{role}' ORDER BY u.user_id LIMIT 1"));
            var scoped = await read.GetSessions(actor, query); Check(scoped.All(s => rawIds.Contains(s.SessionId)), "Selected role reads real Session IDs safely: " + role);
            if (role is "teacher" or "teaching_assistant")
            {
                var table = role == "teacher" ? "teacher_classes" : "ta_classes"; var key = role == "teacher" ? "teacher_id" : "ta_id";
                var classes = (await Rows(connection, $"SELECT class_id FROM {table} WHERE {key}={actor} AND status='active'")).Select(r => int.Parse(r["class_id"]!)).ToHashSet();
                Check(scoped.Select(s => s.SessionId).Order().SequenceEqual(raw.Where(r => classes.Contains(int.Parse(r["class_id"]!))).Select(r => int.Parse(r["session_id"]!)).Order()), "Class assignment scope preserved: " + role);
            }
        }
        var actualClasses = raw.Select(r => int.Parse(r["class_id"]!)).Distinct().ToArray();
        var classRecords = await runtime.Classes.AsNoTracking().Where(c => actualClasses.Contains(c.ClassId)).ToListAsync();
        var managementClass = classRecords.FirstOrDefault(ScheduleManagementPolicy.ValidClass) ?? classRecords.First();
        managementClassId = managementClass.ClassId;
        managementStatus = ScheduleManagementPolicy.ValidClass(managementClass) ? HttpStatusCode.Conflict : HttpStatusCode.BadRequest;
        try { await new ScheduleManagementService(runtime).Templates(cm, managementClassId, default); throw new Exception("Expected existing class/mapping business gate"); }
        catch (ScheduleAccessException error) { Check(managementStatus == HttpStatusCode.Conflict && error.StatusCode == 409, "Legacy management remains blocked by mapping gate, not materialization 500"); }
        catch (ArgumentException) { Check(managementStatus == HttpStatusCode.BadRequest, "Existing completed/inactive Class policy still blocks management"); }
        var notification = await new NotificationInboxService(runtime).SnapshotAsync(cm);
        await using var strict = new EduTrackDbContext(MigrationOptions(cs.ConnectionString)); var expected = await new NotificationInboxService(strict).SnapshotAsync(cm);
        Check(JsonSerializer.Serialize(new { notification.Identity, notification.Inbox, notification.Trash, notification.UnreadCount }) == JsonSerializer.Serialize(new { expected.Identity, expected.Inbox, expected.Trash, expected.UnreadCount }), "Notifications snapshot is identical under runtime and migration models");
    }
    var hostRoot = Path.Combine(evidence, "host"); Directory.CreateDirectory(hostRoot);
    var builder = WebApplication.CreateBuilder(new WebApplicationOptions { ContentRootPath = hostRoot, EnvironmentName = "IsolatedCompatibility" }); builder.Logging.ClearProviders(); builder.WebHost.UseUrls("http://127.0.0.1:0");
    builder.Services.AddDbContext<EduTrackDbContext, EduTrackRuntimeDbContext>(o => o.UseMySql(cs.ConnectionString, new MySqlServerVersion(new Version(8, 0, 44)))); builder.Services.AddCoreInfrastructure();
    builder.Services.AddControllers().AddApplicationPart(typeof(ClassSessionsController).Assembly).ConfigureApplicationPartManager(m => m.FeatureProviders.Add(new CompatibilityControllers()));
    app = builder.Build(); app.MapControllers(); await app.StartAsync(); using var client = new HttpClient { BaseAddress = new Uri(app.Urls.Single()) };
    var httpSessions = await client.GetFromJsonAsync<List<ClassSessionDto>>("/api/classsessions");
    Check(httpSessions!.Select(s => s.SessionId).Order().SequenceEqual(rawIds), "HTTP /api/classsessions = 200 and exactly ten original IDs");
    foreach (var id in rawIds) Check((await client.GetFromJsonAsync<ClassSessionDto>("/api/classsessions/" + id))!.SessionId == id, "HTTP legacy detail 200: " + id);
    var httpSchedule = await client.GetFromJsonAsync<List<ScheduleSessionDto>>($"/api/schedule/sessions?userId={cm}&from={query.From}&toExclusive={query.ToExclusive}");
    Check(httpSchedule!.Select(s => s.SessionId).Order().SequenceEqual(rawIds), "HTTP Schedule = 200, no lost legacy sessions or NULL casts");
    Check((await client.GetAsync($"/api/notifications/inbox/snapshot?userId={cm}")).IsSuccessStatusCode, "HTTP Notifications snapshot remains 200");
    Check((await client.GetAsync($"/api/schedule/management/templates?userId={cm}&classId={managementClassId}")).StatusCode == managementStatus, "HTTP legacy management preserves the class/mapping gate, not 500");
    var afterReads = await Snapshot(connection); Save("after-reads.json", afterReads);
    Check(JsonSerializer.Serialize(allBeforeReads) == JsonSerializer.Serialize(afterReads), "Every table hash/count unchanged by repository/service/HTTP GETs");
    var originalAfterReads = await Snapshot(connection, before); Save("after-original-columns.json", originalAfterReads);
    Check(SameBusiness(before, originalAfterReads), "Original 10/4/6 records and all original columns preserved end-to-end");
    results["ExpandDatabase"] = cs.Database; results["ExpandReady"] = true;
    await app.StopAsync(); await app.DisposeAsync(); app = null;

    // Separate synthetic Contract schema: never invent mappings for restored legacy data.
    var contractCs = new MySqlConnectionStringBuilder(cs.ConnectionString) { Database = "edutrack_compat_contract_" + Guid.NewGuid().ToString("N") }; databases.Add(contractCs.Database);
    await using (var migration = new EduTrackDbContext(MigrationOptions(contractCs.ConnectionString)))
    {
        await migration.GetService<IMigrator>().MigrateAsync(contract);
        Check(!migration.Database.HasPendingModelChanges(), "Mapped Contract retains the approved migration model/snapshot");
        migration.Subjects.Add(new() { SubjectId = 701, SubjectName = "Compatibility fixture", SubjectCode = "COMPAT" });
        migration.Classes.Add(new() { ClassId = 801, ClassName = "Contract fixture", SubjectId = 701, StartDate = new(2026, 1, 1), EndDate = new(2027, 12, 31), Status = "active" });
        migration.ClassSchedules.Add(new() { ScheduleId = 201, ClassId = 801, DayOfWeek = "Monday", StartTime = TimeSpan.FromHours(10), EndTime = TimeSpan.FromHours(11), Versions = [new() { ScheduleVersionId = 301, EffectiveFrom = new(2026, 1, 5), DayOfWeek = "Monday", StartTime = TimeSpan.FromHours(10), EndTime = TimeSpan.FromHours(11) }] });
        migration.ClassSessions.Add(new() { SessionId = 901, ClassId = 801, ScheduleId = 201, ScheduleVersionId = 301, PlannedOccurrenceDate = new(2026, 11, 9), SessionDate = new(2026, 11, 10), StartTime = TimeSpan.FromHours(10), EndTime = TimeSpan.FromHours(11), Status = "scheduled" });
        await migration.SaveChangesAsync();
    }
    await using (var runtime = new EduTrackRuntimeDbContext(RuntimeOptions(contractCs.ConnectionString)))
    {
        var row = (await new ClassSessionRepository(runtime).GetAllAsync()).Single();
        Check(row.SessionId == 901 && row.ScheduleVersionId == 301 && row.PlannedOccurrenceDate == new DateOnly(2026, 11, 9) && row.OccurrenceWeekStart == new DateOnly(2026, 11, 9), "Runtime also reads fully mapped Contract data and independent actual date");
        runtime.ClassSessions.Add(new() { ClassId = 801, SessionDate = new(2026, 11, 16), StartTime = TimeSpan.FromHours(10), EndTime = TimeSpan.FromHours(11), Status = "scheduled" });
        try { await runtime.SaveChangesAsync(); throw new Exception("Expected Contract NOT NULL failure"); }
        catch (DbUpdateException error) { Check(error.InnerException is MySqlException { Number: 1048 }, "Contract DB still rejects missing identity under nullable runtime mapping"); runtime.ChangeTracker.Clear(); }
        runtime.ClassSessions.Add(new() { ClassId = 801, ScheduleId = 201, ScheduleVersionId = 301, PlannedOccurrenceDate = new(2026, 11, 9), SessionDate = new(2026, 11, 17), StartTime = TimeSpan.FromHours(12), EndTime = TimeSpan.FromHours(13), Status = "cancelled" });
        try { await runtime.SaveChangesAsync(); throw new Exception("Expected Contract occurrence unique failure"); }
        catch (DbUpdateException error) { Check(error.InnerException is MySqlException { Number: 1062 }, "Contract occurrence uniqueness remains enforced after runtime model change"); }
    }
    results["ContractDatabase"] = contractCs.Database; results["ContractPassed"] = true;
    results["Checks"] = checks; results["ReadyForApproval"] = true; Save("results.json", results);
    Console.WriteLine($"{checks} compatibility assertions passed; evidence {evidence}");
}
catch (Exception error) { results["Error"] = error.ToString(); results["ReadyForApproval"] = false; results["Checks"] = checks; Save("results.json", results); Console.Error.WriteLine(error); Environment.ExitCode = 1; }
finally
{
    if (app != null) await app.DisposeAsync();
    // Keep the copy datadir for review; the owning runner shuts down its verified server.
    Save("databases.json", databases);
}

sealed record TableEvidence(List<string> Columns, int Count, string Hash);
sealed class CompatibilityControllers : IApplicationFeatureProvider<ControllerFeature>
{
    public void PopulateFeature(IEnumerable<ApplicationPart> parts, ControllerFeature feature)
    {
        var allowed = new[] { typeof(ClassSessionsController), typeof(ScheduleController), typeof(NotificationInboxController), typeof(ScheduleManagementController) };
        foreach (var c in feature.Controllers.Where(c => !allowed.Contains(c.AsType())).ToList()) feature.Controllers.Remove(c);
    }
}
