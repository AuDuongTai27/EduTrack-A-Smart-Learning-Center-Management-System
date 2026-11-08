using System.Data;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Services.Management.Implementation;

// Uses existing schema. Stable parent-row locks serialize ALL CM/AD invoice writers.
// A proposed unique index is still required to protect against other/SQL writers.
public class TuitionGenerationService(EduTrackDbContext db)
{
    public async Task<GenerationPreview> Preview(GenerateTuitionDto dto)
    {
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead);
        var result = await Build(dto);
        await tx.CommitAsync();
        return result;
    }

    public async Task<GenerationPreview> Confirm(GenerateTuitionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.PreviewToken)) throw new ArgumentException("Vui lòng Preview trước khi xác nhận.");
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        // Lock the Grade first: serializes both Grade and Class modes and fixes
        // lock order. Ordinary profile Grade changes do not touch this parent row.
        await db.Grades.FromSqlInterpolated($"SELECT * FROM grades WHERE grade_id = {dto.GradeId} FOR UPDATE").ToListAsync();
        var ids = await db.Classes.Where(c => c.GradeId == dto.GradeId && (dto.Mode == "grade" || c.ClassId == dto.ClassId))
            .OrderBy(c => c.ClassId).Select(c => c.ClassId).ToListAsync();
        foreach (var id in ids) await LockClass(db, id);
        var preview = await Build(dto);
        if (preview.PreviewToken != dto.PreviewToken) throw new InvalidOperationException("Preview đã cũ: khối/lớp/enrollment/học phí/hạn nộp thay đổi. Xem Preview mới trước khi xác nhận; chưa ghi hóa đơn nào.");
        var created = new List<GenerationRow>();
        foreach (var row in preview.Rows)
        {
            if (row.Outcome != "eligible") { created.Add(row); continue; }
            var invoice = new TuitionInvoice { StudentId = row.StudentId!.Value, ClassId = row.ClassId,
                PeriodMonth = dto.PeriodMonth, PeriodYear = dto.PeriodYear, AmountDue = row.AmountDue,
                DueDate = row.DueDate ?? preview.DueDate, Status = "unpaid" };
            db.TuitionInvoices.Add(invoice);
            // One transaction, including all inserts; a failure rolls back the entire batch.
            await db.SaveChangesAsync();
            created.Add(row with { Outcome = "created", InvoiceId = invoice.InvoiceId });
        }
        await tx.CommitAsync();
        return preview with { Rows = created, Created = created.Count(r => r.Outcome == "created"), EligibleCount = 0 };
    }

    public static async Task LockClass(EduTrackDbContext db, int id) =>
        _ = await db.Classes.FromSqlInterpolated($"SELECT * FROM classes WHERE class_id = {id} FOR UPDATE").ToListAsync();

    private async Task<GenerationPreview> Build(GenerateTuitionDto dto)
    {
        if (dto.Mode is not ("grade" or "class" or "individual") || dto.PeriodMonth is < 1 or > 12 || dto.PeriodYear is < 2000 or > 2100
            || dto.GradeId <= 0 || (dto.Mode != "grade" && dto.ClassId is null or <= 0)
            || (dto.Mode == "individual" && (dto.StudentId is null or <= 0 || dto.AmountDue == null))
            || (dto.AmountDue != null && !TuitionGenerationPolicy.ValidAmount(dto.AmountDue.Value)))
            throw new ArgumentException("Chế độ, khối, lớp, học sinh, kỳ hoặc số tiền không hợp lệ.");
        var grade = await db.Grades.AsNoTracking().SingleOrDefaultAsync(g => g.GradeId == dto.GradeId)
            ?? throw new ArgumentException("Khối không còn tồn tại.");
        var classes = await db.Classes.AsNoTracking().Where(c => c.GradeId == dto.GradeId && (dto.Mode == "grade" || c.ClassId == dto.ClassId))
            .OrderBy(c => c.ClassId).ToListAsync();
        if (dto.Mode != "grade" && classes.Count == 0) throw new ArgumentException("Class không tồn tại hoặc không thuộc Grade đã chọn.");
        if (classes.Count > 100) throw new ArgumentException("Phạm vi quá lớn; hãy chia theo Class (tối đa 100 Class/lần).");
        var classIds = classes.Select(c => c.ClassId).ToArray();
        var enrollments = await db.StudentClasses.AsNoTracking().Include(r => r.Class).Include(r => r.Student).ThenInclude(s => s.UserRoles).ThenInclude(r => r.Role)
            .Where(r => classIds.Contains(r.ClassId) && (dto.Mode != "individual" || r.StudentId == dto.StudentId)).OrderBy(r => r.ClassId).ThenBy(r => r.StudentId).ToListAsync();
        if (enrollments.Count > 2000) throw new ArgumentException("Batch vượt 2000 enrollment; chia thành các Class nhỏ hơn.");
        var existing = await db.TuitionInvoices.AsNoTracking().Where(i => classIds.Contains(i.ClassId) && i.PeriodMonth == dto.PeriodMonth && i.PeriodYear == dto.PeriodYear).ToListAsync();
        var settings = await db.CenterSettings.AsNoTracking().Where(s => s.SettingKey == "tuition_due_day" || s.SettingKey == "tuition_cycle").ToListAsync();
        var cycle = settings.SingleOrDefault(s => s.SettingKey == "tuition_cycle")?.SettingValue?.Trim();
        if (!string.IsNullOrEmpty(cycle) && !cycle.Equals("Monthly", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Center Settings đang dùng chu kỳ khác Monthly. Task 04 chưa có quy tắc thu theo quý; không tự quy đổi sang hóa đơn tháng.");
        var dueDay = settings.SingleOrDefault(s => s.SettingKey == "tuition_due_day")?.SettingValue?.Trim();
        var due = TuitionPolicy.DueDateForCreation(DateTimeOffset.UtcNow);
        var policy = "Một tháng lịch kể từ ngày tạo (UTC+7); chưa cấu hình tuition_due_day.";
        if (!string.IsNullOrWhiteSpace(dueDay))
        {
            if (!int.TryParse(dueDay, out var day) || day is < 1 or > 31) throw new InvalidOperationException("tuition_due_day không hợp lệ; cần quản lý kiểm tra Center Settings.");
            due = new DateTime(dto.PeriodYear, dto.PeriodMonth, Math.Min(day, DateTime.DaysInMonth(dto.PeriodYear, dto.PeriodMonth)));
            policy = $"Center Settings: ngày {day} của kỳ thu; chặn cuối tháng theo lịch. Kỳ cũ có thể đã quá hạn.";
        }
        var start = new DateTime(dto.PeriodYear, dto.PeriodMonth, 1);
        var end = start.AddMonths(1).AddDays(-1);
        var rows = new List<GenerationRow>();
        foreach (var c in classes)
        {
            var members = enrollments.Where(e => e.ClassId == c.ClassId).ToList();
            if (members.Count == 0) rows.Add(new(c.ClassId, c.ClassName, dto.Mode == "individual" ? dto.StudentId : null, "", 0, "ineligible", "Không có enrollment phù hợp.", false, MonthlyFee: c.TuitionFee, DueDate: due, DueDatePolicy: policy));
            foreach (var member in members)
            {
                var reason = TuitionGenerationPolicy.Ineligible(member, start, end);
                var validEnrollment = reason == null;
                var found = existing.Where(i => i.StudentId == member.StudentId && i.ClassId == c.ClassId).ToList();
                if (found.Count > 0) rows.Add(new(c.ClassId, c.ClassName, member.StudentId, member.Student.FullName, found[0].AmountDue, "already_exists", found.Count > 1 ? "Có nhiều hóa đơn legacy cùng khóa; giữ nguyên, cần đối soát." : "Giữ nguyên hóa đơn, hạn nộp và Payments đã có; không tính lại theo chính sách mới.", validEnrollment, found[0].InvoiceId, c.TuitionFee, found[0].DueDate, "Hạn nộp đã lưu; không thay đổi."));
                else
                {
                    var amount = dto.Mode == "individual" ? dto.AmountDue!.Value : c.TuitionFee;
                    var validAmount = TuitionGenerationPolicy.ValidAmount(amount);
                    if (!validAmount) reason ??= "Class thiếu mức học phí hợp lệ (> 0); không tự tạo hóa đơn miễn phí.";
                    rows.Add(new(c.ClassId, c.ClassName, member.StudentId, member.Student.FullName, validAmount ? amount : 0,
                        reason == null ? "eligible" : "ineligible", reason, validEnrollment,
                        MonthlyFee: c.TuitionFee, DueDate: due, DueDatePolicy: policy));
                }
            }
        }
        // Exclude invoice existence from token: a replay returns already_exists. All
        // financial terms and enrollment evidence remain bound to the reviewed preview.
        var signature = JsonSerializer.Serialize(new { dto.Mode, dto.GradeId, dto.ClassId, dto.StudentId, dto.PeriodMonth, dto.PeriodYear, dto.AmountDue, due, policy,
            TuitionGenerationPolicy.Version,
            classes = classes.Select(c => new { c.ClassId, c.GradeId, c.TuitionFee, c.StartDate, c.EndDate, c.Status }),
            enrollments = enrollments.Select(e => new { e.StudentId, e.ClassId, e.EnrolledDate, e.Status, e.DroppedAt, roles = e.Student.UserRoles.Select(r => r.Role.RoleName).OrderBy(r => r) }) });
        var token = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(signature)));
        var detail = classes.Select(c => new GenerationClass(c.ClassId, c.ClassName, rows.Count(r => r.ClassId == c.ClassId && r.Outcome == "eligible"),
            rows.Where(r => r.ClassId == c.ClassId && r.Outcome == "eligible").Sum(r => r.AmountDue), rows.Count(r => r.ClassId == c.ClassId && r.Outcome == "already_exists"), rows.Count(r => r.ClassId == c.ClassId && r.Outcome == "ineligible"))).ToList();
        return new(dto.Mode, grade.GradeId, grade.GradeName, dto.PeriodMonth, dto.PeriodYear, due, policy, token, classes.Count,
            rows.Where(r => r.EnrollmentEligible || r.Outcome == "already_exists").Where(r => r.StudentId != null).Select(r => r.StudentId).Distinct().Count(), rows.Count(r => r.Outcome == "eligible"), rows.Where(r => r.Outcome == "eligible").Sum(r => r.AmountDue),
            rows.Count(r => r.Outcome == "already_exists"), rows.Count(r => r.Outcome == "ineligible"), 0, 0, detail, rows);
    }
}
