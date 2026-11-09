using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class ClassRepository : GenericRepository<Class>, IClassRepository
    {
        public ClassRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Class>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(c => c.Subject)
                .Include(c => c.Grade)
                .ToListAsync();
        }

        public override async Task<Class?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(c => c.Subject)
                .Include(c => c.Grade)
                .FirstOrDefaultAsync(x => x.ClassId == id);
        }

        public override async Task<Class> UpdateAsync(Class entity)
        {
            var existing = await _dbSet.FindAsync(entity.ClassId);
            if (existing != null)
            {
                _context.Entry(existing).CurrentValues.SetValues(entity);
                await _context.SaveChangesAsync();
                return existing;
            }
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public override async Task<bool> DeleteAsync(int id)
        {
            // Lock the MySQL parent row before checking dependents. Inserts referencing this
            // class must wait, preventing a check/delete race from triggering FK cascades.
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var classItem = (await _dbSet.FromSqlInterpolated(
                $"SELECT * FROM classes WHERE class_id = {id} FOR UPDATE").ToListAsync()).SingleOrDefault();

            if (classItem == null) return false;

            var hasData = await _dbSet.Where(c => c.ClassId == id)
                .AnyAsync(ClassDeletionPolicy.HasRetainedData);
            if (hasData)
            {
                throw new InvalidOperationException($"Không thể xóa vĩnh viễn lớp '{classItem.ClassName}' vì đã có dữ liệu liên quan (đăng ký, lịch học, phân công hoặc lịch sử nghiệp vụ). Hãy chuyển trạng thái sang Inactive hoặc Completed để giữ lịch sử.");
            }

            _dbSet.Remove(classItem);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
    }
}
