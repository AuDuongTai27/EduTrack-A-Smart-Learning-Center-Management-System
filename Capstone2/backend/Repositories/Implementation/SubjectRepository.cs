using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class SubjectRepository : GenericRepository<Subject>, ISubjectRepository
    {
        public SubjectRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Subject>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(s => s.Classes)
                .ToListAsync();
        }

        public override async Task<Subject?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(s => s.Classes)
                .FirstOrDefaultAsync(x => x.SubjectId == id);
        }

        public override async Task<Subject> UpdateAsync(Subject entity)
        {
            var existing = await _dbSet.FindAsync(entity.SubjectId);
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
            var subject = await _dbSet.Include(s => s.Classes).FirstOrDefaultAsync(s => s.SubjectId == id);
            if (subject == null) return false;
            if (subject.Classes != null && subject.Classes.Count > 0)
            {
                throw new System.InvalidOperationException($"Không thể xóa môn học '{subject.SubjectName}' vì đang có {subject.Classes.Count} lớp học liên kết.");
            }
            _dbSet.Remove(subject);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

