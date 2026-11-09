using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Implementation;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using MySqlConnector;

static class EditStudentEnrollmentChecks
{
    public static async Task Run(HttpClient http, DbContextOptions<EduTrackDbContext> options, string connectionString, Action<bool, string> check)
    {
        var target = new MySqlConnectionStringBuilder(connectionString);
        if (target.Port != 33308 || target.Server != "127.0.0.1" || !target.Database.StartsWith("edutrack_enrollment_test_"))
            throw new Exception("Edit enrollment test isolation guard failed");
        async Task<JsonNode> Call(HttpMethod method, string route, object? body, HttpStatusCode code = HttpStatusCode.OK)
        {
            using var req = new HttpRequestMessage(method, "/api/" + route);
            if (body != null) req.Content = JsonContent.Create(body);
            using var response = await http.SendAsync(req);
            var data = await response.Content.ReadAsStringAsync();
            if (response.StatusCode != code) throw new Exception($"Edit enrollment {method} {route}: {(int)response.StatusCode} instead of {(int)code}: {data}");
            return JsonNode.Parse(data)!;
        }
        async Task<JsonNode> History(int id) => await Call(HttpMethod.Get, "studentclasses?studentId=" + id, null);
        async Task<int> Create(string name, int gradeId)
        {
            var created = await Call(HttpMethod.Post, "users/students", new { userCode = "EDIT" + Guid.NewGuid().ToString("N")[..12], fullName = name, role = "student", gradeId, classIds = Array.Empty<int>() }, HttpStatusCode.Created);
            return created["userId"]!.GetValue<int>();
        }
        var student = await Create("Enrollment Editor", 7);
        check((await History(student)).AsArray().Count == 0, "Scoped StudentClass GET starts empty for this Student only");
        var rows = await Call(HttpMethod.Post, $"users/{student}/enrollments", new { gradeId = 7, classIds = new[] { 1, 2, 1 } });
        check(rows.AsArray().Count == 2, "Edit registers multiple Classes atomically and deduplicates repeated IDs");
        var original = rows.ToJsonString();
        check((await Call(HttpMethod.Post, $"users/{student}/enrollments", new { gradeId = 7, classIds = new[] { 2, 1 } })).ToJsonString() == original,
            "Lost-response enrollment retry preserves ScId/status/date and does not duplicate");
        foreach (var id in new[] { 3, 4, 9999 })
        {
            await Call(HttpMethod.Post, $"users/{student}/enrollments", new { gradeId = 7, classIds = new[] { id } }, HttpStatusCode.BadRequest);
            check((await History(student)).ToJsonString() == original, "Wrong Grade/closed/missing Class cannot alter enrollment: " + id);
        }
        await Call(HttpMethod.Post, $"users/{student}/enrollments", new { gradeId = 8, classIds = new[] { 3 } }, HttpStatusCode.Conflict);
        check((await History(student)).ToJsonString() == original, "Stale/unsaved profile Grade rejected without modifying history");
        await Call(HttpMethod.Post, $"users/{student}/enrollments", new { gradeId = 7, classIds = Array.Empty<int>() }, HttpStatusCode.BadRequest);
        await Call(HttpMethod.Post, "users/999999/enrollments", new { gradeId = 7, classIds = new[] { 1 } }, HttpStatusCode.NotFound);
        await Call(HttpMethod.Get, "studentclasses?studentId=0", null, HttpStatusCode.BadRequest);
        check(true, "Empty selection, unknown Student and invalid scoped query have explicit HTTP validation");

        var active = rows.AsArray().Single(r => r!["classId"]!.GetValue<int>() == 1)!;
        var completed = rows.AsArray().Single(r => r!["classId"]!.GetValue<int>() == 2)!;
        var activeId = active["scId"]!.GetValue<int>();
        var completedId = completed["scId"]!.GetValue<int>();
        await using (var db = new EduTrackDbContext(options))
        {
            (await db.StudentClasses.FindAsync(completedId))!.Status = "completed";
            (await db.StudentClasses.FindAsync(activeId))!.Status = " Active "; // Retained legacy spelling, not normalized by a read/retry.
            await db.SaveChangesAsync();
        }
        var legacyRetry = await Call(HttpMethod.Post, $"users/{student}/enrollments", new { gradeId = 7, classIds = new[] { 1 } });
        check(legacyRetry.AsArray().Single(r => r!["scId"]!.GetValue<int>() == activeId)!["status"]!.GetValue<string>() == " Active ", "Active legacy status can be replayed without rewriting its stored value");
        var other = await Create("Other Enrollment Owner", 7);
        await Call(HttpMethod.Patch, $"users/{other}/enrollments/{activeId}/drop", new { reason = "wrong owner" }, HttpStatusCode.NotFound);
        await Call(HttpMethod.Patch, $"users/{student}/enrollments/{completedId}/drop", new { reason = "completed" }, HttpStatusCode.Conflict);
        check((await History(student)).AsArray().Single(r => r!["scId"]!.GetValue<int>() == completedId)!["status"]!.GetValue<string>() == "completed", "Cannot drop another Student's relation or completed history");
        var dropped = (await Call(HttpMethod.Patch, $"users/{student}/enrollments/{activeId}/drop", new { reason = "Chủ động ngừng học" })).AsArray().Single(r => r!["scId"]!.GetValue<int>() == activeId)!;
        check(dropped["status"]!.GetValue<string>() == "dropped" && dropped["droppedAt"] != null
            && dropped["dropReason"]!.GetValue<string>() == "Chủ động ngừng học"
            && JsonNode.DeepEquals(dropped["enrolledDate"], active["enrolledDate"]), "Explicit drop preserves original relation/date and records status/time/reason");
        var repeated = (await Call(HttpMethod.Patch, $"users/{student}/enrollments/{activeId}/drop", new { reason = "Retry must not rewrite" })).AsArray().Single(r => r!["scId"]!.GetValue<int>() == activeId)!;
        check(JsonNode.DeepEquals(dropped, repeated), "Drop retry preserves first drop timestamp/reason");
        var history = (await History(student)).ToJsonString();
        await Call(HttpMethod.Put, "users/" + student, new { fullName = "Enrollment Editor", role = "student", gradeId = 8 });
        check((await History(student)).ToJsonString() == history, "Changing school Grade preserves completed and dropped history of another Grade");
        await Call(HttpMethod.Post, $"users/{student}/enrollments", new { gradeId = 8, classIds = new[] { 1, 3 } }, HttpStatusCode.Conflict);
        check((await History(student)).ToJsonString() == history, "Historical duplicate rejects entire batch including an otherwise eligible new Class");
        var withNewGrade = await Call(HttpMethod.Post, $"users/{student}/enrollments", new { gradeId = 8, classIds = new[] { 3 } });
        check(withNewGrade.AsArray().Count == 3 && withNewGrade.AsArray().Any(r => r!["classId"]!.GetValue<int>() == 1 && r["status"]!.GetValue<string>() == "dropped")
            && withNewGrade.AsArray().Any(r => r!["classId"]!.GetValue<int>() == 2 && r["status"]!.GetValue<string>() == "completed"), "Add after Grade change keeps all cross-Grade enrollment history visible");

        await using (var db = new EduTrackDbContext(options))
        {
            db.Grades.Add(new Grade { GradeId = 6000, GradeName = "Enrollment transaction test" });
            db.Classes.AddRange(new Class { ClassId = 6001, ClassName = "Transaction A", GradeId = 6000, SubjectId = 1, Status = "active", StartDate = DateTime.UtcNow },
                new Class { ClassId = 6002, ClassName = "Transaction B", GradeId = 6000, SubjectId = 1, Status = "upcoming", StartDate = DateTime.UtcNow });
            await db.SaveChangesAsync();
        }
        var atomic = await Create("Enrollment rollback", 6000);
        var injection = new FailSecondEnrollment();
        var failedOptions = new DbContextOptionsBuilder<EduTrackDbContext>()
            .UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 0)), mysql => mysql.MaxBatchSize(1)).AddInterceptors(injection).Options;
        var failed = false;
        try { await using var db = new EduTrackDbContext(failedOptions); await new StudentClassRepository(db).EnrollAsync(atomic, 6000, new[] { 6001, 6002 }); }
        catch (Exception ex) when (ex is InvalidOperationException { Message: "Test-only second enrollment INSERT failure" }
            || ex is DbUpdateException { InnerException: InvalidOperationException { Message: "Test-only second enrollment INSERT failure" } }) { failed = true; }
        check(failed && injection.Inserted == 1 && (await History(atomic)).AsArray().Count == 0, "Actual second-enrollment INSERT failure rolls back the first new row");
        async Task<HttpStatusCode> Race()
        {
            using var response = await http.PostAsJsonAsync($"/api/users/{atomic}/enrollments", new { gradeId = 6000, classIds = new[] { 6001 } });
            return response.StatusCode;
        }
        var race = await Task.WhenAll(Race(), Race());
        check(race.All(s => s is HttpStatusCode.OK or HttpStatusCode.Conflict), "Concurrent enrollment produces success or recoverable conflict, never uncontrolled storage error");
        await Call(HttpMethod.Post, $"users/{atomic}/enrollments", new { gradeId = 6000, classIds = new[] { 6001 } });
        check((await History(atomic)).AsArray().Count == 1, "Concurrent/retried enrollment retains one Student-Class row");
        await using (var db = new EduTrackDbContext(options))
            check(await db.TuitionInvoices.CountAsync() == 0 && await db.Payments.CountAsync() == 0, "Edit enrollment commands do not create Invoice or Payment");
    }

    private sealed class FailSecondEnrollment : DbCommandInterceptor
    {
        public int Inserted { get; private set; }
        public override ValueTask<System.Data.Common.DbDataReader> ReaderExecutedAsync(System.Data.Common.DbCommand command, CommandExecutedEventData eventData, System.Data.Common.DbDataReader result, CancellationToken cancellationToken = default)
        {
            if (command.CommandText.Contains("INSERT INTO `student_classes`", StringComparison.OrdinalIgnoreCase)) Inserted++;
            return base.ReaderExecutedAsync(command, eventData, result, cancellationToken);
        }
        public override ValueTask<InterceptionResult<System.Data.Common.DbDataReader>> ReaderExecutingAsync(System.Data.Common.DbCommand command, CommandEventData eventData, InterceptionResult<System.Data.Common.DbDataReader> result, CancellationToken cancellationToken = default)
        {
            if (Inserted == 1 && command.CommandText.Contains("INSERT INTO `student_classes`", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Test-only second enrollment INSERT failure");
            return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
        }
    }
}
