using System;
using System.Collections.Generic;
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
                .ToListAsync();
        }

        public override async Task<Class?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(c => c.Subject)
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
            var classItem = await _dbSet
                .Include(c => c.StudentClasses)
                .Include(c => c.TeacherClasses)
                .Include(c => c.TaClasses)
                .Include(c => c.ClassSchedules)
                .FirstOrDefaultAsync(c => c.ClassId == id);

            if (classItem == null) return false;

            if (classItem.StudentClasses != null && classItem.StudentClasses.Count > 0)
            {
                throw new InvalidOperationException($"Không thể xóa lớp học '{classItem.ClassName}' vì đang có {classItem.StudentClasses.Count} học viên đăng ký.");
            }

            // Remove associated teacher and TA assignments & schedules if any
            if (classItem.TeacherClasses != null && classItem.TeacherClasses.Count > 0)
            {
                _context.TeacherClasses.RemoveRange(classItem.TeacherClasses);
            }
            if (classItem.TaClasses != null && classItem.TaClasses.Count > 0)
            {
                _context.TaClasses.RemoveRange(classItem.TaClasses);
            }
            if (classItem.ClassSchedules != null && classItem.ClassSchedules.Count > 0)
            {
                _context.ClassSchedules.RemoveRange(classItem.ClassSchedules);
            }

            _dbSet.Remove(classItem);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
