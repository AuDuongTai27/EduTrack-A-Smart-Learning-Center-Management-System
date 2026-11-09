using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Management;
using System.Data;

namespace EduTrack.API.Repositories.Implementation
{
    public class StudentClassRepository : GenericRepository<StudentClass>, IStudentClassRepository
    {
        public StudentClassRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<StudentClass>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(sc => sc.Student)
                .Include(sc => sc.Class)
                .ToListAsync();
        }

        public override async Task<StudentClass?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(sc => sc.Student)
                .Include(sc => sc.Class)
                .FirstOrDefaultAsync(x => x.ScId == id);
        }

        public async Task<IEnumerable<StudentClass>> GetForStudentAsync(int studentId) =>
            await _dbSet.AsNoTracking().Include(sc => sc.Student).Include(sc => sc.Class)
                .Where(sc => sc.StudentId == studentId).OrderBy(sc => sc.ScId).ToListAsync();

        private async Task<User> RequireStudent(int studentId) =>
            await _context.Users.Include(u => u.UserRoles).ThenInclude(r => r.Role)
                .SingleOrDefaultAsync(u => u.UserId == studentId && u.UserRoles.Any(r => r.Role.RoleName == "student"))
            ?? throw new KeyNotFoundException("Không tìm thấy hồ sơ học sinh hợp lệ. Vui lòng tải lại.");

        public async Task<IEnumerable<StudentClass>> EnrollAsync(int studentId, int gradeId, IReadOnlyCollection<int> classIds)
        {
            if (studentId <= 0 || gradeId <= 0 || classIds == null || classIds.Count == 0 || classIds.Any(id => id <= 0))
                throw new ArgumentException("Vui lòng chọn học sinh, khối và ít nhất một lớp hợp lệ.");
            var ids = classIds.Distinct().OrderBy(id => id).ToArray();
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var student = await RequireStudent(studentId);
            if (student.GradeId != gradeId)
                throw new InvalidOperationException("Khối hồ sơ đã thay đổi hoặc chưa được lưu. Lưu khối và mở lại hồ sơ trước khi đăng ký lớp.");
            var existing = await _dbSet.Where(sc => sc.StudentId == studentId && ids.Contains(sc.ClassId)).ToListAsync();
            if (existing.Any(sc => !string.Equals(sc.Status.Trim(), "active", StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException("Có lớp đã có lịch sử hoàn thành hoặc nghỉ học. Không thể tạo trùng hay tự kích hoạt lại lịch sử; vui lòng chọn lớp khác.");
            // Active duplicates are idempotent, including retries after a lost response.
            // Only NEW rows are validated/inserted; existing enrollment is never rewritten.
            var newIds = ids.Except(existing.Select(sc => sc.ClassId)).ToArray();
            var classes = await _context.Classes.Where(c => newIds.Contains(c.ClassId)).ToListAsync();
            StudentEnrollmentPolicy.EnsureEligible(gradeId, newIds, classes);
            foreach (var id in newIds)
                _dbSet.Add(new StudentClass { StudentId = studentId, ClassId = id, Status = "active", EnrolledDate = DateTime.UtcNow });
            await _context.SaveChangesAsync();
            var result = await GetForStudentAsync(studentId);
            await transaction.CommitAsync();
            return result;
        }

        public async Task<IEnumerable<StudentClass>> DropAsync(int studentId, int enrollmentId, string? reason)
        {
            if (studentId <= 0 || enrollmentId <= 0 || reason?.Length > 500)
                throw new ArgumentException("Thông tin ngừng học không hợp lệ; lý do tối đa 500 ký tự.");
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            await RequireStudent(studentId);
            var row = await _dbSet.SingleOrDefaultAsync(sc => sc.ScId == enrollmentId && sc.StudentId == studentId)
                ?? throw new KeyNotFoundException("Không tìm thấy đăng ký lớp của học sinh này. Vui lòng tải lại.");
            if (!string.Equals(row.Status.Trim(), "dropped", StringComparison.OrdinalIgnoreCase))
            {
                if (!string.Equals(row.Status.Trim(), "active", StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException("Chỉ có thể ngừng lớp đang học; lịch sử đã hoàn thành hoặc trạng thái khác được giữ nguyên.");
                row.Status = "dropped";
                row.DroppedAt = DateTime.UtcNow;
                row.DropReason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();
                await _context.SaveChangesAsync();
            }
            // A repeated drop retains the first timestamp/reason instead of rewriting history.
            var result = await GetForStudentAsync(studentId);
            await transaction.CommitAsync();
            return result;
        }
    }
}
