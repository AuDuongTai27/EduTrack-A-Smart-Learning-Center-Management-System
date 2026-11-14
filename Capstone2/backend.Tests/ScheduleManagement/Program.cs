using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using EduTrack.API.Controllers.Schedule;
using EduTrack.API.Models.DTOs.Schedule;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Implementation;
using EduTrack.API.Services.Implementation;
using EduTrack.API.Services.Schedule;
using EduTrack.API.Services.Teaching.Implementation;
using EduTrack.API.Services.Learning.Implementation;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.FileProviders;
using MySqlConnector;
using static EduTrack.API.Services.Schedule.ScheduleManagementPolicy;
using static EduTrack.API.Services.Schedule.ScheduleTimeline;

var checks = 0;
void Check(bool value, string label) {if (!value) throw new Exception("FAIL " + label); checks++; Console.WriteLine("PASS " + label);}
void Invalid(Action action, string label) {try {action(); throw new Exception("Expected validation error");} catch (ArgumentException) {Check(true, label);}}
int SelectedUser(int id) => id;
foreach (var day in Enum.GetNames<DayOfWeek>()) Check(Weekday(day.ToLowerInvariant()).ToString() == day, "Weekday " + day);
foreach (var day in new[] {"1", "7", "Funday", ""}) Invalid(() => Weekday(day), "Invalid weekday rejected: " + day);
foreach (var time in new[] {"24:00", "18:60", "-01:00", "8:00"}) Invalid(() => Time(time), "Invalid time rejected: " + time);
Check(Time("08:30") == Time("08:30:00"), "Time contract retains seconds");
Check(FormatTime(TimeSpan.FromHours(18).Add(TimeSpan.FromTicks(1234560)))=="18:00:00.1234560","Stored TIME(6) precision is not rounded away in retained-session preview");
Invalid(() => Date("2027-02-29"), "Nonexistent actual/planned date rejected");
Check(Date("2028-02-29").Day == 29, "Leap day valid");
Check(!Overlap(Time("08:00"), Time("09:00"), Time("09:00"), Time("10:00")), "Adjacent slots do not overlap");
Check(SameRoom(" Room A ", "room a") && !SameRoom(null, null), "Room comparison without invented rooms");
foreach (var (date, expected) in new[] {("2027-01-01", "2026-12-28"), ("2027-01-04", "2027-01-04"), ("2027-01-06", "2027-01-04"), ("2027-08-31", "2027-08-30"), ("2027-09-01", "2027-08-30")})
    Check(Monday(DateOnly.Parse(date)).ToString("yyyy-MM-dd") == expected, "Stable occurrence week " + date);
var timeline = new ClassSchedule {Versions = [new() {EffectiveFrom = new(2027, 1, 4), EffectiveTo = new(2027, 1, 11), DayOfWeek = "Monday"}, new() {EffectiveFrom = new(2027, 1, 11), DayOfWeek = "Wednesday"}]};
Check(At(timeline, new DateOnly(2027, 1, 10))!.DayOfWeek == "Monday" && At(timeline, new DateOnly(2027, 1, 11))!.DayOfWeek == "Wednesday", "Effective ranges are half-open");
if (!args.Contains("--mysql")) {Console.WriteLine($"{checks} offline version/occurrence policy assertions; no database/host accessed."); return;}

// No appsettings or production Program. Refuse writes until isolated port/datadir identity is proved.
var cs = new MySqlConnectionStringBuilder {Server = "127.0.0.1", Port = 33308, UserID = "root", Password = "", Pooling = false, SslMode = MySqlSslMode.Disabled};
await using (var probe = new MySqlConnection(cs.ConnectionString))
{
    await probe.OpenAsync(); await using var cmd = new MySqlCommand("SELECT @@port,@@datadir", probe);
    await using var reader = await cmd.ExecuteReaderAsync(); await reader.ReadAsync();
    if (reader.GetInt32(0) != 33308 || !reader.GetString(1).Replace('\\', '/').Contains("/edutrack-enrollment-mysql-")) throw new Exception("Isolated MySQL identity required; refusing writes");
}
cs.Database = "edutrack_version_test_" + Guid.NewGuid().ToString("N");
var options = new DbContextOptionsBuilder<EduTrackDbContext>().UseMySql(cs.ConnectionString, new MySqlServerVersion(new Version(8, 0, 44))).Options;
var clock = new FixtureClock();
EduTrackDbContext Db() => new(options);
async Task<T> Use<T>(Func<ScheduleManagementService, Task<T>> action) {await using var db = Db(); return await action(new(db, clock));}
async Task Denied(Func<ScheduleManagementService, Task> action, int status, string label)
{try {await Use(async s => {await action(s); return true;}); throw new Exception("Expected denial " + label);} catch (ScheduleAccessException ex) {Check(ex.StatusCode == status, label);}}
async Task Bad(Func<Task> action, string label)
{try {await action(); throw new Exception("Expected rejection " + label);} catch (Exception ex) when (ex is ArgumentException or InvalidOperationException or MySqlException or DbUpdateException) {Check(true, label);}}
async Task SqlRejected(Func<Task> action, int code, string label, string? constraint = null)
{try {await action();throw new Exception("Expected DB rejection " + label);}catch(MySqlException ex){Check(ex.Number==code && (constraint==null || ex.Message.Contains(constraint,StringComparison.Ordinal)),label);}}
async Task Sql(string sql) {await using var connection = new MySqlConnection(cs.ConnectionString); await connection.OpenAsync(); await using var command = new MySqlCommand(sql, connection); await command.ExecuteNonQueryAsync();}
async Task<string> Scalar(string sql) {await using var connection = new MySqlConnection(cs.ConnectionString); await connection.OpenAsync(); await using var command = new MySqlCommand(sql, connection); return Convert.ToString(await command.ExecuteScalarAsync())!;}
ScheduleTemplateInput Slot(int c, string day = "Monday", string start = "18:00", string end = "20:00", string? room = "QA A", string from = "2027-01-04") =>
    new() {ClassId = c, DayOfWeek = day, StartTime = start, EndTime = end, Room = room, EffectiveFrom = from};
async Task<ScheduleTemplateDto> Allocate(ScheduleTemplateInput input)
{var p = await Use(s => s.PreviewTemplate(SelectedUser(505), input, default)); input.PreviewToken = p.PreviewToken; return (await Use(s => s.ConfirmTemplate(SelectedUser(505), input, default))).Template!;}
ScheduleGenerationInput Single(int root, string date = "2027-01-04", int c = 801) => new() {ClassId = c, Mode = "single", ScheduleId = root, SessionDate = date};
ScheduleGenerationInput Month(int c = 801, int year = 2027, int month = 1) => new() {ClassId = c, Mode = "month", Year = year, Month = month};
ScheduleGenerationInput Confirmation(ScheduleGenerationInput input, ScheduleGenerationPreview p) => new() {ClassId = input.ClassId, Mode = input.Mode, ScheduleId = input.ScheduleId,
    SessionDate = input.SessionDate, Year = input.Year, Month = input.Month, PreviewToken = p.PreviewToken, SelectedKeys = p.Rows.Where(r => r.Outcome == "eligible").Select(r => r.Key).ToList()};
WebApplication? app = null;
try
{
    string expand, contract;
    await using (var db = Db())
    {
        expand = db.Database.GetMigrations().Single(m => m.EndsWith("_ScheduleVersionExpand"));
        contract = db.Database.GetMigrations().Single(m => m.EndsWith("_ScheduleVersionContract"));
        await db.GetService<IMigrator>().MigrateAsync("20261107061101_AddStudentGrade");
        db.Roles.AddRange(new Role {RoleId = 101, RoleName = "teacher"}, new Role {RoleId = 102, RoleName = "teaching_assistant"}, new Role {RoleId = 103, RoleName = "student"},
            new Role {RoleId = 104, RoleName = "center_manager"}, new Role {RoleId = 105, RoleName = "admin_staff"}, new Role {RoleId = 106, RoleName = "parent"});
        foreach (var (id, role) in new[] {(501,101),(502,101),(503,102),(504,103),(505,104),(506,105),(507,101),(508,106),(509,101)})
            db.Users.Add(new User {UserId = id, UserCode = "VERSION-QA-" + id, FullName = "Synthetic " + id, PasswordHash = "isolated-only", Status = id == 507 ? "inactive" : "active", UserRoles = [new() {RoleId = role}]});
        db.Subjects.Add(new Subject {SubjectId = 701, SubjectName = "Synthetic Math", SubjectCode = "VERSION_QA"});
        for (var id = 801; id <= 811; id++) db.Classes.Add(new Class {ClassId = id, ClassName = "VERSION-QA Class " + id, SubjectId = 701, TuitionFee = 800000,
            StartDate = new(2026,1,1), EndDate = new(2028,12,31), Status = id == 806 ? "completed" : "active"});
        await db.SaveChangesAsync();
        foreach (var (c,t) in new[] {(801,501),(802,502),(803,501),(804,502),(805,502),(807,501),(808,501),(809,502),(810,502),(811,501)})
            db.TeacherClasses.Add(new TeacherClass {ClassId = c, TeacherId = t, Status = c == 807 ? "inactive" : "active"});
        db.TaClasses.AddRange(new TaClass {ClassId = 801, TaId = 503}, new TaClass {ClassId = 804, TaId = 503});
        db.StudentClasses.AddRange(new StudentClass {ClassId = 801, StudentId = 504, Status = "active", EnrolledDate = new(2026,1,1)}, new StudentClass {ClassId = 810, StudentId = 504, Status = "active", EnrolledDate = new(2026,1,1)});
        db.ClassSchedules.AddRange(new ClassSchedule {ScheduleId = 201, ClassId = 801, DayOfWeek = "Monday", StartTime = Time("18:00"), EndTime = Time("20:00"), Room = "QA A"},
            new ClassSchedule {ScheduleId = 202, ClassId = 802, DayOfWeek = "Tuesday", StartTime = Time("18:00"), EndTime = Time("20:00"), Room = "QA B"},
            new ClassSchedule {ScheduleId = 210, ClassId = 810, DayOfWeek = "Monday", StartTime = Time("18:00"), EndTime = Time("20:00"), Room = "OLD SNAPSHOT"});
        await db.SaveChangesAsync();
    }
    await Sql("""
        INSERT INTO class_sessions(session_id,class_id,schedule_id,session_date,start_time,end_time,room,status) VALUES
          (9001,801,201,'2027-01-04','18:00','20:00','QA A','completed'),
          (9002,801,NULL,'2027-01-12','18:00','20:00','QA A','scheduled'),
          (9003,801,201,'2027-01-18','18:00','20:00','QA A','cancelled'),
          (9004,801,NULL,'2027-02-02','18:00:00.123456','20:00:00.654321','QA A','scheduled');
        INSERT INTO attendance(session_id,student_id,recorded_by,recorded_at,status,note) VALUES(9001,504,501,'2027-01-04 13:00:00','present','Original evidence');
        """);
    // Artificial invalid input is deleted only by this synthetic fixture, never by a migration.
    await Sql("INSERT INTO class_sessions(session_id,class_id,schedule_id,session_date,start_time,end_time,status) VALUES(9010,802,201,'2027-01-04','10:00','11:00','scheduled')");
    await SqlRejected(async () => {await using var db = Db();await db.GetService<IMigrator>().MigrateAsync(expand);},3819,"Expand rejects legacy Class/Schedule mismatch before any schema change","CK_schedule_legacy_class_consistent");
    Check(await Scalar("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='class_sessions' AND COLUMN_NAME='planned_occurrence_date'")=="0","Failed Expand leaves original schema intact");
    await Sql("DELETE FROM class_sessions WHERE session_id=9010");
    await using (var db = Db()) await db.GetService<IMigrator>().MigrateAsync(expand);
    Check(await Scalar("SELECT COUNT(*) FROM class_sessions WHERE planned_occurrence_date IS NULL") == "4", "Expand does not infer planned dates or rewrite Session IDs");
    await using (var db = Db())
    {
        db.ClassScheduleVersions.AddRange(new ClassScheduleVersion {ScheduleVersionId = 301, ScheduleId = 201, EffectiveFrom = new(2026,12,28), DayOfWeek = "Monday", StartTime = Time("18:00"), EndTime = Time("20:00"), Room = "QA A"},
            new ClassScheduleVersion {ScheduleVersionId = 302, ScheduleId = 202, EffectiveFrom = new(2026,12,28), DayOfWeek = "Tuesday", StartTime = Time("18:00"), EndTime = Time("20:00"), Room = "QA B"},
            new ClassScheduleVersion {ScheduleVersionId = 310, ScheduleId = 210, EffectiveFrom = new(2026,1,5), DayOfWeek = "Thursday", StartTime = Time("13:00"), EndTime = Time("14:00"), Room = "CURRENT VERSION"});
        await db.SaveChangesAsync();
    }
    List<LegacySessionEvidence> evidence;
    await using (var db = Db()) evidence = await ScheduleLegacyBackfill.Inspect(db);
    LegacyOccurrenceMapping Mapping(int id, string planned) => new(id, 201, 301, DateOnly.Parse(planned), "Approved synthetic source fixture for Session " + id, evidence.Single(e => e.SessionId == id).ActualHash);
    await using (var db = Db()) Check((await ScheduleLegacyBackfill.Apply(db, [Mapping(9001,"2027-01-04")])).Count == 3, "Explicit partial mapping reports remaining unresolved rows");
    await Bad(async () => {await using var db = Db(); await ScheduleLegacyBackfill.Apply(db, [Mapping(9002,"2027-01-04")]);}, "Duplicate logical mapping rolls back without selecting a winner");
    Check(await Scalar("SELECT COUNT(*) FROM class_sessions WHERE session_id=9002 AND schedule_id IS NULL") == "1", "Failed mapping preserves null ScheduleId for review");
    await Bad(async () => {await using var db = Db(); await ScheduleLegacyBackfill.Apply(db, [Mapping(9002,"2027-01-11") with {EvidenceReference = ""}]);}, "Missing planned-date evidence is rejected");
    await Bad(async () => {await using var db = Db(); await ScheduleLegacyBackfill.Apply(db, [Mapping(9002,"2027-01-11") with {ExpectedActualHash = "stale"}]);}, "Stale actual/Attendance evidence is rejected");
    await Bad(async () => {await using var db = Db(); await ScheduleLegacyBackfill.Apply(db, [Mapping(9002,"2027-01-11") with {ScheduleId = 202, ScheduleVersionId = 302}]);}, "Mapping to another Class/version is rejected");
    await using (var db = Db()) await ScheduleLegacyBackfill.Apply(db, [Mapping(9002,"2027-01-11"), Mapping(9003,"2027-01-18")]);
    await Bad(async () => {await using var db = Db(); await db.GetService<IMigrator>().MigrateAsync(contract);}, "Contract refuses unresolved legacy before schema tightening");
    Check(await Scalar("SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='class_sessions' AND COLUMN_NAME='planned_occurrence_date'") == "YES", "Failed Contract leaves Expand columns nullable");
    await using (var db = Db()) Check((await ScheduleLegacyBackfill.Apply(db, [Mapping(9004,"2026-12-28")])).Count == 0, "NULL ScheduleId and moved actual date mapped only from explicit original-date proof");
    await Sql("INSERT INTO class_sessions(session_id,class_id,schedule_id,schedule_version_id,planned_occurrence_date,session_date,start_time,end_time,status) VALUES(9010,801,201,301,'2027-01-04','2027-01-06','10:00','11:00','cancelled')");
    await SqlRejected(async () => {await using var db = Db();await db.GetService<IMigrator>().MigrateAsync(contract);},3819,"Contract refuses duplicate occurrence inserted by a bypass writer","CK_schedule_occurrence_unique");
    await Sql("DELETE FROM class_sessions WHERE session_id=9010");
    await Sql("INSERT INTO class_schedule_versions(schedule_id,effective_from,day_of_week,start_time,end_time) VALUES(201,'2027-01-04','Monday','18:00','20:00')");
    await Bad(async () => {await using var db = Db(); await db.GetService<IMigrator>().MigrateAsync(contract);}, "Contract refuses overlapping version timelines");
    await Sql("DELETE FROM class_schedule_versions WHERE schedule_id=201 AND effective_from='2027-01-04'");
    await using (var db = Db())
    {
        await db.GetService<IMigrator>().MigrateAsync(contract);
        Check(!db.Database.HasPendingModelChanges(), "Contract target equals actual EF model/snapshot");
        var after = await ScheduleLegacyBackfill.Inspect(db);
        Check(after.All(e => evidence.Single(x => x.SessionId == e.SessionId).ActualHash == e.ActualHash), "Expand/Backfill/Contract preserve actual fields and full Attendance fingerprints");
    }
    Check(await Scalar("SELECT GROUP_CONCAT(session_id ORDER BY session_id) FROM class_sessions") == "9001,9002,9003,9004", "All legacy Session IDs retained");
    Check(await Scalar("SELECT DATE_FORMAT(occurrence_week_start,'%Y-%m-%d') FROM class_sessions WHERE session_id=9004") == "2026-12-28", "Generated stored week follows planned origin across year/month");
    await Bad(() => Sql("INSERT INTO class_sessions(class_id,schedule_id,schedule_version_id,planned_occurrence_date,session_date,start_time,end_time,status) VALUES(801,NULL,301,'2027-02-01','2027-02-01','18:00','20:00','scheduled')"), "Contract DB rejects NULL occurrence owner");
    foreach (var status in new[] {"scheduled","cancelled","completed"})
        await SqlRejected(() => Sql($"INSERT INTO class_sessions(class_id,schedule_id,schedule_version_id,planned_occurrence_date,session_date,start_time,end_time,status) VALUES(801,201,301,'2027-01-04','2027-03-01','10:00','11:00','{status}')"),1062,"DB unique rejects same planned occurrence despite different actual/status " + status,"UQ_schedule_occurrence_week");
    await Bad(() => Sql("INSERT INTO class_sessions(class_id,schedule_id,schedule_version_id,planned_occurrence_date,session_date,start_time,end_time,status) VALUES(801,201,302,'2027-02-01','2027-02-01','18:00','20:00','scheduled')"), "DB composite FK rejects source version from a different Schedule");
    await Bad(() => Sql("INSERT INTO class_schedule_versions(schedule_id,effective_from,day_of_week,start_time,end_time) VALUES(202,'2027-02-02','Tuesday','18:00','20:00')"), "DB CHECK rejects non-Monday effective boundary");
    Check((await Use(s=>s.Preview(SelectedUser(501),Month(year:2026,month:12),default))).Rows.Single().StartTime=="18:00:00.1234560","Moved legacy occurrence exposes exact actual time while planned identity remains in original month");
    await Denied(s => s.Capabilities(0,default),400,"Missing user selector is rejected");
    foreach (var id in new[] {503,504,507,508}) await Denied(s => s.Capabilities(SelectedUser(id),default),400,"TA/Student/inactive/Parent denied " + id);
    await Denied(s => s.PreviewTemplate(SelectedUser(501),Slot(803),default),400,"Teacher cannot allocate or version templates");
    await Denied(s => s.Preview(SelectedUser(509),Month(),default),404,"Unassigned Teacher cannot generate");
    await Denied(s => s.Preview(SelectedUser(501),Month(807),default),404,"Inactive assignment cannot generate");
    await Denied(s => s.Preview(SelectedUser(505),Month(),default),400,"Manager without Teacher role cannot generate");
    var january = await Use(s => s.Preview(SelectedUser(501),Month(),default));
    Check(january.Rows.Count(r => r.Outcome == "existing") == 3 && january.Rows.Count(r => r.Outcome == "eligible") == 1, "New schema January preview recognizes moved/cancelled legacy occurrences");
    Check(january.Rows.Single(r => r.SessionId == 9002).SessionDate == "2027-01-12" && january.Rows.Single(r => r.SessionId == 9002).PlannedOccurrenceDate == "2027-01-11", "Actual date is separate from planned identity");
    var janConfirm = Confirmation(Month(),january);
    Check((await Use(s => s.Confirm(SelectedUser(501),janConfirm,default))).Created == 1, "Generate materializes only the missing January occurrence");
    Check((await Use(s => s.Confirm(SelectedUser(501),janConfirm,default))).Created == 0, "Retry returns existing IDs without duplicates");
    var root = (await Use(s => s.Templates(SelectedUser(505),801,default))).Single();
    var change = Slot(801,"Wednesday","19:00","21:00","QA A2","2027-01-11"); change.Operation = "replace"; change.ScheduleId = root.ScheduleId; change.Version = root.Version;
    var changePreview = await Use(s => s.PreviewTemplate(SelectedUser(505),change,default));
    Check(changePreview.RetainedSessions.Count == 3 && changePreview.RetainedSessions.Any(s => s.Status == "cancelled"), "Future version preview lists materialized sessions retained from old version");
    var beforeVersion = await Scalar("SELECT SHA2(GROUP_CONCAT(CONCAT(session_id,':',session_date,':',start_time,':',end_time,':',COALESCE(room,''),':',status,':',schedule_version_id,':',planned_occurrence_date) ORDER BY session_id),256) FROM class_sessions");
    change.PreviewToken = changePreview.PreviewToken;
    var updated = (await Use(s => s.ConfirmTemplate(SelectedUser(505),change,default))).Template!;
    Check(updated.ScheduleId == 201 && updated.Versions.Count == 2 && updated.Versions[0].EffectiveTo == "2027-01-11", "Stable ScheduleId with half-open old/new versions");
    Check(await Scalar("SELECT SHA2(GROUP_CONCAT(CONCAT(session_id,':',session_date,':',start_time,':',end_time,':',COALESCE(room,''),':',status,':',schedule_version_id,':',planned_occurrence_date) ORDER BY session_id),256) FROM class_sessions") == beforeVersion, "Changing weekday/time/room never rewrites already generated Sessions");
    var afterChange = await Use(s => s.Preview(SelectedUser(501),Month(),default));
    Check(afterChange.Rows.Count == 4 && afterChange.Rows.All(r => r.Outcome == "existing"), "Generate after changing weekday never recreates same ca/week");
    Check((await Use(s => s.Preview(SelectedUser(501),Single(201,"2027-01-13"),default))).Rows.Single().SessionId == 9002, "New Wednesday candidate maps to original Monday occurrence");
    await Denied(s => s.Confirm(SelectedUser(501),janConfirm,default),409,"Template version change invalidates stale generation Preview");
    await Denied(s => s.ConfirmTemplate(SelectedUser(505),change,default),409,"Stale template version cannot be appended twice");
    await Bad(async () => await Use(s => s.PreviewTemplate(SelectedUser(505),Slot(803,from:"2027-01-05"),default)), "Non-Monday future version rejected");
    await Bad(async () => await Use(s => s.PreviewTemplate(SelectedUser(505),Slot(803,from:"2026-11-09"),default)), "Current/past week cannot be changed as a future template");
    await Denied(s => s.PreviewTemplate(SelectedUser(505),Slot(803),default),409,"Teacher resource conflict on recurring allocation");
    await Denied(s => s.PreviewTemplate(SelectedUser(505),Slot(804,room:"Different"),default),409,"TA resource conflict on recurring allocation");
    await Denied(s => s.PreviewTemplate(SelectedUser(505),Slot(802,room:" qa a "),default),409,"Room resource conflict on recurring allocation");
    await Denied(s => s.PreviewTemplate(SelectedUser(505),Slot(801),default),409,"Class duplicate/overlap on recurring allocation");
    await Denied(s => s.PreviewTemplate(SelectedUser(505),Slot(803,"Tuesday",room:"Different",from:"2027-01-11"),default),409,"Actual moved booking still participates in resource conflicts");
    var feb = await Use(s => s.Preview(SelectedUser(501),Month(month:2),default));
    Check(feb.Rows.Where(r => r.Outcome == "eligible").All(r => r.StartTime == "19:00:00" && r.Room == "QA A2"), "New occurrences use effective version time/room snapshot");
    await Use(s => s.Confirm(SelectedUser(501),Confirmation(Month(month:2),feb),default));
    var retire = Slot(801,from:"2027-02-15"); retire.Operation = "retire"; retire.ScheduleId = 201; retire.Version = updated.Version;
    var retirement = await Use(s => s.PreviewTemplate(SelectedUser(505),retire,default)); retire.PreviewToken = retirement.PreviewToken;
    Check(retirement.RetainedSessions.Count == 2, "Retire preview includes already generated future weeks");
    await Use(s => s.ConfirmTemplate(SelectedUser(505),retire,default));
    Check((await Use(s => s.Preview(SelectedUser(501),Month(month:2),default))).Rows.All(r => r.Outcome == "existing"), "Retire preserves all existing future Sessions");
    Check((await Use(s => s.Preview(SelectedUser(501),Month(month:3),default))).Rows.Count == 0, "Retired template generates no new future occurrence");
    var raceRoot = await Allocate(Slot(803,start:"10:00",end:"11:00",room:"QA RACE"));
    var raceMonth = Month(803); var racePreview = await Use(s => s.Preview(SelectedUser(501),raceMonth,default)); var raceConfirm = Confirmation(raceMonth,racePreview);
    var raceSingle = Single(raceRoot.ScheduleId,c:803); var raceOnePreview = await Use(s => s.Preview(SelectedUser(501),raceSingle,default));
    var concurrent = await Task.WhenAll(Enumerable.Range(0,5).Select(i => Use(s => s.Confirm(SelectedUser(501),i == 0 ? Confirmation(raceSingle,raceOnePreview) : raceConfirm,default))));
    Check(concurrent.Sum(p => p.Created) == 4, "Concurrent single/month Confirm from independent connections creates four occurrences exactly once");
    Check((await Use(s => s.Confirm(SelectedUser(501),raceConfirm,default))).Created == 0, "Concurrent batch retry is idempotent");
    var pendingVersion = Slot(803,"Friday","06:00","07:00","QA STALE","2027-01-11");pendingVersion.ScheduleId=raceRoot.ScheduleId;pendingVersion.Operation="replace";pendingVersion.Version=raceRoot.Version;
    var pendingPreview=await Use(s=>s.PreviewTemplate(SelectedUser(505),pendingVersion,default));pendingVersion.PreviewToken=pendingPreview.PreviewToken;
    var extra=Single(raceRoot.ScheduleId,"2027-02-01",803);var extraPreview=await Use(s=>s.Preview(SelectedUser(501),extra,default));
    await Use(s=>s.Confirm(SelectedUser(501),Confirmation(extra,extraPreview),default));
    await Denied(s=>s.ConfirmTemplate(SelectedUser(505),pendingVersion,default),409,"Newly materialized Session invalidates template Preview even when timeline is unchanged");
    var cross = await Allocate(Slot(808,"Tuesday","08:00","09:00","QA CROSS","2027-08-02"));
    var crossInput = Single(cross.ScheduleId,"2027-08-31",808); var crossPreview = await Use(s => s.Preview(SelectedUser(501),crossInput,default));
    var crossId = (await Use(s => s.Confirm(SelectedUser(501),Confirmation(crossInput,crossPreview),default))).Rows.Single().SessionId;
    await Sql($"UPDATE class_sessions SET session_date='2027-09-02' WHERE session_id={crossId}"); // Simulated future Phase3 apply, isolated fixture only.
    var crossChange = Slot(808,"Wednesday","11:00","12:00","QA CROSS 2","2027-08-30"); crossChange.Operation = "replace"; crossChange.ScheduleId = cross.ScheduleId; crossChange.Version = cross.Version;
    await Allocate(crossChange);
    var september = await Use(s => s.Preview(SelectedUser(501),Month(808,month:9),default));
    Check(september.Rows.Single(r => r.OccurrenceWeekStart == "2027-08-30").SessionId == crossId, "Cross-month weekday change finds original occurrence outside requested planned/actual date");
    Check(september.Rows.Single(r => r.SessionId == crossId).PlannedOccurrenceDate == "2027-08-31", "Reschedule keeps original planned date and source version");
    var crossYear = await Allocate(Slot(809,"Friday","10:00","11:00","QA YEAR","2026-12-28"));
    var yearInput = Single(crossYear.ScheduleId,"2027-01-01",809); var yp = await Use(s => s.Preview(SelectedUser(502),yearInput,default));
    var yearId = (await Use(s => s.Confirm(SelectedUser(502),Confirmation(yearInput,yp),default))).Rows.Single().SessionId;
    await Sql($"UPDATE class_sessions SET status='cancelled',session_date='2027-01-05' WHERE session_id={yearId}");
    var cancelled = await Use(s => s.Preview(SelectedUser(502),yearInput,default));
    Check(cancelled.Rows.Single().Outcome == "existing" && cancelled.Rows.Single().OccurrenceWeekStart == "2026-12-28", "Cancelled/rescheduled cross-year occurrence is never regenerated");
    await using (var db = Db())
    {
        Check((await new TeachingScheduleService(db).GetMyScheduleAsync(502)).Any(s => s.ClassId == 810 && s.DayOfWeek == "Thursday" && s.Room == "CURRENT VERSION"), "Teacher/TA schedule adapter reads effective version, not stale root columns");
        Check((await new ClassScheduleService(new ClassScheduleRepository(db)).GetClassScheduleByIdAsync(210))!.DayOfWeek == "Thursday", "Legacy query adapter uses version at listing date");
        Check((await new TeachingMyClassService(db).GetMyClassesAsync(502)).Single(c=>c.ClassId==810).ScheduleSummary!.Contains("13:00"),"Teacher/TA My Classes adapter uses effective version summary");
        Check((await new LearnerDashboardService(db).GetStudentScheduleAsync(504)).Any(s=>s.ClassId==810 && s.StartH==13 && s.Room=="CURRENT VERSION"),"Student legacy timetable adapter reads effective version while keeping its DTO/UI contract");
        Check((await new ScheduleReadService(db).GetSessions(SelectedUser(504),new(){From="2027-01-04",ToExclusive="2027-01-11"})).Any(s => s.SessionId == 9001 && s.ScheduleVersionId == 301), "Enrolled Student reads actual Session with source provenance");
        Check(await db.Attendances.CountAsync() == 1 && (await db.Attendances.SingleAsync()).SessionId == 9001, "Attendance SessionId and row unchanged after all version/generation operations");
        Check(await db.StudentClasses.CountAsync() == 2 && !await db.TuitionInvoices.AnyAsync() && !await db.Payments.AnyAsync() && (await db.Classes.SingleAsync(c => c.ClassId == 801)).TuitionFee == 800000, "Tuition monthly policy and enrollment untouched");
        Check(!await db.ClassSessions.GroupBy(s => new {s.ScheduleId,s.OccurrenceWeekStart}).AnyAsync(g => g.Count() > 1), "Every official occurrence is unique after concurrency and version changes");
    }
    var failureRoot = await Allocate(Slot(811,"Saturday","08:00","09:00","QA ROLLBACK"));
    var failureInput = Month(811); var fp = await Use(s => s.Preview(SelectedUser(501),failureInput,default));
    var failingOptions = new DbContextOptionsBuilder<EduTrackDbContext>().UseMySql(cs.ConnectionString,new MySqlServerVersion(new Version(8,0,44))).AddInterceptors(new FailAfterInsert()).Options;
    await Bad(async () => {await using var db = new EduTrackDbContext(failingOptions); await new ScheduleManagementService(db,clock).Confirm(SelectedUser(501),Confirmation(failureInput,fp),default);}, "Injected failure after INSERT rolls back outer transaction");
    Check(await Scalar($"SELECT COUNT(*) FROM class_sessions WHERE schedule_id={failureRoot.ScheduleId}") == "0", "No partial batch survives failed Confirm");
    Check((await Use(s => s.Confirm(SelectedUser(501),Confirmation(failureInput,fp),default))).Created == 4, "Named lock and transaction recover after failed INSERT");
    var concurrentChange=Slot(811,"Sunday","08:00","09:00","QA VERSION RACE","2027-01-11");concurrentChange.Operation="replace";concurrentChange.ScheduleId=failureRoot.ScheduleId;concurrentChange.Version=failureRoot.Version;
    concurrentChange.PreviewToken=(await Use(s=>s.PreviewTemplate(SelectedUser(505),concurrentChange,default))).PreviewToken;
    var versionRace=await Task.WhenAll(Enumerable.Range(0,2).Select(async _=>{try{await Use(s=>s.ConfirmTemplate(SelectedUser(505),concurrentChange,default));return true;}catch(ScheduleAccessException ex)when(ex.StatusCode==409){return false;}}));
    Check(versionRace.Count(won=>won)==1,"Concurrent version Confirm has one winner and no overlapping timeline");

    if (args.Contains("--http"))
    {
        var contentRoot = Path.Combine(Path.GetTempPath(),"edutrack-version-host-"+Guid.NewGuid().ToString("N")); Directory.CreateDirectory(contentRoot);
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions{ContentRootPath=contentRoot,EnvironmentName="ScheduleIsolatedTest",Args=[]});
        builder.Logging.ClearProviders(); builder.WebHost.UseUrls("http://127.0.0.1:0"); builder.Services.AddSingleton<TimeProvider>(clock);
        builder.Services.AddDbContext<EduTrackDbContext, EduTrackRuntimeDbContext>(o => o.UseMySql(cs.ConnectionString,new MySqlServerVersion(new Version(8,0,44))));
        builder.Services.AddControllers().AddApplicationPart(typeof(ScheduleController).Assembly).ConfigureApplicationPartManager(m => m.FeatureProviders.Add(new OnlyScheduleControllers()));
        app = builder.Build(); var nonce = Guid.NewGuid().ToString("N");
        var actors = new Dictionary<string,int>{{"teacher",501},{"teaching-assistant",503},{"student",504},{"center-manager",505},{"admin-staff",506}};

        app.MapControllers(); var frontend=Environment.GetEnvironmentVariable("EDUTRACK_TEST_FRONTEND_ROOT");
        if(!string.IsNullOrEmpty(frontend))
        {
            var dist=Path.GetFullPath(Path.Combine(frontend,"dist")); app.UseStaticFiles(new StaticFileOptions{FileProvider=new PhysicalFileProvider(dist)});
            app.MapFallback(async http => {if(http.Request.Path.StartsWithSegments("/api")){http.Response.StatusCode=404;return;}http.Response.ContentType="text/html";await http.Response.SendFileAsync(Path.Combine(dist,"index.html"));}).WithMetadata(new Microsoft.AspNetCore.Routing.HttpMethodMetadata(["GET"]));
        }
        await app.StartAsync(); var origin=app.Urls.Single(); using var client=new HttpClient{BaseAddress=new Uri(origin)};
        foreach(var endpoint in new[]{"templates/preview","templates/confirm","sessions/preview","sessions/confirm"})
            Check((await client.PostAsJsonAsync("/api/schedule/management/"+endpoint, endpoint.StartsWith("templates")?(object)Slot(803):Month())).StatusCode==HttpStatusCode.BadRequest,"HTTP anonymous write denied: "+endpoint);
        foreach(var actor in new[]{"student","teaching-assistant","center-manager"})
        {
            using var req=new HttpRequestMessage(HttpMethod.Post,"/api/schedule/management/sessions/confirm?userId="+actors[actor]){Content=JsonContent.Create(raceConfirm)};
            Check((await client.SendAsync(req)).StatusCode==HttpStatusCode.BadRequest,"HTTP unauthorized Session creator denied: "+actor);
        }
        var publicCaps=await client.GetFromJsonAsync<ScheduleCapabilities>("/api/schedule/management/capabilities?userId=501");
        Check(publicCaps!.CanCreateSessions,"HTTP Teacher capabilities without session/principal");
        Check((await client.GetAsync("/api/schedule/management/templates?classId=801&userId=505")).IsSuccessStatusCode,"HTTP Manager templates without login");
        Check((await client.PostAsJsonAsync("/api/schedule/management/sessions/preview?userId=501",Month())).IsSuccessStatusCode,"HTTP generation Preview without authentication");
        if(!string.IsNullOrEmpty(frontend))
        {
            var info=new ProcessStartInfo("node"){WorkingDirectory=frontend,UseShellExecute=false,CreateNoWindow=true,RedirectStandardOutput=true,RedirectStandardError=true}; info.ArgumentList.Add("tests/scheduleManagement.http.browser.mjs");
            info.Environment["EDUTRACK_SCHEDULE_TEST_ORIGIN"]=origin;info.Environment["EDUTRACK_SCHEDULE_TEST_NONCE"]=nonce;
            using var browser=Process.Start(info)!;var stdout=browser.StandardOutput.ReadToEndAsync();var stderr=browser.StandardError.ReadToEndAsync();await browser.WaitForExitAsync();Console.WriteLine(await stdout);Console.WriteLine(await stderr);Check(browser.ExitCode==0,"Version/occurrence browser uses migrated isolated MySQL and controlled principals");
        }
    }
    Console.WriteLine($"{checks} NEW schema/version/migration assertions; isolated database {cs.Database}");
}
catch(Exception ex) {Console.Error.WriteLine(ex);Environment.ExitCode=1;}
finally
{
    if(app!=null)await app.DisposeAsync();
    if(!cs.Database.StartsWith("edutrack_version_test_",StringComparison.Ordinal))throw new Exception("Refusing cleanup");
    await using var cleanup=Db();await cleanup.Database.EnsureDeletedAsync();
}

sealed class FixtureClock : TimeProvider {public override DateTimeOffset GetUtcNow()=>new(2026,11,9,1,0,0,TimeSpan.Zero);}
sealed class OnlyScheduleControllers : IApplicationFeatureProvider<ControllerFeature>
{
    public void PopulateFeature(IEnumerable<ApplicationPart> parts,ControllerFeature feature)
    {foreach(var c in feature.Controllers.Where(c=>c.AsType()!=typeof(EduTrack.API.Controllers.Queries.UsersController)&&c.AsType()!=typeof(ScheduleController)).ToList())feature.Controllers.Remove(c);}
}
sealed class FailAfterInsert : SaveChangesInterceptor
{
    public override ValueTask<int> SavedChangesAsync(SaveChangesCompletedEventData data,int result,CancellationToken ct=default)
    {if(data.Context!.ChangeTracker.Entries<ClassSession>().Any())throw new InvalidOperationException("Injected failure after INSERT");return ValueTask.FromResult(result);}
}
