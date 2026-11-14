using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Implementation;
using EduTrack.API.Services.Management;
using EduTrack.API.Services.Management.Implementation;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Controllers.Queries;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using EduTrack.API.Services.Implementation;
using MySqlConnector;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;

var checks = 0;
void Check(bool condition, string message)
{
    if (!condition) throw new Exception(message);
    checks++;
    Console.WriteLine("PASS " + message);
}
void Reject(Action action, string message)
{
    try { action(); } catch (ArgumentException) { Check(true, message); return; }
    throw new Exception(message);
}
foreach (var status in new[] { "active", "upcoming", " Active ", "UPCOMING" })
    Check(StudentEnrollmentPolicy.CanEnroll(status), "Eligible status " + status);
foreach (var status in new string?[] { "inactive", "completed", "cancelled", "unknown", "", null })
    Check(!StudentEnrollmentPolicy.CanEnroll(status), "Ineligible status " + status);
var eligible = new[] { new Class { ClassId = 1, GradeId = 70, ClassName = "7A", Status = "active" } };
StudentEnrollmentPolicy.EnsureEligible(null, Array.Empty<int>(), Array.Empty<Class>());
StudentEnrollmentPolicy.EnsureEligible(70, new[] { 1, 1 }, eligible);
Check(true, "No classes is optional; repeated IDs are accepted as a set");
Reject(() => StudentEnrollmentPolicy.EnsureEligible(null, new[] { 1 }, eligible), "Grade required for enrollment");
Reject(() => StudentEnrollmentPolicy.EnsureEligible(7, new[] { 1 }, eligible), "Class must belong to actual selected grade ID");
Reject(() => StudentEnrollmentPolicy.EnsureEligible(70, new[] { 2 }, eligible), "Missing class rejected");
Reject(() => StudentEnrollmentPolicy.EnsureEligible(70, new[] { -1 }, eligible), "Invalid class ID rejected");
foreach (var status in new[] { "inactive", "completed", "cancelled", "unknown" })
    Reject(() => StudentEnrollmentPolicy.EnsureEligible(70, new[] { 1 }, new[] { new Class { ClassId = 1, GradeId = 70, Status = status } }), "Enrollment rejects " + status);

var webJson = new JsonSerializerOptions(JsonSerializerDefaults.Web);
Check(!JsonSerializer.Deserialize<UpdateUserDto>("{\"fullName\":\"Synthetic\"}", webJson)!.GradeSpecified, "Omitted Grade distinguished from an explicit change");
Check(JsonSerializer.Deserialize<UpdateUserDto>("{\"fullName\":\"Synthetic\",\"gradeId\":null}", webJson)!.GradeSpecified, "Explicit null Grade recognized for validation");
var newLinkDto = new AssignParentStudentDto();
Check(newLinkDto.Relationship == "Mother" && !newLinkDto.RelationshipSpecified, "Mother default is distinguishable from an explicit relationship update");
Check(!System.ComponentModel.DataAnnotations.Validator.TryValidateObject(newLinkDto, new(newLinkDto), new List<System.ComponentModel.DataAnnotations.ValidationResult>(), true), "DTO rejects missing Parent and Student IDs");

var reviewedMigration = new EduTrack.API.Migrations.AddStudentGrade();
var column = reviewedMigration.UpOperations.OfType<AddColumnOperation>().SingleOrDefault();
var index = reviewedMigration.UpOperations.OfType<CreateIndexOperation>().SingleOrDefault();
var foreignKey = reviewedMigration.UpOperations.OfType<AddForeignKeyOperation>().SingleOrDefault();
Check(reviewedMigration.UpOperations.Count == 3 && column is { Table: "users", Name: "grade_id", IsNullable: true, ColumnType: "int" }
    && column.DefaultValue == null && column.DefaultValueSql == null, "Migration adds only a nullable integer Grade column without backfill/default");
Check(index is { Table: "users", Name: "IX_users_grade_id", IsUnique: false } && index.Columns.SequenceEqual(new[] { "grade_id" })
    && foreignKey is { Table: "users", PrincipalTable: "grades", OnDelete: ReferentialAction.Restrict }
    && foreignKey.Columns.SequenceEqual(new[] { "grade_id" }) && foreignKey.PrincipalColumns is { } principalColumns
    && principalColumns.SequenceEqual(new[] { "grade_id" }), "Migration adds only the required Grade index and restrict FK");
Check(reviewedMigration.DownOperations.Count == 3
    && reviewedMigration.DownOperations.OfType<DropColumnOperation>().SingleOrDefault() is { Table: "users", Name: "grade_id" }
    && reviewedMigration.DownOperations.OfType<DropForeignKeyOperation>().SingleOrDefault() is { Table: "users", Name: "FK_users_grades_grade_id" }
    && reviewedMigration.DownOperations.OfType<DropIndexOperation>().SingleOrDefault() is { Table: "users", Name: "IX_users_grade_id" }, "Down removes only the Grade schema components and requires data preservation first");

if (!args.Contains("--mysql"))
{
    Console.WriteLine($"{checks} enrollment policy assertions passed; no database accessed. Use --mysql only with the isolated test server.");
    return;
}

// Fixed loopback-only test port. Never read application configuration or credentials.
var connection = new MySqlConnectionStringBuilder
{
    Server = "127.0.0.1", Port = 33308, UserID = "root", Password = "",
    SslMode = MySqlSslMode.Disabled, Pooling = false, ConnectionTimeout = 5
};
await using (var probe = new MySqlConnection(connection.ConnectionString))
{
    await probe.OpenAsync();
    await using var command = probe.CreateCommand();
    command.CommandText = "SELECT @@port, @@datadir";
    await using var reader = await command.ExecuteReaderAsync();
    await reader.ReadAsync();
    var dataPath = reader.GetString(1).Replace('\\', '/');
    if (reader.GetInt32(0) != 33308 || !dataPath.Contains("/edutrack-enrollment-mysql-", StringComparison.OrdinalIgnoreCase))
        throw new Exception("Isolated MySQL identity mismatch. No writes allowed.");
}
connection.Database = "edutrack_enrollment_test_" + Guid.NewGuid().ToString("N");
var options = new DbContextOptionsBuilder<EduTrackDbContext>()
    .UseMySql(connection.ConnectionString, new MySqlServerVersion(new Version(8, 0, 0))).Options;
EduTrackDbContext Context() => new(options);
User Student(string code) => new() { UserCode = code, FullName = "Synthetic Student", Specialty = "Class 7", Gender = "male", PasswordHash = "test-only", Status = "active" };
async Task<User> Save(string code, int? grade, params int[] ids)
{
    await using var db = Context();
    return await new UserRepository(db).CreateStudentWithClassesAsync(Student(code), grade, ids);
}
async Task<int[]> Counts()
{
    await using var db = Context();
    return new[] { await db.Users.CountAsync(), await db.UserRoles.CountAsync(), await db.StudentClasses.CountAsync(), await db.TuitionInvoices.CountAsync(), await db.Payments.CountAsync() };
}
async Task<string> EnrollmentSnapshot()
{
    await using var db = Context();
    return JsonSerializer.Serialize(await db.StudentClasses.AsNoTracking().OrderBy(sc => sc.ScId)
        .Select(sc => new { sc.ScId, sc.StudentId, sc.ClassId, sc.EnrolledDate, sc.Status, sc.DroppedAt, sc.DropReason }).ToListAsync());
}
async Task<string> DatabaseFingerprint(string connectionString, bool excludeProfileGrade = false)
{
    await using var sql = new MySqlConnection(connectionString);
    await sql.OpenAsync();
    var tables = new List<string>();
    await using (var command = sql.CreateCommand())
    {
        command.CommandText = "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' AND LOWER(TABLE_NAME)<>'__efmigrationshistory' ORDER BY TABLE_NAME";
        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync()) tables.Add(reader.GetString(0));
    }
    var contents = new List<object>();
    foreach (var table in tables)
    {
        if (table.Any(c => !char.IsAsciiLetterOrDigit(c) && c != '_')) throw new Exception("Unexpected test table identifier");
        await using var command = sql.CreateCommand();
        command.CommandText = $"SELECT * FROM `{table}`";
        await using var reader = await command.ExecuteReaderAsync();
        var rows = new List<string>();
        while (await reader.ReadAsync())
        {
            var values = new SortedDictionary<string, string?>(StringComparer.Ordinal);
            for (var i = 0; i < reader.FieldCount; i++)
            {
                var name = reader.GetName(i);
                if (excludeProfileGrade && table == "users" && name == "grade_id") continue;
                values[name] = reader.IsDBNull(i) ? null : reader.GetValue(i) switch
                {
                    byte[] bytes => Convert.ToHexString(bytes),
                    DateTime date => date.ToString("O", System.Globalization.CultureInfo.InvariantCulture),
                    TimeSpan time => time.ToString("c", System.Globalization.CultureInfo.InvariantCulture),
                    var value => Convert.ToString(value, System.Globalization.CultureInfo.InvariantCulture)
                };
            }
            rows.Add(JsonSerializer.Serialize(values));
        }
        rows.Sort(StringComparer.Ordinal);
        // The Grade rehearsal predates Schedule Versioning. Compare every original
        // table value, and separately forbid fabricated rows in the new empty table.
        if (excludeProfileGrade && table == "class_schedule_versions")
        {
            if (rows.Count != 0) throw new Exception("Migration unexpectedly created Schedule versions without reviewed mapping.");
            continue;
        }
        contents.Add(new { table, rows });
    }
    return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(contents))));
}
async Task NativeTestTool(string executable, IEnumerable<string> arguments, string? input = null)
{
    var info = new ProcessStartInfo(Path.Combine(Environment.GetEnvironmentVariable("EDUTRACK_TEST_MYSQL_BIN")
        ?? @"C:\Program Files\MySQL\MySQL Server 8.0\bin", executable))
    {
        UseShellExecute = false, CreateNoWindow = true, RedirectStandardInput = true,
        RedirectStandardOutput = true, RedirectStandardError = true, StandardInputEncoding = new UTF8Encoding(false)
    };
    foreach (var value in new[] { "--no-defaults", "--protocol=TCP", "--host=127.0.0.1", "--port=33308", "--user=root", "--ssl-mode=DISABLED", "--default-character-set=utf8mb4" }.Concat(arguments))
        info.ArgumentList.Add(value);
    info.Environment["MYSQL_PWD"] = ""; // Isolated server only; never read app credentials.
    using var process = Process.Start(info) ?? throw new Exception("Test tool did not start");
    var output = process.StandardOutput.ReadToEndAsync();
    var error = process.StandardError.ReadToEndAsync();
    if (input != null) await process.StandardInput.WriteAsync(input);
    process.StandardInput.Close();
    await process.WaitForExitAsync();
    await output;
    var errorText = await error;
    if (process.ExitCode != 0) throw new Exception($"Isolated {executable} failed: {errorText}");
}
async Task Fail(Func<Task> action, string message)
{
    var before = await Counts();
    var failed = false;
    try { await action(); } catch { failed = true; }
    Check(failed && before.SequenceEqual(await Counts()), message);
}

try
{
    await using (var db = Context())
    {
        // Exercise the actual pending migration only in this new isolated schema.
        await db.GetService<IMigrator>().MigrateAsync("20261107002822_AddGradeClassification");
        await db.Database.ExecuteSqlRawAsync("INSERT INTO users (user_code, full_name, password_hash, status, created_at, specialty) VALUES ('LEGACY_MIGRATION', 'Synthetic Legacy', 'test', 'active', UTC_TIMESTAMP(), 'Class 7')");
        await db.Database.ExecuteSqlRawAsync("INSERT INTO subjects (subject_id, subject_code, subject_name) VALUES (999, 'LEGACY_TEST', 'Synthetic pre-migration subject')");
        await db.Database.ExecuteSqlRawAsync("INSERT INTO classes (class_id, class_name, subject_id, grade_id, tuition_fee, start_date, status) VALUES (999, 'Synthetic pre-migration class', 999, 7, 120000, '2025-08-01', 'completed')");
        await db.Database.ExecuteSqlRawAsync("INSERT INTO student_classes (student_id, class_id, enrolled_date, status, dropped_at, drop_reason) SELECT user_id, 999, '2025-08-01', 'dropped', '2025-09-01', 'Preserve historical data' FROM users WHERE user_code='LEGACY_MIGRATION'");
        var beforeMigration = await DatabaseFingerprint(connection.ConnectionString, excludeProfileGrade: true);
        await db.GetService<IMigrator>().MigrateAsync();
        Check(!db.Database.HasPendingModelChanges(), "Reviewed migration target matches the actual EF model/snapshot");
        Check(await DatabaseFingerprint(connection.ConnectionString, excludeProfileGrade: true) == beforeMigration,
            "Migration preserves all original table values, including legacy profile and enrollment history");
        var legacyMigration = await db.Users.AsNoTracking().SingleAsync(u => u.UserCode == "LEGACY_MIGRATION");
        Check(legacyMigration.GradeId == null && legacyMigration.Specialty == "Class 7", "Actual Grade migration preserves legacy specialty without backfill");
        var schemaRestored = false;
        // A Down/Up rehearsal is safe here because no Student has a Grade assigned yet.
        await db.GetService<IMigrator>().MigrateAsync("20261107002822_AddGradeClassification");
        await using (var verify = new MySqlConnection(connection.ConnectionString))
        {
            await verify.OpenAsync();
            await using var command = verify.CreateCommand();
            command.CommandText = "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME='grade_id'";
            schemaRestored = Convert.ToInt32(await command.ExecuteScalarAsync()) == 0;
        }
        await db.GetService<IMigrator>().MigrateAsync();
        var afterReapply = await db.Users.AsNoTracking().SingleAsync(u => u.UserCode == "LEGACY_MIGRATION");
        Check(schemaRestored && afterReapply.GradeId == null && afterReapply.Specialty == legacyMigration.Specialty
            && afterReapply.FullName == legacyMigration.FullName && afterReapply.UserCode == legacyMigration.UserCode,
            "Down/Up on unassigned test profiles preserves existing data and recreates the minimal schema");
        Check(await DatabaseFingerprint(connection.ConnectionString, excludeProfileGrade: true) == beforeMigration,
            "Empty-Grade Down/Up rehearsal preserves fingerprints of all original table data");
        await db.Users.Where(u => u.UserCode == "LEGACY_MIGRATION").ExecuteDeleteAsync();
        await db.Classes.Where(c => c.ClassId == 999).ExecuteDeleteAsync();
        await db.Subjects.Where(s => s.SubjectId == 999).ExecuteDeleteAsync();
        db.Roles.Add(new Role { RoleId = 1, RoleName = "student" });
        db.Subjects.Add(new Subject { SubjectId = 1, SubjectCode = "TEST", SubjectName = "Synthetic Subject" });
        db.Classes.AddRange(
            new Class { ClassId = 1, ClassName = "7 Active", GradeId = 7, SubjectId = 1, Status = "active", StartDate = DateTime.UtcNow },
            new Class { ClassId = 2, ClassName = "7 Upcoming", GradeId = 7, SubjectId = 1, Status = "upcoming", StartDate = DateTime.UtcNow },
            new Class { ClassId = 3, ClassName = "8 Active", GradeId = 8, SubjectId = 1, Status = "active", StartDate = DateTime.UtcNow },
            new Class { ClassId = 4, ClassName = "7 Completed", GradeId = 7, SubjectId = 1, Status = "completed", StartDate = DateTime.UtcNow });
        await db.SaveChangesAsync();
    }
    await Save("STU_NONE", null);
    Check((await Counts()).SequenceEqual(new[] { 1, 1, 0, 0, 0 }), "Create profile without enrollment/invoice/payment");
    await Save("STU_ONE", 7, 1);
    var multiple = await Save("STU_MULTI", 7, 1, 2, 1);
    Check((await Counts()).SequenceEqual(new[] { 3, 3, 3, 0, 0 }), "Multi-class graph persisted; repeated class ID does not duplicate");
    var replay = await Save("STU_MULTI", 7, 2, 1, 2);
    Check(replay.UserId == multiple.UserId && (await Counts())[0] == 3 && (await Counts())[2] == 3, "Retry after lost response returns same student and enrollment set");
    await Fail(() => Save("STU_MULTI", 7, 1), "Changed replay cannot create or enroll anything");
    await using (var db = Context())
    {
        var controller = new UsersController(userManagementService: new ManagementUserService(new UserRepository(db), new ParentStudentRepository(db)));
        var dto = new CreateStudentDto { UserCode = "STU_MULTI", FullName = "Synthetic Student", Role = "student", Gender = "male", Specialty = "Class 7", GradeId = 7, ClassIds = new() { 1, 2 } };
        var success = (await controller.CreateStudent(dto)).Result as CreatedResult;
        Check(success?.StatusCode == 201, "Controller confirms atomic replay with 201");
        dto.ClassIds = new() { 1 };
        var conflict = (await controller.CreateStudent(dto)).Result as ConflictObjectResult;
        var payload = JsonSerializer.Serialize(conflict?.Value);
        Check(conflict?.StatusCode == 409 && payload.Contains("student_creation_conflict") && payload.Contains($"\"existingStudentId\":{multiple.UserId}"), "Controller exposes confirmed saved student for changed-request recovery");
        dto.UserCode = "STU_APIINVALID";
        dto.ClassIds = new() { 999 };
        var invalid = (await controller.CreateStudent(dto)).Result as BadRequestObjectResult;
        Check(invalid?.StatusCode == 400 && (await Counts())[0] == 3, "Controller returns class validation error without student success");
    }
    await Fail(() => Save("STU_BADGRADE", 7, 3), "Cross-grade class rejected atomically");
    await Fail(() => Save("STU_MISSING", 7, 999), "Missing class rejected atomically");
    await Fail(() => Save("STU_CLOSED", 7, 4), "Closed class rejected atomically");
    await Fail(() => Save("STU_NOGRADE", null, 1), "Enrollment without grade rejected atomically");
    await Fail(() => Save("STU_INVALIDGRADE", 999), "Nonexistent grade rejected even without classes");

    // Fail after the first actual INSERT has reached MySQL, proving rollback
    // of the user even when the error happens while persisting the graph.
    var injected = new FailEnrollmentInsert();
    await Fail(async () =>
    {
        var failing = new DbContextOptionsBuilder<EduTrackDbContext>()
            .UseMySql(connection.ConnectionString, new MySqlServerVersion(new Version(8, 0, 0)), my => my.MaxBatchSize(1))
            .AddInterceptors(injected).Options;
        await using var db = new EduTrackDbContext(failing);
        await new UserRepository(db).CreateStudentWithClassesAsync(Student("STU_ROLLBACK"), 7, new[] { 1, 2 });
    }, "Injected enrollment SQL failure rolls back user, role and all classes");
    Check(injected.UserInserted && injected.EnrollmentAttempted, "Failure injection occurred after user INSERT and during enrollment INSERT");
    var recovered = await Save("STU_ROLLBACK", 7, 1, 2);
    Check(recovered.UserId > 0 && (await Counts()).SequenceEqual(new[] { 4, 4, 5, 0, 0 }), "Same attempt succeeds safely after rollback");

    // Requests can race on the unique user_code. A deadlock/unique-key loser
    // may retry; it must never create a second student or duplicate relation.
    await Task.WhenAll(Enumerable.Range(0, 2).Select(async _ => { try { await Save("STU_RACE", 7, 1, 2); } catch (Exception) { } }));
    var race = await Save("STU_RACE", 7, 1, 2);
    Check(race.UserId > 0 && (await Counts()).SequenceEqual(new[] { 5, 5, 7, 0, 0 }), "Concurrent submissions followed by retry save exactly one student");
    await using (var db = Context())
    {
        Check(await db.StudentClasses.AllAsync(sc => sc.Status == "active" && sc.EnrolledDate != null), "Enrollment has active status and enrollment date");
    }

    // Profile Grade is persisted independently of enrollment and legacy specialty.
    var noClass = await Save("STU_DYNAMIC", 7);
    async Task<User?> EditGrade(int studentId, int? grade, bool specified = true)
    {
        await using var db = Context();
        return await new UserRepository(db).UpdateUserWithRoleAsync(studentId,
            new User { FullName = "Edited Student", Gender = "male", Specialty = "Must not replace old text", Status = "active", GradeId = grade }, "student", specified);
    }
    await EditGrade(noClass.UserId, 8);
    await using (var db = Context())
    {
        var refreshed = await new UserService(new UserRepository(db)).GetUserByIdAsync(noClass.UserId);
        Check(refreshed?.GradeId == 8 && refreshed.GradeName == "Khối 8" && refreshed.Specialty == "Class 7", "Edit and fresh read persist real Grade ID and preserve legacy text");
        await new GradeRepository(db).RenameAsync(8, "Renamed Grade Eight");
    }
    await using (var db = Context())
    {
        var renamed = await new UserService(new UserRepository(db)).GetUserByIdAsync(noClass.UserId);
        Check(renamed?.GradeName == "Renamed Grade Eight", "Grade rename reflected by fresh User DTO join");
        var custom = await new GradeRepository(db).CreateAsync("Synthetic Custom Grade");
        await EditGrade(noClass.UserId, custom.GradeId);
        var current = await new UserService(new UserRepository(db)).GetUserByIdAsync(noClass.UserId);
        Check(current?.GradeId == custom.GradeId && current.GradeName == custom.GradeName, "Student can persist a newly created custom Grade");
        var prevented = false;
        try { await new GradeRepository(db).DeleteAsync(custom.GradeId); } catch (InvalidOperationException) { prevented = true; }
        Check(prevented, "Grade deletion blocked when referenced only by a Student profile");
    }
    await EditGrade(noClass.UserId, null, specified: false);
    await using (var db = Context())
        Check((await db.Users.FindAsync(noClass.UserId))?.GradeId != null, "Older update callers omitting gradeId cannot erase the saved Grade");
    var beforeEnrollment = await EnrollmentSnapshot();
    await EditGrade(multiple.UserId, 8);
    await using (var db = Context())
        Check((await db.Users.FindAsync(multiple.UserId))?.GradeId == 8 && beforeEnrollment == await EnrollmentSnapshot(),
            "Current school Grade can differ from active center classes without changing enrollment");
    await using (var db = Context())
    {
        db.StudentClasses.AddRange(
            new StudentClass { StudentId = multiple.UserId, ClassId = 3, Status = "dropped", EnrolledDate = new DateTime(2025, 8, 1), DroppedAt = new DateTime(2025, 9, 1), DropReason = "Historical transfer" },
            new StudentClass { StudentId = multiple.UserId, ClassId = 4, Status = "completed", EnrolledDate = new DateTime(2024, 8, 1) });
        await db.SaveChangesAsync();
    }
    beforeEnrollment = await EnrollmentSnapshot();
    await EditGrade(multiple.UserId, 9);
    Check(beforeEnrollment == await EnrollmentSnapshot(), "School Grade change preserves every enrollment field across active/dropped/completed history");
    await using (var db = Context())
    {
        var controller = new UsersController(userManagementService: new ManagementUserService(new UserRepository(db), new ParentStudentRepository(db)));
        var response = (await controller.Update(multiple.UserId, new UpdateUserDto { FullName = "Edited Student", Role = "student", GradeId = 8 })).Result as OkObjectResult;
        Check(response is { StatusCode: 200, Value: EduTrack.API.Models.DTOs.UserDto { GradeId: 8 } }
            && beforeEnrollment == await EnrollmentSnapshot(), "PUT User confirms school Grade update while preserving unrelated enrollment history");
    }
    await EditGrade(multiple.UserId, null);
    Check(beforeEnrollment == await EnrollmentSnapshot(), "Clearing an optional school Grade does not erase enrollment or history");
    await EditGrade(multiple.UserId, 7);
    Check(beforeEnrollment == await EnrollmentSnapshot(), "Saving another valid school Grade leaves all enrollments intact");
    await Fail(() => EditGrade(noClass.UserId, 999), "Unknown Grade cannot replace the saved Grade");

    // Parent/student linking: no defaults can bypass real IDs and roles.
    User parent;
    await using (var db = Context())
    {
        db.Roles.Add(new Role { RoleId = 2, RoleName = "parent" });
        await db.SaveChangesAsync();
        parent = await new UserRepository(db).CreateUserWithRoleAsync(new User { UserCode = "PAR_TEST", FullName = "Synthetic Parent", PasswordHash = "test", Status = "active" }, "parent");
    }
    async Task<ParentStudent> Link(int parentId, int studentId, string relationship = "Mother", bool update = false)
    {
        await using var db = Context();
        return await new ParentStudentRepository(db).AssignAsync(new ParentStudent { ParentId = parentId, StudentId = studentId, Relationship = relationship, IsPrimaryContact = false }, update);
    }
    async Task RejectLink(Func<Task> action, string label)
    {
        await using var db = Context();
        var count = await db.ParentStudents.CountAsync();
        var failed = false;
        try { await action(); } catch (ArgumentException) { failed = true; } catch (InvalidOperationException) { failed = true; }
        Check(failed && count == await db.ParentStudents.CountAsync(), label);
    }
    await RejectLink(() => Link(0, multiple.UserId), "Missing parent cannot create link");
    await RejectLink(() => Link(parent.UserId, 0), "Missing student cannot create link");
    await RejectLink(() => Link(multiple.UserId, parent.UserId), "Wrong parent/student roles rejected");
    await Link(parent.UserId, multiple.UserId, "Father");
    await RejectLink(() => Link(parent.UserId, multiple.UserId), "Duplicate creation cannot overwrite saved Father with default Mother");
    await using (var db = Context())
        Check((await db.ParentStudents.SingleAsync()).Relationship == "Father", "Existing link retains actual relationship");
    await using (var db = Context())
    {
        var unchanged = await new ManagementUserService(new UserRepository(db), new ParentStudentRepository(db))
            .AssignParentStudentAsync(new AssignParentStudentDto { ParentId = parent.UserId, StudentId = multiple.UserId, UpdateExisting = true });
        Check(unchanged.Relationship == "Father" && !unchanged.IsPrimaryContact, "Default values omitted during edit cannot overwrite saved relationship/contact flag");
    }
    var editedLink = await Link(parent.UserId, multiple.UserId, "Guardian", update: true);
    Check(editedLink.Relationship == "Guardian", "Explicit update preserves existing link functionality");
    var defaultLink = await Link(parent.UserId, noClass.UserId);
    Check(defaultLink.Relationship == "Mother", "New link defaults to Mother only");
    Check(new AssignParentStudentDto().Relationship == "Mother", "DTO default relationship is Mother");
    await using (var db = Context())
    {
        var legacyProfile = await db.Users.AsNoTracking().SingleAsync(u => u.UserCode == "STU_NONE");
        await EditGrade(legacyProfile.UserId, 7);
        var linked = await new UserService(new UserRepository(db)).GetUserByIdAsync(legacyProfile.UserId);
        Check(linked?.GradeId == 7 && linked.Specialty == "Class 7", "Legacy unlinked profile can explicitly select a real Grade without losing specialty");
        var enrolledLegacy = await db.Users.SingleAsync(u => u.UserCode == "STU_ONE");
        enrolledLegacy.GradeId = null;
        await db.SaveChangesAsync();
        var before = await EnrollmentSnapshot();
        await EditGrade(enrolledLegacy.UserId, 9);
        Check(await EnrollmentSnapshot() == before, "Legacy profile can select a school Grade independently of its previous center classes");
    }

    // Rehearse a full backup/restore with populated profile grades on this test
    // instance only. Never call Down after assigned grades without preserving them.
    var backupRoot = Path.Combine(Path.GetTempPath(), "edutrack-grade-backup-test-" + Guid.NewGuid().ToString("N"));
    Directory.CreateDirectory(backupRoot);
    var dumpPath = Path.Combine(backupRoot, "synthetic.sql");
    var restoreConnection = new MySqlConnectionStringBuilder(connection.ConnectionString) { Database = "edutrack_restore_test_" + Guid.NewGuid().ToString("N") };
    await NativeTestTool("mysqldump.exe", new[] { "--single-transaction", "--set-gtid-purged=OFF", "--no-tablespaces", "--routines", "--events", "--triggers", "--hex-blob", "--result-file=" + dumpPath, connection.Database });
    Check(new FileInfo(dumpPath).Length > 0, "Synthetic logical backup created with native mysqldump");
    await using (var admin = new MySqlConnection(connection.ConnectionString))
    {
        await admin.OpenAsync();
        await using var create = admin.CreateCommand();
        create.CommandText = $"CREATE DATABASE `{restoreConnection.Database}` CHARACTER SET utf8mb4";
        await create.ExecuteNonQueryAsync();
    }
    try
    {
        await NativeTestTool("mysql.exe", new[] { "--database=" + restoreConnection.Database }, await File.ReadAllTextAsync(dumpPath));
        Check(await DatabaseFingerprint(connection.ConnectionString) == await DatabaseFingerprint(restoreConnection.ConnectionString),
            "Restored synthetic backup preserves all data including assigned Student Grade IDs and enrollment history");
        await using var restored = new EduTrackDbContext(new DbContextOptionsBuilder<EduTrackDbContext>()
            .UseMySql(restoreConnection.ConnectionString, new MySqlServerVersion(new Version(8, 0, 0))).Options);
        Check(!(await restored.Database.GetPendingMigrationsAsync()).Any(), "Restored backup preserves migration history");
    }
    finally
    {
        await using var restored = new EduTrackDbContext(new DbContextOptionsBuilder<EduTrackDbContext>()
            .UseMySql(restoreConnection.ConnectionString, new MySqlServerVersion(new Version(8, 0, 0))).Options);
        await restored.Database.EnsureDeletedAsync();
    }
    Console.WriteLine("Synthetic backup restore evidence: " + backupRoot);
    if (args.Contains("--http"))
        await HttpStudentManagementChecks.Run(connection.ConnectionString, options, Check);
    Console.WriteLine($"{checks} assertions passed against isolated synthetic MySQL database {connection.Database}; no main database access.");
}
finally
{
    await using var cleanup = Context();
    await cleanup.Database.EnsureDeletedAsync();
}

sealed class FailEnrollmentInsert : DbCommandInterceptor
{
    public bool UserInserted { get; private set; }
    public bool EnrollmentAttempted { get; private set; }

    public override ValueTask<System.Data.Common.DbDataReader> ReaderExecutedAsync(
        System.Data.Common.DbCommand command, CommandExecutedEventData eventData,
        System.Data.Common.DbDataReader result, CancellationToken cancellationToken = default)
    {
        if (command.CommandText.Contains("INSERT INTO `users`", StringComparison.OrdinalIgnoreCase)) UserInserted = true;
        return base.ReaderExecutedAsync(command, eventData, result, cancellationToken);
    }

    public override ValueTask<InterceptionResult<System.Data.Common.DbDataReader>> ReaderExecutingAsync(
        System.Data.Common.DbCommand command, CommandEventData eventData,
        InterceptionResult<System.Data.Common.DbDataReader> result, CancellationToken cancellationToken = default)
    {
        if (command.CommandText.Contains("INSERT INTO `student_classes`", StringComparison.OrdinalIgnoreCase))
        {
            EnrollmentAttempted = true;
            throw new InvalidOperationException("Injected enrollment storage failure");
        }
        return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
    }
}
