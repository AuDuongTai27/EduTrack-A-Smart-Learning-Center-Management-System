using EduTrack.API.Models.Entities;

namespace EduTrack.API.Services.Management;

public sealed class StudentCreationConflictException : InvalidOperationException
{
    public int StudentId { get; }
    public string StudentCode { get; }
    public StudentCreationConflictException(User student)
        : base("Yêu cầu này đã được lưu với thông tin khác. Hãy xem hồ sơ đã lưu để kiểm tra; các thay đổi và lựa chọn lớp mới chưa được áp dụng.")
    {
        StudentId = student.UserId;
        StudentCode = student.UserCode;
    }
}

public static class StudentEnrollmentPolicy
{
    public static bool CanEnroll(string? status) =>
        string.Equals(status?.Trim(), "active", StringComparison.OrdinalIgnoreCase)
        || string.Equals(status?.Trim(), "upcoming", StringComparison.OrdinalIgnoreCase);

    public static void EnsureEligible(int? gradeId, IReadOnlyCollection<int> classIds, IReadOnlyCollection<Class> classes)
    {
        if (classIds.Any(id => id <= 0))
            throw new ArgumentException("Mã lớp học không hợp lệ. Vui lòng tải lại danh sách lớp.");
        if (classIds.Count > 0 && (gradeId is null or <= 0))
            throw new ArgumentException("Vui lòng chọn khối lớp trước khi đăng ký lớp học.");
        foreach (var id in classIds.Distinct())
        {
            var item = classes.SingleOrDefault(c => c.ClassId == id);
            if (item == null) throw new ArgumentException($"Lớp #{id} không còn tồn tại. Vui lòng tải lại danh sách lớp.");
            if (item.GradeId != gradeId)
                throw new ArgumentException($"Lớp '{item.ClassName}' không thuộc khối đã chọn. Vui lòng chọn lại lớp.");
            if (!CanEnroll(item.Status))
                throw new ArgumentException($"Lớp '{item.ClassName}' không còn nhận ghi danh (trạng thái: {item.Status}). Vui lòng chọn lại lớp.");
        }
    }
}
