using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace EduTrack.API.Services.Management
{
    public static class ClassValidation
    {
        public static IEnumerable<ValidationResult> Validate(string? name, int subjectId, string? room,
            decimal fee, DateTime start, DateTime? end, string? status, bool creating = false)
        {
            if (string.IsNullOrWhiteSpace(name) || name.Trim().Length > 150)
                yield return new ValidationResult("Tên lớp là bắt buộc và tối đa 150 ký tự.", new[] { "ClassName" });
            if (subjectId <= 0)
                yield return new ValidationResult("Vui lòng chọn môn học hợp lệ.", new[] { "SubjectId" });
            if (room?.Trim().Length > 50)
                yield return new ValidationResult("Phòng học tối đa 50 ký tự.", new[] { "Room" });
            if (fee < 0 || fee > 9999999999.99m || decimal.Round(fee, 2) != fee)
                yield return new ValidationResult("Học phí không âm, tối đa 9.999.999.999,99 VND và 2 chữ số thập phân.", new[] { "TuitionFee" });
            if (start.Year < 1000)
                yield return new ValidationResult("Ngày khai giảng không hợp lệ hoặc chưa được nhập.", new[] { "StartDate" });
            if (end.HasValue && (end.Value.Year < 1000 || end.Value.Date < start.Date))
                yield return new ValidationResult("Ngày kết thúc không được trước ngày khai giảng.", new[] { "EndDate" });
            if (string.IsNullOrWhiteSpace(status) || status.Trim().Length > 20)
                yield return new ValidationResult("Trạng thái lớp là bắt buộc và tối đa 20 ký tự.", new[] { "Status" });
            else if (creating && !string.Equals(status.Trim(), "active", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(status.Trim(), "upcoming", StringComparison.OrdinalIgnoreCase))
                yield return new ValidationResult("Lớp mới chỉ được có trạng thái Active hoặc Upcoming.", new[] { "Status" });
        }

        public static void EnsureValid(string? name, int subjectId, string? room, decimal fee,
            DateTime start, DateTime? end, string? status, bool creating = false)
        {
            var errors = Validate(name, subjectId, room, fee, start, end, status, creating).ToList();
            if (errors.Count > 0) throw new ArgumentException(string.Join(" ", errors.Select(e => e.ErrorMessage)));
        }
    }
}
