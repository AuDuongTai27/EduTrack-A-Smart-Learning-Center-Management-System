using EduTrack.API.Models.Entities;

namespace EduTrack.API.Services.Management;

public static class TuitionGenerationPolicy
{
    public static bool ValidAmount(decimal amount) => amount > 0 && amount <= 9999999999.99m
        && decimal.Round(amount, 2) == amount;

    public const string Version = "monthly-fixed-v1";

    // Monthly billing requires full-period enrollment evidence. Mid-month fees
    // require a separately documented agreement, not automatic proration.
    public static string? Ineligible(StudentClass row, DateTime start, DateTime end)
    {
        if (!row.Student.UserRoles.Any(r => r.Role.RoleName.Equals("student", StringComparison.OrdinalIgnoreCase)))
            return "User không có vai trò Student.";
        var status = row.Status.Trim().ToLowerInvariant();
        if (status is not ("active" or "completed" or "dropped")) return "Trạng thái enrollment chưa xác định.";
        if (row.EnrolledDate == null) return "Thiếu ngày đăng ký; cần xác minh trước khi thu.";
        var enrolled = DateTime.SpecifyKind(row.EnrolledDate.Value, DateTimeKind.Utc).AddHours(7).Date;
        if (enrolled > end) return "Ngày ghi danh nằm sau kỳ thu.";
        if (enrolled > start) return "Ghi danh giữa tháng: bỏ qua kỳ nhập học, không miễn phí hoặc chia theo buổi/ngày. Cần ghi nhận thỏa thuận phí riêng và thu tháng tiếp theo; không tự gộp vào hóa đơn kỳ sau. Luồng hiện tại chưa xác minh được khoản thỏa thuận này để phát hành tự động.";
        if (row.Class.StartDate == default || row.Class.StartDate.Date > start)
            return "Class chưa bắt đầu từ đầu kỳ; chưa có chính sách thu kỳ lẻ.";
        if (row.Class.EndDate?.Date < end) return "Class kết thúc trước cuối kỳ; chưa có chính sách thu kỳ lẻ.";
        if (row.Class.Status.Trim().ToLowerInvariant() is not ("active" or "upcoming" or "completed"))
            return "Trạng thái Class không đủ căn cứ lập hóa đơn.";
        if (row.DroppedAt != null && DateTime.SpecifyKind(row.DroppedAt.Value, DateTimeKind.Utc).AddHours(7).Date <= end)
            return "Đã nghỉ trước khi hoàn tất kỳ; chưa có chính sách truy thu/hoàn phí.";
        if (status == "dropped" && row.DroppedAt == null) return "Enrollment đã nghỉ nhưng thiếu ngày nghỉ.";
        if ((status == "completed" || row.Class.Status.Trim().Equals("completed", StringComparison.OrdinalIgnoreCase)) && row.Class.EndDate == null)
            return "Đã hoàn thành nhưng thiếu ngày kết thúc để chứng minh kỳ học.";
        return null;
    }
}
