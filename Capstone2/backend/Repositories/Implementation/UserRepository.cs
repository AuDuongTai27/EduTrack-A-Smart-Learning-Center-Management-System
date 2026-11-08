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
    /// <summary>
    /// UserRepository kế thừa GenericRepository<User> và implement IUserRepository.
    /// </summary>
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(u => u.Grade)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .ToListAsync();
        }

        public override async Task<User?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(u => u.Grade)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User> CreateUserWithRoleAsync(User user, string roleName)
        {
            await _dbSet.AddAsync(user);
            await _context.SaveChangesAsync();

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName.ToLower() == roleName.ToLower());
            if (role != null)
            {
                var userRole = new UserRole
                {
                    UserId = user.UserId,
                    RoleId = role.RoleId
                };
                await _context.UserRoles.AddAsync(userRole);
                await _context.SaveChangesAsync();
            }

            return await GetByIdAsync(user.UserId) ?? user;
        }

        public async Task<User> CreateStudentWithClassesAsync(User user, int? gradeId, IReadOnlyCollection<int> classIds)
        {
            var ids = classIds.Distinct().OrderBy(id => id).ToArray();
            // Serializable reads retain shared locks on the grade/classes through commit,
            // preventing status/grade changes between validation and enrollment on MySQL.
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var existing = await _dbSet.AsNoTracking()
                .Include(u => u.Grade)
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Include(u => u.StudentClasses)
                .SingleOrDefaultAsync(u => u.UserCode == user.UserCode);
            if (existing != null)
            {
                // Never update a previous student or add classes during a replay.
                if (existing.FullName != user.FullName || existing.Email != user.Email
                    || existing.Phone != user.Phone || existing.Gender != user.Gender
                    || existing.Specialty != user.Specialty
                    || existing.GradeId != gradeId
                    || !existing.UserRoles.Any(ur => ur.Role.RoleName == "student")
                    || !ids.SequenceEqual(existing.StudentClasses.Select(sc => sc.ClassId).OrderBy(id => id)))
                    throw new StudentCreationConflictException(existing);
                await transaction.CommitAsync();
                return existing;
            }

            var grade = gradeId.HasValue ? await _context.Grades.SingleOrDefaultAsync(g => g.GradeId == gradeId) : null;
            if (gradeId.HasValue && grade == null)
                throw new ArgumentException("Khối lớp đã chọn không còn tồn tại. Vui lòng tải lại danh mục.");
            user.GradeId = gradeId;
            user.Grade = grade;
            var classes = await _context.Classes.Where(c => ids.Contains(c.ClassId)).ToListAsync();
            StudentEnrollmentPolicy.EnsureEligible(gradeId, ids, classes);
            var role = await _context.Roles.SingleOrDefaultAsync(r => r.RoleName == "student")
                ?? throw new InvalidOperationException("Chưa cấu hình vai trò học sinh. Hồ sơ chưa được lưu; vui lòng liên hệ quản trị viên.");

            user.UserRoles.Add(new UserRole { Role = role });
            foreach (var id in ids)
                user.StudentClasses.Add(new StudentClass { ClassId = id, Status = "active", EnrolledDate = DateTime.UtcNow });
            await _dbSet.AddAsync(user);
            // EF inserts the entire graph in one transaction; the existing unique
            // (student_id, class_id) and user_code indexes are the final duplicate guards.
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return user;
        }

        public async Task<User?> UpdateUserWithRoleAsync(int id, User updatedUser, string? roleName, bool gradeSpecified = false)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var existing = await _dbSet
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (existing == null) return null;

            var isStudent = existing.UserRoles.Any(ur => ur.Role.RoleName == "student") || roleName == "student";
            if (gradeSpecified)
            {
                if (!isStudent && updatedUser.GradeId != null)
                    throw new ArgumentException("Khối lớp chỉ áp dụng cho hồ sơ học sinh.");
                if (updatedUser.GradeId.HasValue && !await _context.Grades.AnyAsync(g => g.GradeId == updatedUser.GradeId))
                    throw new ArgumentException("Khối lớp đã chọn không còn tồn tại. Vui lòng tải lại danh mục.");
                // The student's current school grade is independent of center class
                // enrollment. Updating it must never inspect, move or rewrite enrollment.
                existing.GradeId = updatedUser.GradeId;
            }

            existing.FullName = updatedUser.FullName;
            existing.Email = updatedUser.Email;
            existing.Phone = updatedUser.Phone;
            if (!isStudent) existing.Specialty = updatedUser.Specialty;
            if (!string.IsNullOrWhiteSpace(updatedUser.Gender)) existing.Gender = updatedUser.Gender;
            if (!string.IsNullOrWhiteSpace(updatedUser.Status)) existing.Status = updatedUser.Status;

            if (!string.IsNullOrWhiteSpace(roleName))
            {
                var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName.ToLower() == roleName.ToLower());
                if (role != null)
                {
                    _context.UserRoles.RemoveRange(existing.UserRoles);
                    existing.UserRoles.Add(new UserRole
                    {
                        UserId = existing.UserId,
                        RoleId = role.RoleId,
                        Role = role
                    });
                }
            }

            await _context.SaveChangesAsync();
            var result = await GetByIdAsync(id);
            await transaction.CommitAsync();
            return result;
        }

        public async Task<bool> UpdateStatusAsync(int id, string status)
        {
            var user = await _dbSet.FindAsync(id);
            if (user == null) return false;

            user.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            // Prevent cascade deletion of invoices/payments and loss of payer/recorder identity.
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var user = (await _dbSet.FromSqlInterpolated($"SELECT * FROM users WHERE user_id = {id} FOR UPDATE").ToListAsync()).SingleOrDefault();

            if (user == null) return false;
            if (await _context.TuitionInvoices.AnyAsync(i => i.StudentId == id)
                || await _context.Payments.AnyAsync(p => p.PaidByUserId == id || p.RecordedBy == id))
                throw new InvalidOperationException("Không thể xóa hồ sơ có lịch sử hóa đơn/thanh toán. Hãy dùng trạng thái inactive để bảo toàn dữ liệu tài chính.");
            await _context.Entry(user).Collection(u => u.UserRoles).LoadAsync();

            _context.UserRoles.RemoveRange(user.UserRoles);
            _dbSet.Remove(user);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
    }
}

