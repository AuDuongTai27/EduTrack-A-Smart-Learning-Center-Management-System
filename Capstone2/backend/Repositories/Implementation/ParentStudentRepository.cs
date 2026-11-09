using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class ParentStudentRepository : GenericRepository<ParentStudent>, IParentStudentRepository
    {
        public ParentStudentRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<ParentStudent>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(ps => ps.Parent)
                .Include(ps => ps.Student)
                .ToListAsync();
        }

        public async Task<ParentStudent?> GetByIdsAsync(int parentId, int studentId)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(ps => ps.Parent)
                .Include(ps => ps.Student)
                .FirstOrDefaultAsync(ps => ps.ParentId == parentId && ps.StudentId == studentId);
        }

        public async Task<ParentStudent> AssignAsync(ParentStudent parentStudent, bool updateExisting = false, bool preserveRelationship = false, bool preservePrimaryContact = false)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            if (parentStudent.ParentId <= 0 || parentStudent.StudentId <= 0
                || !await _context.UserRoles.AnyAsync(ur => ur.UserId == parentStudent.ParentId && ur.Role.RoleName == "parent")
                || !await _context.UserRoles.AnyAsync(ur => ur.UserId == parentStudent.StudentId && ur.Role.RoleName == "student"))
                throw new ArgumentException("Phụ huynh hoặc học sinh đã chọn không tồn tại hoặc không đúng vai trò. Vui lòng tải lại danh sách.");
            var existing = await _dbSet.FirstOrDefaultAsync(ps => ps.ParentId == parentStudent.ParentId && ps.StudentId == parentStudent.StudentId);
            if (existing != null)
            {
                if (!updateExisting)
                    throw new InvalidOperationException("Liên kết phụ huynh–học sinh đã tồn tại. Hãy chọn lại cặp để xem và chỉnh sửa quan hệ đã lưu.");
                if (!preserveRelationship) existing.Relationship = parentStudent.Relationship;
                if (!preservePrimaryContact) existing.IsPrimaryContact = parentStudent.IsPrimaryContact;
            }
            else
            {
                if (updateExisting)
                    throw new InvalidOperationException("Liên kết cần cập nhật không còn tồn tại. Vui lòng tải lại danh sách trước khi tạo liên kết mới.");
                await _dbSet.AddAsync(parentStudent);
            }
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlConnector.MySqlException { Number: 1062 })
            {
                throw new InvalidOperationException("Liên kết đã được tạo ở phiên khác. Vui lòng tải lại danh sách.", ex);
            }
            var result = await GetByIdsAsync(parentStudent.ParentId, parentStudent.StudentId) ?? parentStudent;
            await transaction.CommitAsync();
            return result;
        }

        public async Task<bool> RemoveAsync(int parentId, int studentId)
        {
            var existing = await _dbSet.FirstOrDefaultAsync(ps => ps.ParentId == parentId && ps.StudentId == studentId);
            if (existing == null) return false;

            _dbSet.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

