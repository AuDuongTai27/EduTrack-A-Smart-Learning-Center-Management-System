using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class TeacherClassRepository : GenericRepository<TeacherClass>, ITeacherClassRepository
    {
        public TeacherClassRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<TeacherClass>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(tc => tc.Teacher)
                .Include(tc => tc.Class)
                .ToListAsync();
        }

        public override async Task<TeacherClass?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(tc => tc.Teacher)
                .Include(tc => tc.Class)
                .FirstOrDefaultAsync(x => x.TeacherClassId == id);
        }
    }
}
