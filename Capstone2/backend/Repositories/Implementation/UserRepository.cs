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
                .Include(u => u.UserSubjects)
                    .ThenInclude(us => us.Subject)
                .Include(u => u.UserGrades)
                    .ThenInclude(ug => ug.Grade)
                .Include(u => u.UserSubjectGrades)
                    .ThenInclude(usg => usg.Subject)
                .Include(u => u.UserSubjectGrades)
                    .ThenInclude(usg => usg.Grade)
                .ToListAsync();
        }

        public override async Task<User?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(u => u.Grade)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.UserSubjects)
                    .ThenInclude(us => us.Subject)
                .Include(u => u.UserGrades)
                    .ThenInclude(ug => ug.Grade)
                .Include(u => u.UserSubjectGrades)
                    .ThenInclude(usg => usg.Subject)
                .Include(u => u.UserSubjectGrades)
                    .ThenInclude(usg => usg.Grade)
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User> CreateUserWithRoleAsync(
            User user,
            string roleName,
            IReadOnlyCollection<int>? subjectIds = null,
            IReadOnlyCollection<int>? gradeIds = null,
            IReadOnlyCollection<(int SubjectId, IReadOnlyCollection<int> GradeIds)>? subjectGrades = null,
            IReadOnlyCollection<string>? roleNames = null)
        {
            var normalizedRoles = (roleNames != null && roleNames.Count > 0 ? roleNames : new[] { roleName })
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .Select(r => r.Trim().ToLower() == "ta" ? "teaching_assistant" : r.Trim().ToLower())
                .Distinct()
                .ToList();
            if (normalizedRoles.Count == 0) normalizedRoles.Add("teacher");

            var isTeachingStaff = normalizedRoles.Any(r => r == "teacher" || r == "teaching_assistant" || r == "ta");

            if (isTeachingStaff)
            {
                if (subjectGrades != null && subjectGrades.Count > 0)
                {
                    var normalizedGroups = subjectGrades
                        .Where(g => g.SubjectId > 0)
                        .GroupBy(g => g.SubjectId)
                        .Select(g => (
                            SubjectId: g.Key,
                            GradeIds: g.SelectMany(x => x.GradeIds ?? System.Array.Empty<int>()).Where(gid => gid > 0).Distinct().OrderBy(gid => gid).ToList()
                        ))
                        .OrderBy(g => g.SubjectId)
                        .ToList();

                    var distinctSubjectIds = normalizedGroups.Select(g => g.SubjectId).ToList();
                    var validSubjects = distinctSubjectIds.Count > 0
                        ? await _context.Subjects.Where(s => distinctSubjectIds.Contains(s.SubjectId)).OrderBy(s => s.SubjectId).ToListAsync()
                        : new List<Subject>();
                    if (validSubjects.Count != distinctSubjectIds.Count)
                        throw new System.ArgumentException("Một hoặc nhiều chuyên môn đã chọn không tồn tại. Vui lòng tải lại danh mục.");

                    var distinctGradeIds = normalizedGroups.SelectMany(g => g.GradeIds).Distinct().OrderBy(gid => gid).ToList();
                    var validGrades = distinctGradeIds.Count > 0
                        ? await _context.Grades.Where(g => distinctGradeIds.Contains(g.GradeId)).OrderBy(g => g.GradeId).ToListAsync()
                        : new List<Grade>();
                    if (validGrades.Count != distinctGradeIds.Count)
                        throw new System.ArgumentException("Một hoặc nhiều khối lớp đã chọn không tồn tại. Vui lòng tải lại danh mục.");

                    foreach (var s in validSubjects)
                    {
                        user.UserSubjects.Add(new UserSubject { SubjectId = s.SubjectId });
                    }
                    foreach (var g in validGrades)
                    {
                        user.UserGrades.Add(new UserGrade { GradeId = g.GradeId });
                    }
                    foreach (var group in normalizedGroups)
                    {
                        foreach (var gid in group.GradeIds)
                        {
                            user.UserSubjectGrades.Add(new UserSubjectGrade
                            {
                                SubjectId = group.SubjectId,
                                GradeId = gid
                            });
                        }
                    }

                    if (validSubjects.Count > 0)
                    {
                        var joined = string.Join(", ", validSubjects.Select(s => s.SubjectName));
                        user.Specialty = joined.Length > 100 ? joined[..100] : joined;
                    }
                }
                else
                {
                    var distinctSubjectIds = (subjectIds ?? System.Array.Empty<int>()).Where(id => id > 0).Distinct().OrderBy(id => id).ToList();
                    var validSubjects = distinctSubjectIds.Count > 0
                        ? await _context.Subjects.Where(s => distinctSubjectIds.Contains(s.SubjectId)).OrderBy(s => s.SubjectId).ToListAsync()
                        : new List<Subject>();
                    if (validSubjects.Count != distinctSubjectIds.Count)
                        throw new System.ArgumentException("Một hoặc nhiều chuyên môn đã chọn không tồn tại. Vui lòng tải lại danh mục.");

                    foreach (var s in validSubjects)
                    {
                        user.UserSubjects.Add(new UserSubject { SubjectId = s.SubjectId });
                    }

                    var distinctGradeIds = (gradeIds ?? System.Array.Empty<int>()).Where(id => id > 0).Distinct().OrderBy(id => id).ToList();
                    var validGrades = distinctGradeIds.Count > 0
                        ? await _context.Grades.Where(g => distinctGradeIds.Contains(g.GradeId)).OrderBy(g => g.GradeId).ToListAsync()
                        : new List<Grade>();
                    if (validGrades.Count != distinctGradeIds.Count)
                        throw new System.ArgumentException("Một hoặc nhiều khối lớp đã chọn không tồn tại. Vui lòng tải lại danh mục.");

                    foreach (var g in validGrades)
                    {
                        user.UserGrades.Add(new UserGrade { GradeId = g.GradeId });
                    }

                    foreach (var s in validSubjects)
                    {
                        foreach (var g in validGrades)
                        {
                            user.UserSubjectGrades.Add(new UserSubjectGrade { SubjectId = s.SubjectId, GradeId = g.GradeId });
                        }
                    }

                    if (validSubjects.Count > 0)
                    {
                        var joined = string.Join(", ", validSubjects.Select(s => s.SubjectName));
                        user.Specialty = joined.Length > 100 ? joined[..100] : joined;
                    }
                }
            }

            await _dbSet.AddAsync(user);
            await _context.SaveChangesAsync();

            var dbRoles = await _context.Roles
                .Where(r => normalizedRoles.Contains(r.RoleName.ToLower()))
                .ToListAsync();
            if (dbRoles.Count > 0)
            {
                foreach (var role in dbRoles)
                {
                    await _context.UserRoles.AddAsync(new UserRole
                    {
                        UserId = user.UserId,
                        RoleId = role.RoleId
                    });
                }
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

        public async Task<User?> UpdateUserWithRoleAsync(
            int id,
            User updatedUser,
            string? roleName,
            bool gradeSpecified = false,
            IReadOnlyCollection<int>? subjectIds = null,
            bool subjectsSpecified = false,
            IReadOnlyCollection<int>? gradeIds = null,
            bool gradesSpecified = false,
            IReadOnlyCollection<(int SubjectId, IReadOnlyCollection<int> GradeIds)>? subjectGrades = null,
            bool subjectGradesSpecified = false,
            IReadOnlyCollection<string>? roleNames = null)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var existing = await _dbSet
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.UserSubjects)
                .Include(u => u.UserGrades)
                .Include(u => u.UserSubjectGrades)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (existing == null) return null;

            var requestedRoles = (roleNames != null && roleNames.Count > 0
                ? roleNames
                : !string.IsNullOrWhiteSpace(roleName)
                    ? new[] { roleName }
                    : System.Array.Empty<string>())
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .Select(r => r.Trim().ToLower() == "ta" ? "teaching_assistant" : r.Trim().ToLower())
                .Distinct()
                .ToList();

            var effectiveRoles = requestedRoles.Count > 0
                ? requestedRoles
                : existing.UserRoles
                    .Select(ur => ur.Role?.RoleName?.ToLower())
                    .Where(r => !string.IsNullOrWhiteSpace(r))
                    .Select(r => r!)
                    .ToList();

            var isStudent = existing.UserRoles.Any(ur => ur.Role.RoleName == "student") || effectiveRoles.Contains("student");
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

            var isTeachingStaff = effectiveRoles.Any(r => r == "teacher" || r == "teaching_assistant" || r == "ta");

            existing.FullName = updatedUser.FullName;
            existing.Email = updatedUser.Email;
            existing.Phone = updatedUser.Phone;
            if (!string.IsNullOrWhiteSpace(updatedUser.Gender)) existing.Gender = updatedUser.Gender;
            if (!string.IsNullOrWhiteSpace(updatedUser.Status)) existing.Status = updatedUser.Status;

            if (!isTeachingStaff)
            {
                if (existing.UserSubjectGrades.Count > 0)
                {
                    _context.UserSubjectGrades.RemoveRange(existing.UserSubjectGrades);
                    existing.UserSubjectGrades.Clear();
                }
                if (existing.UserSubjects.Count > 0)
                {
                    _context.UserSubjects.RemoveRange(existing.UserSubjects);
                    existing.UserSubjects.Clear();
                }
                if (existing.UserGrades.Count > 0)
                {
                    _context.UserGrades.RemoveRange(existing.UserGrades);
                    existing.UserGrades.Clear();
                }
                if (!isStudent) existing.Specialty = updatedUser.Specialty;
            }
            else if (subjectGradesSpecified)
            {
                var normalizedGroups = (subjectGrades ?? System.Array.Empty<(int SubjectId, IReadOnlyCollection<int> GradeIds)>())
                    .Where(g => g.SubjectId > 0)
                    .GroupBy(g => g.SubjectId)
                    .Select(g => (
                        SubjectId: g.Key,
                        GradeIds: g.SelectMany(x => x.GradeIds ?? System.Array.Empty<int>()).Where(gid => gid > 0).Distinct().OrderBy(gid => gid).ToList()
                    ))
                    .OrderBy(g => g.SubjectId)
                    .ToList();

                var distinctSubjectIds = normalizedGroups.Select(g => g.SubjectId).ToList();
                var validSubjects = distinctSubjectIds.Count > 0
                    ? await _context.Subjects.Where(s => distinctSubjectIds.Contains(s.SubjectId)).OrderBy(s => s.SubjectId).ToListAsync()
                    : new List<Subject>();
                if (validSubjects.Count != distinctSubjectIds.Count)
                    throw new ArgumentException("Một hoặc nhiều chuyên môn đã chọn không tồn tại. Vui lòng tải lại danh mục.");

                var distinctGradeIds = normalizedGroups.SelectMany(g => g.GradeIds).Distinct().OrderBy(gid => gid).ToList();
                var validGrades = distinctGradeIds.Count > 0
                    ? await _context.Grades.Where(g => distinctGradeIds.Contains(g.GradeId)).OrderBy(g => g.GradeId).ToListAsync()
                    : new List<Grade>();
                if (validGrades.Count != distinctGradeIds.Count)
                    throw new ArgumentException("Một hoặc nhiều khối lớp đã chọn không tồn tại. Vui lòng tải lại danh mục.");

                _context.UserSubjectGrades.RemoveRange(existing.UserSubjectGrades);
                existing.UserSubjectGrades.Clear();
                _context.UserSubjects.RemoveRange(existing.UserSubjects);
                existing.UserSubjects.Clear();
                _context.UserGrades.RemoveRange(existing.UserGrades);
                existing.UserGrades.Clear();

                foreach (var s in validSubjects)
                {
                    existing.UserSubjects.Add(new UserSubject { UserId = existing.UserId, SubjectId = s.SubjectId });
                }
                foreach (var g in validGrades)
                {
                    existing.UserGrades.Add(new UserGrade { UserId = existing.UserId, GradeId = g.GradeId });
                }
                foreach (var group in normalizedGroups)
                {
                    foreach (var gid in group.GradeIds)
                    {
                        existing.UserSubjectGrades.Add(new UserSubjectGrade
                        {
                            UserId = existing.UserId,
                            SubjectId = group.SubjectId,
                            GradeId = gid
                        });
                    }
                }

                if (validSubjects.Count > 0)
                {
                    var joined = string.Join(", ", validSubjects.Select(s => s.SubjectName));
                    existing.Specialty = joined.Length > 100 ? joined[..100] : joined;
                }
                else
                {
                    existing.Specialty = updatedUser.Specialty;
                }
            }
            else
            {
                if (subjectsSpecified)
                {
                    var distinctSubjectIds = (subjectIds ?? System.Array.Empty<int>()).Where(sid => sid > 0).Distinct().OrderBy(sid => sid).ToList();
                    var validSubjects = distinctSubjectIds.Count > 0
                        ? await _context.Subjects.Where(s => distinctSubjectIds.Contains(s.SubjectId)).OrderBy(s => s.SubjectId).ToListAsync()
                        : new List<Subject>();
                    if (validSubjects.Count != distinctSubjectIds.Count)
                        throw new ArgumentException("Một hoặc nhiều chuyên môn đã chọn không tồn tại. Vui lòng tải lại danh mục.");

                    _context.UserSubjects.RemoveRange(existing.UserSubjects);
                    existing.UserSubjects.Clear();
                    foreach (var s in validSubjects)
                    {
                        existing.UserSubjects.Add(new UserSubject { UserId = existing.UserId, SubjectId = s.SubjectId });
                    }

                    if (validSubjects.Count > 0)
                    {
                        var joined = string.Join(", ", validSubjects.Select(s => s.SubjectName));
                        existing.Specialty = joined.Length > 100 ? joined[..100] : joined;
                    }
                    else
                    {
                        existing.Specialty = updatedUser.Specialty;
                    }
                }
                else
                {
                    existing.Specialty = updatedUser.Specialty;
                }

                if (gradesSpecified)
                {
                    var distinctGradeIds = (gradeIds ?? System.Array.Empty<int>()).Where(gid => gid > 0).Distinct().OrderBy(gid => gid).ToList();
                    var validGrades = distinctGradeIds.Count > 0
                        ? await _context.Grades.Where(g => distinctGradeIds.Contains(g.GradeId)).OrderBy(g => g.GradeId).ToListAsync()
                        : new List<Grade>();
                    if (validGrades.Count != distinctGradeIds.Count)
                        throw new ArgumentException("Một hoặc nhiều khối lớp đã chọn không tồn tại. Vui lòng tải lại danh mục.");

                    _context.UserGrades.RemoveRange(existing.UserGrades);
                    existing.UserGrades.Clear();
                    foreach (var g in validGrades)
                    {
                        existing.UserGrades.Add(new UserGrade { UserId = existing.UserId, GradeId = g.GradeId });
                    }
                }
            }

            if (requestedRoles.Count > 0)
            {
                var dbRoles = await _context.Roles
                    .Where(r => requestedRoles.Contains(r.RoleName.ToLower()))
                    .ToListAsync();
                if (dbRoles.Count > 0)
                {
                    _context.UserRoles.RemoveRange(existing.UserRoles);
                    existing.UserRoles.Clear();
                    foreach (var role in dbRoles)
                    {
                        existing.UserRoles.Add(new UserRole
                        {
                            UserId = existing.UserId,
                            RoleId = role.RoleId,
                            Role = role
                        });
                    }
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
            await _context.Entry(user).Collection(u => u.UserSubjects).LoadAsync();
            await _context.Entry(user).Collection(u => u.UserGrades).LoadAsync();
            await _context.Entry(user).Collection(u => u.UserSubjectGrades).LoadAsync();

            _context.UserRoles.RemoveRange(user.UserRoles);
            _context.UserSubjectGrades.RemoveRange(user.UserSubjectGrades);
            _context.UserSubjects.RemoveRange(user.UserSubjects);
            _context.UserGrades.RemoveRange(user.UserGrades);
            _dbSet.Remove(user);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
    }
}

