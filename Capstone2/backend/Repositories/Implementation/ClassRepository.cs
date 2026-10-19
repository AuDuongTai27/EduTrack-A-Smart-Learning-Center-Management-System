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
    }
}
