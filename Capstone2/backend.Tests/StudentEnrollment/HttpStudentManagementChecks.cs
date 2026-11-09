using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Net.Sockets;
using System.Text.Json;
using System.Text.Json.Nodes;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

static class HttpStudentManagementChecks
{
    public static async Task Run(string connectionString, DbContextOptions<EduTrackDbContext> options, Action<bool, string> check)
    {
        var config = new MySqlConnectionStringBuilder(connectionString);
        if (config.Server != "127.0.0.1" || config.Port != 33308 || !config.Database.StartsWith("edutrack_enrollment_test_", StringComparison.Ordinal))
            throw new Exception("HTTP test isolation guard rejected connection");
        await using (var probe = new MySqlConnection(connectionString))
        {
            await probe.OpenAsync();
            await using var cmd = new MySqlCommand("SELECT @@datadir", probe);
            if (!(await cmd.ExecuteScalarAsync())!.ToString()!.Replace('\\', '/').Contains("/edutrack-enrollment-mysql-"))
                throw new Exception("HTTP tests require independently initialized MySQL data directory");
        }
        await using (var db = new EduTrackDbContext(options))
        {
            var grade8 = await db.Grades.SingleAsync(g => g.GradeId == 8);
            grade8.GradeName = "Khối 8";
            db.Grades.Add(new Grade { GradeId = 7000, GradeName = "HTTP E2E ISOLATED ONLY" });
            db.Roles.AddRange(new Role { RoleId = 3, RoleName = "center_manager" }, new Role { RoleId = 4, RoleName = "admin_staff" });
            db.Users.Add(new User { UserId = 1, UserCode = "HTTP_STAFF", FullName = "Synthetic HTTP Staff", PasswordHash = "test-only", Status = "active",
                UserRoles = new List<UserRole> { new() { RoleId = 3 }, new() { RoleId = 4 } } });
            await db.SaveChangesAsync();
        }
        // Bind an ephemeral loopback port; never reuse development's 5036.
        var listener = new TcpListener(IPAddress.Loopback, 0); listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port; listener.Stop();
        if (port == 5036) throw new Exception("Development API port rejected");
        var origin = "http://127.0.0.1:" + port;
        var root = Path.Combine(Path.GetTempPath(), "edutrack-http-e2e-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);
        var host = new ProcessStartInfo(Environment.ProcessPath!)
        {
            UseShellExecute = false, CreateNoWindow = true, WorkingDirectory = root,
            RedirectStandardOutput = true, RedirectStandardError = true
        };
        foreach (var arg in new[] { Path.Combine(AppContext.BaseDirectory, "EduTrack.API.dll"), "--urls", origin,
            "--contentRoot", root, "--Seeding:SkipSampleData=true", "--environment", "Development" }) host.ArgumentList.Add(arg);
        // Configuration is supplied only to this child. Its empty content root has
        // no application settings or development credentials to fall back to.
        host.Environment["ConnectionStrings__DefaultConnection"] = connectionString;
        using var process = Process.Start(host) ?? throw new Exception("HTTP test API did not start");
        var stdout = process.StandardOutput.ReadToEndAsync(); var stderr = process.StandardError.ReadToEndAsync();
        using var http = new HttpClient { BaseAddress = new Uri(origin), Timeout = TimeSpan.FromSeconds(15) };
        async Task<JsonNode> Send(HttpMethod method, string path, object? body, HttpStatusCode expected)
        {
            using var request = new HttpRequestMessage(method, "/api/" + path);
            if (body != null) request.Content = JsonContent.Create(body);
            using var response = await http.SendAsync(request);
            var payload = await response.Content.ReadAsStringAsync();
            if (response.StatusCode != expected) throw new Exception($"HTTP {method} {path}: expected {(int)expected}, got {(int)response.StatusCode}: {payload}");
            return JsonNode.Parse(payload)!;
        }
        try
        {
            var ready = false;
            for (var i = 0; i < 80; i++)
            {
                if (process.HasExited) throw new Exception("HTTP API exited: " + await stderr);
                try { using var response = await http.GetAsync("/api/grades"); if (response.IsSuccessStatusCode) { ready = true; break; } }
                catch (HttpRequestException) { }
                await Task.Delay(100);
            }
            check(ready, "Real HTTP test API starts against isolated MySQL with sample seeding disabled");
            var code = "HTTP" + Guid.NewGuid().ToString("N")[..12];
            var request = new { userCode = code, fullName = "HTTP Atomic Student", role = "student", gender = "male", gradeId = 7, classIds = new[] { 1, 2, 1 } };
            var created = await Send(HttpMethod.Post, "users/students", request, HttpStatusCode.Created);
            var id = created["userId"]!.GetValue<int>();
            var replay = await Send(HttpMethod.Post, "users/students", request, HttpStatusCode.Created);
            check(replay["userId"]!.GetValue<int>() == id, "HTTP atomic retry returns same Student ID");
            await using (var db = new EduTrackDbContext(options))
                check(await db.StudentClasses.CountAsync(s => s.StudentId == id) == 2, "HTTP repeated class IDs persist exactly two student_classes");
            var conflict = await Send(HttpMethod.Post, "users/students", request with { }, HttpStatusCode.Created);
            check(conflict["userId"]!.GetValue<int>() == id, "Repeated HTTP request cannot duplicate profile");
            var changed = await Send(HttpMethod.Post, "users/students", new { userCode = code, fullName = "Changed request", role = "student", gradeId = 7, classIds = new[] { 1 } }, HttpStatusCode.Conflict);
            check(changed["code"]!.GetValue<string>() == "student_creation_conflict", "HTTP changed replay exposes recoverable conflict code");
            string before;
            await using (var db = new EduTrackDbContext(options)) before = JsonSerializer.Serialize(await db.StudentClasses.AsNoTracking().OrderBy(s => s.ScId).ToListAsync());
            await Send(HttpMethod.Put, "users/" + id, new { fullName = "HTTP Atomic Student", role = "student", gender = "male", status = "active", gradeId = 8 }, HttpStatusCode.OK);
            var refreshed = await Send(HttpMethod.Get, "users/" + id, null, HttpStatusCode.OK);
            await using (var db = new EduTrackDbContext(options))
                check(refreshed["gradeId"]!.GetValue<int>() == 8 && before == JsonSerializer.Serialize(await db.StudentClasses.AsNoTracking().OrderBy(s => s.ScId).ToListAsync()), "HTTP Edit/read persists independent Grade without changing any enrollment fields");
            await Send(HttpMethod.Post, "users/students", new { userCode = "HTTP_BAD", fullName = "Invalid", role = "student", gradeId = 7, classIds = new[] { 3 } }, HttpStatusCode.BadRequest);
            await using (var db = new EduTrackDbContext(options)) check(!await db.Users.AnyAsync(u => u.UserCode == "HTTP_BAD"), "HTTP cross-grade rejection leaves no partial Student");
            var parent1 = await Send(HttpMethod.Post, "users", new { fullName = "HTTP Parent One", role = "parent", gender = "female" }, HttpStatusCode.Created);
            var parent2 = await Send(HttpMethod.Post, "users", new { fullName = "HTTP Parent Two", role = "parent", gender = "female" }, HttpStatusCode.Created);
            check(parent1["userId"]!.GetValue<int>() != parent2["userId"]!.GetValue<int>(), "Add Parent regression: consecutive creations have distinct user codes");
            var parentId = parent1["userId"]!.GetValue<int>();
            await Send(HttpMethod.Post, "parentstudents", new { parentId = 0, studentId = id }, HttpStatusCode.BadRequest);
            var link = await Send(HttpMethod.Post, "parentstudents", new { parentId, studentId = id }, HttpStatusCode.OK);
            check(link["relationship"]!.GetValue<string>() == "Mother", "HTTP new link defaults to Mother");
            await Send(HttpMethod.Post, "parentstudents", new { parentId, studentId = id, relationship = "Father", updateExisting = true, isPrimaryContact = false }, HttpStatusCode.OK);
            await Send(HttpMethod.Post, "parentstudents", new { parentId, studentId = id }, HttpStatusCode.Conflict);
            var kept = await Send(HttpMethod.Post, "parentstudents", new { parentId, studentId = id, updateExisting = true }, HttpStatusCode.OK);
            check(kept["relationship"]!.GetValue<string>() == "Father" && !kept["isPrimaryContact"]!.GetValue<bool>(), "HTTP duplicate and omitted update fields preserve saved Father/contact");
            await EditStudentEnrollmentChecks.Run(http, options, connectionString, check);

            var front = Environment.GetEnvironmentVariable("EDUTRACK_TEST_FRONTEND_ROOT");
            if (!string.IsNullOrEmpty(front))
            {
                var browser = new ProcessStartInfo("node") { UseShellExecute = false, CreateNoWindow = true, WorkingDirectory = front,
                    RedirectStandardOutput = true, RedirectStandardError = true };
                browser.ArgumentList.Add(Path.Combine(front, "tests/studentManagement.http.browser.mjs"));
                browser.Environment["EDUTRACK_TEST_API_URL"] = origin;
                browser.Environment["EDUTRACK_HTTP_E2E_TOKEN"] = "HTTP E2E ISOLATED ONLY";
                using var run = Process.Start(browser) ?? throw new Exception("Browser test did not start");
                var browserOut = run.StandardOutput.ReadToEndAsync(); var browserError = run.StandardError.ReadToEndAsync();
                await run.WaitForExitAsync();
                Console.WriteLine(await browserOut);
                var browserErrorText = await browserError;
                if (!string.IsNullOrWhiteSpace(browserErrorText)) Console.Error.WriteLine(browserErrorText);
                check(run.ExitCode == 0, "Real browser through HTTP API passes for both Student Management roles and three viewports");
            }
            await using (var db = new EduTrackDbContext(options))
                check(await db.TuitionInvoices.CountAsync() == 0 && await db.Payments.CountAsync() == 0, "HTTP/browser Student workflows never create Invoice or Payment");
            Console.WriteLine("HTTP artifacts: " + root);
        }
        finally
        {
            // Only the child test API created above is stopped; never search/kill by port.
            if (!process.HasExited) { process.Kill(entireProcessTree: true); await process.WaitForExitAsync(); }
            await File.WriteAllTextAsync(Path.Combine(root, "api.stdout.log"), await stdout);
            await File.WriteAllTextAsync(Path.Combine(root, "api.stderr.log"), await stderr);
        }
    }
}
