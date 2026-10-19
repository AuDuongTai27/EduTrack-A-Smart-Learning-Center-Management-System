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
    }
}
