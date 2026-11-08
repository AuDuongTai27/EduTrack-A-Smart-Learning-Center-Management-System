using System.Data.Common;
using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Net.Sockets;
using System.Text.Json;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Implementation;
using EduTrack.API.Services.Management;
using EduTrack.API.Services.Management.Implementation;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using MySqlConnector;

var count = 0;
void Check(bool condition, string label) { if (!condition) throw new Exception("FAIL: " + label); Console.WriteLine("PASS " + label); count++; }
var role = new Role { RoleName = "student" };
var student = new User { UserRoles = new List<UserRole> { new() { Role = role } } };
var c = new Class { StartDate = new(2025, 1, 1), Status = "active" };
StudentClass Enrollment() => new() { Student = student, Class = c, Status = "active", EnrolledDate = new(2025, 1, 1) };
var start = new DateTime(2026, 11, 1); var end = new DateTime(2026, 11, 30);
Check(TuitionGenerationPolicy.Ineligible(Enrollment(), start, end) == null, "Full-period active enrollment eligible");
foreach (var value in new[] { 0m, -1m, 1.001m, 10000000000m }) Check(!TuitionGenerationPolicy.ValidAmount(value), "Invalid monetary value rejected: " + value);
foreach (var status in new[] { "unknown", "legacy", "" }) { var row = Enrollment(); row.Status = status; Check(TuitionGenerationPolicy.Ineligible(row, start, end) != null, "Unknown enrollment blocked: " + status); }
var missing = Enrollment(); missing.EnrolledDate = null; Check(TuitionGenerationPolicy.Ineligible(missing, start, end) != null, "Missing enrollment date excluded");
var partial = Enrollment(); partial.EnrolledDate = new(2026, 11, 15); Check(TuitionGenerationPolicy.Ineligible(partial, start, end) != null, "Mid-month enrollment requires a separate documented agreement");
var dropped = Enrollment(); dropped.Status = "dropped"; Check(TuitionGenerationPolicy.Ineligible(dropped, start, end) != null, "Dropped missing date excluded");
dropped.DroppedAt = new(2026, 10, 1); Check(TuitionGenerationPolicy.Ineligible(dropped, start, end) != null, "Dropped before month excluded");
dropped.DroppedAt = new(2026, 12, 2); Check(TuitionGenerationPolicy.Ineligible(dropped, start, end) == null, "Historical full-period proof retained after drop");
var completed = Enrollment(); completed.Status = "completed"; Check(TuitionGenerationPolicy.Ineligible(completed, start, end) != null, "Completed missing end date excluded");
c.EndDate = new(2026, 11, 30); Check(TuitionGenerationPolicy.Ineligible(completed, start, end) == null, "Completed historical period with proof eligible"); c.EndDate = null;
Check(TuitionPolicy.DueDateForCreation(new DateTimeOffset(2028, 1, 31, 12, 0, 0, TimeSpan.Zero)) == new DateTime(2028, 2, 29), "Fallback calendar month leap-year clamp preserved");
var boundary = Enrollment(); boundary.EnrolledDate = new(2026, 10, 31, 18, 0, 0); Check(TuitionGenerationPolicy.Ineligible(boundary, start, end) == null, "Vietnam first-day enrollment is eligible without day-based proration");
boundary.EnrolledDate = new(2026, 11, 1, 18, 0, 0); Check(TuitionGenerationPolicy.Ineligible(boundary, start, end) != null, "Vietnam second-day enrollment is not silently billed full month");
if (!args.Contains("--mysql")) { Console.WriteLine($"{count} tuition generation policy assertions; no database accessed."); return; }

var cs = new MySqlConnectionStringBuilder { Server = "127.0.0.1", Port = 33308, UserID = "root", Password = "", Pooling = false, SslMode = MySqlSslMode.Disabled };
await using (var probe = new MySqlConnection(cs.ConnectionString))
{
    await probe.OpenAsync(); await using var cmd = new MySqlCommand("SELECT @@port, @@datadir", probe); await using var reader = await cmd.ExecuteReaderAsync(); await reader.ReadAsync();
    if (reader.GetInt32(0) != 33308 || !reader.GetString(1).Replace('\\', '/').Contains("/edutrack-enrollment-mysql-")) throw new Exception("Isolated MySQL identity required, no writes allowed");
}
cs.Database = "edutrack_enrollment_test_" + Guid.NewGuid().ToString("N");
var options = new DbContextOptionsBuilder<EduTrackDbContext>().UseMySql(cs.ConnectionString, new MySqlServerVersion(new Version(8, 0, 0))).Options;
EduTrackDbContext Db() => new(options);
GenerateTuitionDto Request(string mode = "grade", int month = 11, int? classId = null, int? studentId = null, decimal? amount = null) => new() { Mode = mode, GradeId = 7, ClassId = classId, StudentId = studentId, PeriodMonth = (byte)month, PeriodYear = 2026, AmountDue = amount };
async Task<GenerationPreview> Preview(GenerateTuitionDto request) { await using var db = Db(); return await new TuitionGenerationService(db).Preview(request); }
async Task<GenerationPreview> Confirm(GenerateTuitionDto request) { await using var db = Db(); return await new TuitionGenerationService(db).Confirm(request); }
async Task<int> InvoiceCount() { await using var db = Db(); return await db.TuitionInvoices.CountAsync(); }
async Task<string> EnrollmentSnapshot() { await using var db = Db(); return JsonSerializer.Serialize(await db.StudentClasses.AsNoTracking().OrderBy(e => e.ScId).Select(e => new { e.ScId, e.StudentId, e.ClassId, e.Status, e.EnrolledDate, e.DroppedAt, e.DropReason }).ToListAsync()); }
async Task Reject(Func<Task> action, string label) { var before = await InvoiceCount(); try { await action(); } catch (Exception) { Check(before == await InvoiceCount(), label); return; } throw new Exception("Expected rejection: " + label); }
Process? api = null; Task<string>? stdout = null, stderr = null;
try
{
    await using (var db = Db())
    {
        await db.Database.MigrateAsync(); Check(!db.Database.HasPendingModelChanges(), "Task04 introduces no model/schema migration");
        db.Roles.AddRange(new Role { RoleId = 1, RoleName = "student" }, new Role { RoleId = 2, RoleName = "admin_staff" }, new Role { RoleId = 3, RoleName = "center_manager" });
        db.Subjects.Add(new Subject { SubjectId = 601, SubjectCode = "T04", SubjectName = "Synthetic Tuition" });
        db.CenterSettings.Add(new CenterSetting { SettingKey = "tuition_due_day", SettingValue = "10" });
        for (var i = 1; i <= 8; i++) db.Users.Add(new User { UserId = 1000 + i, UserCode = "T04_" + i, FullName = "Tuition Student " + i, PasswordHash = "test-only", Status = "active", GradeId = 8,
            UserRoles = new List<UserRole> { new() { RoleId = i == 7 ? 2 : 1 } } });
        db.Users.Add(new User { UserId = 1, UserCode = "HTTP_STAFF", FullName = "Synthetic HTTP Staff", PasswordHash = "test-only", Status = "active", UserRoles = new List<UserRole> { new() { RoleId = 2 }, new() { RoleId = 3 } } });
        db.Grades.Add(new Grade { GradeId = 7000, GradeName = "HTTP E2E ISOLATED ONLY" });
        foreach (var (id, grade, fee) in new[] { (601, 7, 1000000m), (602, 7, 1500000m), (603, 8, 2000000m), (604, 7, 0m) })
            db.Classes.Add(new Class { ClassId = id, GradeId = grade, SubjectId = 601, ClassName = "Tuition Class " + id, TuitionFee = fee, StartDate = new(2025, 1, 1), Status = "active" });
        await db.SaveChangesAsync();
        db.StudentClasses.AddRange(new StudentClass { StudentId = 1001, ClassId = 601, Status = "active", EnrolledDate = new(2025, 1, 1) }, new StudentClass { StudentId = 1001, ClassId = 602, Status = "active", EnrolledDate = new(2025, 1, 1) },
            new StudentClass { StudentId = 1002, ClassId = 601, Status = "active", EnrolledDate = new(2025, 1, 1) }, new StudentClass { StudentId = 1003, ClassId = 601, Status = "active" },
            new StudentClass { StudentId = 1004, ClassId = 601, Status = "dropped", EnrolledDate = new(2025, 1, 1), DroppedAt = new(2026, 10, 15) },
            new StudentClass { StudentId = 1005, ClassId = 601, Status = "completed", EnrolledDate = new(2025, 1, 1) },
            new StudentClass { StudentId = 1006, ClassId = 601, Status = "active", EnrolledDate = new(2026, 11, 15) },
            new StudentClass { StudentId = 1007, ClassId = 601, Status = "active", EnrolledDate = new(2025, 1, 1) },
            new StudentClass { StudentId = 1001, ClassId = 604, Status = "active", EnrolledDate = new(2025, 1, 1) });
        await db.SaveChangesAsync();
    }
    var historyBefore = await EnrollmentSnapshot();
    var empty = Request("class", 11, 603); empty.GradeId = 8;
    Check((await Preview(empty)).EligibleCount == 0, "Empty class does not invent enrollments");
    var request = Request(); var preview = await Preview(request);
    Check(await InvoiceCount() == 0 && preview.ClassCount == 3 && preview.StudentCount == 2 && preview.EligibleCount == 3 && preview.TotalAmount == 3500000m, "Grade preview uses real enrollment and per-Class monthly fee; unique Students differ from invoice count");
    Check(preview.BillingPolicy == "monthly-fixed-v1" && preview.Ineligible == 6, "Monthly policy excludes mid-month/legacy/dropped/completed/wrong-role/zero-fee rows");
    Check(preview.Rows.Single(r => r.StudentId == 1006).Outcome == "ineligible" && preview.Rows.Single(r => r.StudentId == 1006).Reason!.Contains("Ghi danh giữa tháng"), "Mid-month first billing period is explicitly skipped, never treated as free");
    Check(preview.DueDate == new DateTime(2026, 11, 10), "Configured deadline is in the billing month");
    await using (var db = Db()) Check(!await db.ClassSessions.AnyAsync() && !await db.ClassSchedules.AnyAsync(), "Missing sessions/schedules do not prevent monthly Preview");
    await Reject(() => Confirm(Request()), "Confirm without Preview cannot write");
    request.PreviewToken = preview.PreviewToken;
    await using (var db = Db())
    {
        var session = new ClassSession { ClassId = 601, SessionDate = new(2026, 11, 2), StartTime = TimeSpan.FromHours(17), EndTime = TimeSpan.FromHours(19), Status = "cancelled" };
        db.ClassSessions.Add(session); await db.SaveChangesAsync();
        db.Attendances.Add(new Attendance { SessionId = session.SessionId, StudentId = 1001, RecordedBy = 1, Status = "absent" }); await db.SaveChangesAsync();
    }
    var afterAttendance = await Preview(request);
    Check(afterAttendance.PreviewToken == preview.PreviewToken && afterAttendance.TotalAmount == 3500000m, "Cancelled session and absent Attendance neither reduce fees nor invalidate monthly Preview");
    var result = await Confirm(request);
    Check(result.Created == 3 && await InvoiceCount() == 3, "Grade Confirm really inserts separate monthly invoices despite cancelled/missing sessions");
    Check(result.Rows.Where(r => r.Outcome == "created").All(r => r.AmountDue == (r.ClassId == 601 ? 1000000m : 1500000m)), "Regular Students pay fixed Class monthly fees");
    await using (var db = Db()) Check(!await db.TuitionInvoices.AnyAsync(i => i.StudentId == 1006), "Bulk does not issue first-month invoice for mid-month enrollment");
    var retry = await Confirm(request);
    Check(retry.Created == 0 && retry.AlreadyExists == 3 && await InvoiceCount() == 3, "Lost-response retry skips existing business keys");
    await using (var db = Db()) { (await db.Classes.FindAsync(604))!.TuitionFee = -1; await db.SaveChangesAsync(); }
    var invalidFee = (await Preview(Request("class", 11, 604))).Rows.Single();
    Check(invalidFee.Outcome == "ineligible" && invalidFee.AmountDue == 0 && invalidFee.MonthlyFee == -1,
        "Invalid legacy negative Class fee is explained as ineligible, never an invoice with negative amount");
    await using (var db = Db()) { (await db.Classes.FindAsync(604))!.TuitionFee = 0; await db.SaveChangesAsync(); }
    await Reject(() => Preview(Request("individual", 11, 603, 1001, 100)), "Student/Class/Grade mismatch rejected");
    await Reject(() => Preview(Request("individual", 11, 601, 1002)), "Individual amount must be explicitly valid");
    var mid = Request("individual", 11, 601, 1006, 300000);
    Check((await Preview(mid)).Rows.Single().Outcome == "ineligible", "Manual amount cannot bypass missing transparent first-month agreement workflow");
    var individual = Request("individual", 12, 601, 1002, 900000m); individual.PreviewToken = (await Preview(individual)).PreviewToken;
    var single = await Confirm(individual);
    var invoiceId = single.Rows.Single().InvoiceId!.Value;
    Check(single.Created == 1 && single.Rows.Single().AmountDue == 900000m && single.Rows.Single().MonthlyFee == 1000000m, "Individual manual fee works for eligible enrollment without bypassing existing validation");
    var stale = Request("class", 12, 602); stale.PreviewToken = (await Preview(stale)).PreviewToken;
    await using (var db = Db()) { (await db.Classes.FindAsync(602))!.TuitionFee = 1600000m; await db.SaveChangesAsync(); }
    await Reject(() => Confirm(stale), "Changed monthly fee invalidates stale Preview without writes");
    await using (var db = Db()) { (await db.CenterSettings.SingleAsync(s => s.SettingKey == "tuition_due_day")).SettingValue = "31"; await db.SaveChangesAsync(); }
    var leap = Request("class", 2, 602); leap.PeriodYear = 2028;
    Check((await Preview(leap)).DueDate == new DateTime(2028, 2, 29), "Configured day 31 clamps to leap-year billing month");
    await using (var db = Db())
    {
        (await db.CenterSettings.SingleAsync(s => s.SettingKey == "tuition_due_day")).SettingValue = "10";
        db.CenterSettings.Add(new CenterSetting { SettingKey = "tuition_cycle", SettingValue = "Quarterly" }); await db.SaveChangesAsync();
    }
    await Reject(() => Preview(Request()), "Quarterly is not silently converted to monthly");
    await using (var db = Db()) { db.CenterSettings.Remove(await db.CenterSettings.SingleAsync(s => s.SettingKey == "tuition_cycle")); await db.SaveChangesAsync(); }
    var concurrent = Request("class", 1, 601); concurrent.PreviewToken = (await Preview(concurrent)).PreviewToken;
    var both = await Task.WhenAll(Confirm(concurrent), Confirm(concurrent));
    Check(both.Sum(r => r.Created) == 3 && both.Sum(r => r.AlreadyExists) == 3, "Concurrent monthly Confirm creates each eligible key only once");
    var rollback = Request("grade", 2); rollback.PreviewToken = (await Preview(rollback)).PreviewToken;
    var prior = await InvoiceCount();
    var failing = new DbContextOptionsBuilder<EduTrackDbContext>().UseMySql(cs.ConnectionString, new MySqlServerVersion(new Version(8, 0, 0)), o => o.MaxBatchSize(1)).AddInterceptors(new FailSecondInvoice()).Options;
    try { await using var db = new EduTrackDbContext(failing); await new TuitionGenerationService(db).Confirm(rollback); throw new Exception("Failure injector did not run"); }
    catch (DbUpdateException) { Check(prior == await InvoiceCount(), "Real failure on second INSERT rolls back the entire new invoice batch"); }
    await using (var db = Db()) Check(!await db.Payments.AnyAsync(), "Generation never creates a Payment");

    var listener = new TcpListener(IPAddress.Loopback, 0); listener.Start(); var port = ((IPEndPoint)listener.LocalEndpoint).Port; listener.Stop();
    if (port == 5036) throw new Exception("Development port prohibited");
    var contentRoot = Path.Combine(Path.GetTempPath(), "edutrack-tuition-http-" + Guid.NewGuid().ToString("N")); Directory.CreateDirectory(contentRoot);
    var psi = new ProcessStartInfo(Environment.ProcessPath!) { WorkingDirectory = contentRoot, UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true };
    foreach (var arg in new[] { Path.Combine(AppContext.BaseDirectory, "EduTrack.API.dll"), "--contentRoot", contentRoot, "--urls", "http://127.0.0.1:" + port, "--Seeding:SkipSampleData=true", "--environment", "Development" }) psi.ArgumentList.Add(arg);
    psi.Environment["ConnectionStrings__DefaultConnection"] = cs.ConnectionString;
    api = Process.Start(psi)!; stdout = api.StandardOutput.ReadToEndAsync(); stderr = api.StandardError.ReadToEndAsync();
    using var http = new HttpClient { BaseAddress = new Uri("http://127.0.0.1:" + port), Timeout = TimeSpan.FromSeconds(20) };
    var ready = false; for (var i = 0; i < 80; i++) { try { using var r = await http.GetAsync("/api/grades"); if (r.IsSuccessStatusCode) { ready = true; break; } } catch (HttpRequestException) { } await Task.Delay(100); }
    Check(ready, "Real HTTP API starts with independent MySQL and no seeding");
    async Task<JsonElement> Call(string route, object body, HttpStatusCode expected = HttpStatusCode.OK, HttpMethod? method = null)
    {
        using var req = new HttpRequestMessage(method ?? HttpMethod.Post, "/api/tuitioninvoices/" + route) { Content = JsonContent.Create(body) };
        using var response = await http.SendAsync(req); var text = await response.Content.ReadAsStringAsync();
        if (response.StatusCode != expected) throw new Exception($"HTTP {route}: expected {expected}, actual {response.StatusCode}: {text}");
        return JsonDocument.Parse(text).RootElement.Clone();
    }
    var httpRequest = Request("class", 3, 602); var hp = await Call("generation/preview", httpRequest); httpRequest.PreviewToken = hp.GetProperty("previewToken").GetString();
    var hr = await Call("generation/confirm", httpRequest); Check(hr.GetProperty("created").GetInt32() == 1, "Real HTTP Class Confirm persists monthly invoice");
    await Call("generation/confirm", new { mode = "grade", gradeId = 7, periodMonth = 13, periodYear = 2026 }, HttpStatusCode.BadRequest);
    var payment = await Call(invoiceId + "/payments", new { amount = 300000, paymentMethod = "cash", recordedBy = 1 }, HttpStatusCode.Created);
    Check(payment.GetProperty("amount").GetDecimal() == 300000m, "Cash partial payment through real HTTP");
    await Call(invoiceId + "/payments", new { amount = 100000, paymentMethod = "bank_transfer", transactionCode = "T04_UNVERIFIED" }, HttpStatusCode.BadRequest);
    await Call(invoiceId + "/payments", new { amount = 200000, paymentMethod = "bank_transfer", externalPaymentVerified = true, transactionCode = "T04_BANK", recordedBy = 1 }, HttpStatusCode.Created);
    await Call(invoiceId + "/payments", new { amount = 100000, additionalChargeAmount = 100000, additionalChargeNote = "Materials", paymentMethod = "cash" }, HttpStatusCode.Created);
    await Call(invoiceId + "/payments", new { amount = 400000, paymentMethod = "momo", externalPaymentVerified = true, transactionCode = "T04_MOMO", recordedBy = 1 }, HttpStatusCode.Created);
    await Call(invoiceId + "/payments", new { amount = 1, paymentMethod = "cash" }, HttpStatusCode.BadRequest);
    await Call(invoiceId + "/payments", new { amount = 100000, additionalChargeAmount = 100000, paymentMethod = "cash" }, HttpStatusCode.BadRequest);
    await Call(invoiceId + "/payments", new { amount = 100000, additionalChargeAmount = 100000, additionalChargeNote = "Materials", paymentMethod = "cash" }, HttpStatusCode.BadRequest);
    await using (var db = Db())
    {
        var inv = await db.TuitionInvoices.Include(i => i.Payments).SingleAsync(i => i.InvoiceId == invoiceId);
        Check(inv.AmountDue == 1000000m && inv.Payments.Sum(p => p.Amount) == 1000000m && inv.Payments.Count == 4 && inv.Status == "paid", "Multiple payments settle correct invoice; extra charge counted once and original receipts preserved");
        inv.Status = "pending_adjustment"; await db.SaveChangesAsync();
    }
    await Call(invoiceId + "/payments", new { amount = 50000, additionalChargeAmount = 50000, additionalChargeNote = "Approved materials", paymentMethod = "cash" }, HttpStatusCode.BadRequest);
    await using (var db = Db()) Check((await db.TuitionInvoices.FindAsync(invoiceId))!.Status == "pending_adjustment", "Payment does not bypass pending adjustment workflow");
    await Call(invoiceId.ToString(), new { periodMonth = 12, periodYear = 2026, amountDue = 1050000, dueDate = "2026-12-10", status = "paid" }, HttpStatusCode.BadRequest, HttpMethod.Put);
    await Call(invoiceId.ToString(), new { periodMonth = 12, periodYear = 2026, amountDue = 1050000, status = "pending_adjustment" }, HttpStatusCode.BadRequest, HttpMethod.Put);
    var keep = await Confirm(individual);
    await using (var db = Db())
    {
        var saved = await db.TuitionInvoices.Include(i => i.Payments).SingleAsync(i => i.InvoiceId == invoiceId);
        Check(keep.AlreadyExists == 1 && keep.Rows.Single().AmountDue == 1000000m && saved.Payments.Count == 4 && saved.Status == "pending_adjustment" && saved.DueDate == new DateTime(2026, 12, 10), "Retry preserves invoice money/date/receipts; pending adjustment cannot reopen settled balance with fees");
    }
    var controlled = await Call("", new { studentId = 1001, classId = 601, periodMonth = 1, periodYear = 2090, amountDue = 1000000 }, HttpStatusCode.Created);
    var controlledId = controlled.GetProperty("invoiceId").GetInt32();
    async Task<JsonElement> ReadInvoice(int id) => (await http.GetFromJsonAsync<JsonElement>("/api/tuitioninvoices/" + id));
    Check((await ReadInvoice(controlledId)).GetProperty("status").GetString() == "unpaid", "New 1000000 invoice with no Payment is Unpaid before its deadline");
    await Call(controlledId.ToString(), new { periodMonth = 1, periodYear = 2090, amountDue = 1000000, dueDate = "2090-01-10", status = "paid" }, HttpStatusCode.BadRequest, HttpMethod.Put);
    Check((await ReadInvoice(controlledId)).GetProperty("status").GetString() == "unpaid", "PUT Status=Paid cannot fabricate a settled invoice");
    var edited = await Call(controlledId.ToString(), new { periodMonth = 1, periodYear = 2090, amountDue = 1000000, dueDate = "2090-01-11" }, HttpStatusCode.OK, HttpMethod.Put);
    Check(edited.GetProperty("status").GetString() == "unpaid", "Omitted Status is compatible; no-payment financial edits still work");
    await Call(controlledId + "/payments", new { amount = 600000, paymentMethod = "cash", recordedBy = 1 }, HttpStatusCode.Created);
    Check((await ReadInvoice(controlledId)).GetProperty("status").GetString() == "unpaid", "600000 partial Payment is not Paid");
    foreach (var patch in new[] {
        new { periodMonth = 1, periodYear = 2090, amountDue = 600000, dueDate = "2090-01-11" },
        new { periodMonth = 2, periodYear = 2090, amountDue = 1000000, dueDate = "2090-01-11" },
        new { periodMonth = 1, periodYear = 2090, amountDue = 1000000, dueDate = "2090-02-11" } })
        await Call(controlledId.ToString(), patch, HttpStatusCode.BadRequest, HttpMethod.Put);
    Check(true, "After a receipt, AmountDue/Period/DueDate changes cannot erase or move partial debt");
    await using (var db = Db()) { (await db.TuitionInvoices.FindAsync(controlledId))!.Status = "paid"; await db.SaveChangesAsync(); }
    Check((await ReadInvoice(controlledId)).GetProperty("status").GetString() == "unpaid", "GET derives real balance despite a stale saved Paid label");
    await using (var db = Db()) Check((await db.TuitionInvoices.FindAsync(controlledId))!.Status == "paid", "Read does not silently rewrite historical stale status");
    await Call(controlledId + "/payments", new { amount = 400000, paymentMethod = "cash", recordedBy = 1 }, HttpStatusCode.Created);
    Check((await ReadInvoice(controlledId)).GetProperty("status").GetString() == "paid", "Second 400000 Payment settles the 1000000 invoice automatically");
    await Call(controlledId + "/payments", new { amount = 1, paymentMethod = "cash" }, HttpStatusCode.BadRequest);
    await Call(controlledId + "/payments", new { amount = 100000, additionalChargeAmount = 100000, additionalChargeNote = "Cannot reopen", paymentMethod = "cash" }, HttpStatusCode.BadRequest);
    await Call(controlledId.ToString(), new { periodMonth = 1, periodYear = 2090, amountDue = 1100000, dueDate = "2090-01-11" }, HttpStatusCode.BadRequest, HttpMethod.Put);
    await using (var db = Db()) {
        var paidInvoice = await db.TuitionInvoices.Include(x => x.Payments).SingleAsync(x => x.InvoiceId == controlledId);
        Check(paidInvoice.AmountDue == 1000000 && paidInvoice.Payments.Count == 2 && paidInvoice.Payments.Sum(x => x.Amount) == 1000000,
            "Paid invoice rejects extra-fee bypass/edit/new Payment and preserves both receipts");
    }
    var overdueInvoice = await Call("", new { studentId = 1002, classId = 601, periodMonth = 9, periodYear = 2026, amountDue = 1000000 }, HttpStatusCode.Created);
    var overdueId = overdueInvoice.GetProperty("invoiceId").GetInt32();
    await Call(overdueId + "/payments", new { amount = 600000, paymentMethod = "cash" }, HttpStatusCode.Created);
    Check((await ReadInvoice(overdueId)).GetProperty("status").GetString() == "overdue", "Partial invoice after Vietnam deadline remains Overdue");
    async Task<HttpStatusCode> RacingPayment() { using var response = await http.PostAsJsonAsync("/api/tuitioninvoices/" + overdueId + "/payments", new { amount = 400000, paymentMethod = "cash" }); return response.StatusCode; }
    var paymentRace = await Task.WhenAll(RacingPayment(), RacingPayment());
    Check(paymentRace.Count(x => x == HttpStatusCode.Created) == 1 && paymentRace.Count(x => x == HttpStatusCode.BadRequest) == 1, "Concurrent Payments cannot both consume the same 400000 remaining balance");
    await using (var db = Db()) {
        var saved = await db.TuitionInvoices.Include(x => x.Payments).SingleAsync(x => x.InvoiceId == overdueId);
        Check(saved.Payments.Count == 2 && saved.Payments.Sum(x => x.Amount) == 1000000, "Concurrent Payment history has no excess receipt");
        var pendingInvoice = await db.TuitionInvoices.FindAsync(hr.GetProperty("rows")[0].GetProperty("invoiceId").GetInt32());
        pendingInvoice!.Status = "pending_adjustment"; await db.SaveChangesAsync();
    }
    var pendingId = hr.GetProperty("rows")[0].GetProperty("invoiceId").GetInt32();
    await Call(pendingId + "/payments", new { amount = 100000, paymentMethod = "cash" }, HttpStatusCode.Created);
    Check((await ReadInvoice(pendingId)).GetProperty("status").GetString() == "pending_adjustment", "A valid outstanding Payment cannot bypass Pending Adjustment");
    await Call(pendingId.ToString(), new { periodMonth = 3, periodYear = 2026, amountDue = 1600000, dueDate = "2026-03-10", status = "unpaid" }, HttpStatusCode.BadRequest, HttpMethod.Put);

    var httpGrade = Request("grade", 5); httpGrade.PreviewToken = (await Call("generation/preview", httpGrade)).GetProperty("previewToken").GetString();
    Check((await Call("generation/confirm", httpGrade)).GetProperty("created").GetInt32() == 4, "Real HTTP Entire Grade creates separate monthly invoices for multiple Classes");
    var concurrentHttp = Request("class", 6, 602); concurrentHttp.PreviewToken = (await Call("generation/preview", concurrentHttp)).GetProperty("previewToken").GetString();
    var beforeRace = await InvoiceCount();
    var racing = await Task.WhenAll(Call("generation/confirm", concurrentHttp), Call("generation/confirm", concurrentHttp));
    Check(racing.Sum(r => r.GetProperty("created").GetInt32()) == 1 && racing.Sum(r => r.GetProperty("alreadyExists").GetInt32()) == 1 && await InvoiceCount() == beforeRace + 1, "Concurrent real HTTP generation persists exactly one Invoice per key");
    var oldCreate = new { studentId = 1001, classId = 602, periodMonth = 4, periodYear = 2026, amountDue = 1200000 };
    await Call("", new { studentId = 1006, classId = 601, periodMonth = 11, periodYear = 2026, amountDue = 300000 }, HttpStatusCode.BadRequest);
    Check(true, "Legacy individual endpoint cannot bypass first-month agreement validation");
    var legacyApi = await Call("", oldCreate, HttpStatusCode.Created); var repeatApi = await Call("", oldCreate, HttpStatusCode.Created);
    Check(legacyApi.GetProperty("invoiceId").GetInt32() == repeatApi.GetProperty("invoiceId").GetInt32(), "Existing individual API delegates to guarded generation and retries safely");
    Check(legacyApi.GetProperty("classGradeId").GetInt32() == 7, "Invoice Grade classification follows Class even when Student school Grade is 8");
    await Call("", new { studentId = 1008, classId = 602, periodMonth = 4, periodYear = 2026, amountDue = 100 }, HttpStatusCode.BadRequest);
    var financialCount = await InvoiceCount();
    int paymentCount;
    await using (var db = Db()) paymentCount = await db.Payments.CountAsync();
    using (var readOnly = await http.GetAsync("/api/learning/parent/tuition/1008")) Check(readOnly.IsSuccessStatusCode && await InvoiceCount() == financialCount, "Learner Tuition read never creates demo invoices for an unbilled Student");
    using (var reset = await http.PostAsJsonAsync("/api/learning/parent/tuition/1002/reset-demo", new { })) Check(reset.StatusCode == HttpStatusCode.Conflict, "Legacy demo reset route cannot delete Payments or reopen invoices");
    using (var online = await http.PostAsJsonAsync("/api/learning/parent/payments", new { studentId = 1002, parentId = 0, paymentMethod = "momo", invoiceIds = new[] { invoiceId } })) Check(online.StatusCode == HttpStatusCode.NotImplemented, "Unverified online demo route cannot fabricate successful Payment");
    using (var deletion = await http.DeleteAsync("/api/users/1002")) Check(deletion.StatusCode == HttpStatusCode.Conflict, "Student deletion cannot cascade-delete financial history");
    using (var deletion = await http.DeleteAsync("/api/users/1")) Check(deletion.StatusCode == HttpStatusCode.Conflict, "Recorder deletion cannot erase Payment audit identity");
    await using (var db = Db()) Check(await db.TuitionInvoices.CountAsync() == financialCount && await db.Payments.CountAsync() == paymentCount, "Blocked legacy/delete paths preserve all invoice and Payment counts");
    var realFront = Environment.GetEnvironmentVariable("EDUTRACK_TEST_FRONTEND_ROOT");
    if (!string.IsNullOrEmpty(realFront))
    {
        var browser = new ProcessStartInfo("node") { WorkingDirectory = realFront, UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true };
        browser.Environment["EDUTRACK_TEST_API_URL"] = http.BaseAddress!.ToString();
        browser.Environment["EDUTRACK_HTTP_E2E_TOKEN"] = "HTTP E2E ISOLATED ONLY";
        browser.ArgumentList.Add(Path.Combine(realFront, "tests/tuitionGeneration.http.browser.mjs")); browser.ArgumentList.Add(http.BaseAddress!.ToString());
        using var proc = Process.Start(browser)!; var bo = proc.StandardOutput.ReadToEndAsync(); var be = proc.StandardError.ReadToEndAsync(); await proc.WaitForExitAsync(); Console.WriteLine(await bo); var errors = await be; if (!string.IsNullOrWhiteSpace(errors)) Console.Error.WriteLine(errors);
        Check(proc.ExitCode == 0, "Browser Tuition generation through real API for CM and AD across viewports");
    }
    await using (var db = Db())
    {
        Check(!await db.TuitionInvoices.GroupBy(i => new { i.StudentId, i.ClassId, i.PeriodMonth, i.PeriodYear }).AnyAsync(g => g.Count() > 1), "All tested API paths preserve unique invoice business keys without migration");
        Check(await db.StudentClasses.CountAsync() == 9 && (await db.Users.FindAsync(1001))!.GradeId == 8, "Generation preserves cross-grade Student profiles and all enrollment history");
    }
    Check(await EnrollmentSnapshot() == historyBefore, "Every original enrollment field, status, dates and reason remains unchanged");
    Console.WriteLine($"{count} Tuition assertions passed; isolated synthetic MySQL only.");
}
finally
{
    if (api != null) { if (!api.HasExited) { api.Kill(true); await api.WaitForExitAsync(); } var log = Path.Combine(Path.GetTempPath(), "edutrack-tuition-api-" + Guid.NewGuid().ToString("N")); if (stdout != null) await File.WriteAllTextAsync(log + ".stdout.log", await stdout); if (stderr != null) await File.WriteAllTextAsync(log + ".stderr.log", await stderr); api.Dispose(); }
    await using var cleanup = Db(); await cleanup.Database.EnsureDeletedAsync();
}


class FailSecondInvoice : DbCommandInterceptor
{
    int inserts;
    public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result, CancellationToken cancellationToken = default)
    {
        if (command.CommandText.Contains("INSERT INTO `tuition_invoices`", StringComparison.OrdinalIgnoreCase) && ++inserts == 2) throw new InvalidOperationException("Injected second invoice failure");
        return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
    }
}
