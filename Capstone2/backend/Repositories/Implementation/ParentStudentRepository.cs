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

        public async Task<ParentStudent> AssignAsync(ParentStudent parentStudent)
        {
            var existing = await _dbSet.FirstOrDefaultAsync(ps => ps.ParentId == parentStudent.ParentId && ps.StudentId == parentStudent.StudentId);
            if (existing != null)
            {
                existing.Relationship = parentStudent.Relationship;
                existing.IsPrimaryContact = parentStudent.IsPrimaryContact;
            }
            else
            {
                await _dbSet.AddAsync(parentStudent);
            }
            await _context.SaveChangesAsync();
            return await GetByIdsAsync(parentStudent.ParentId, parentStudent.StudentId) ?? parentStudent;
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

