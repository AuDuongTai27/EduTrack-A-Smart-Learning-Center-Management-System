using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class ClassSessionRepository : GenericRepository<ClassSession>, IClassSessionRepository
    {
        public ClassSessionRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<ClassSession>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(cs => cs.Class)
                .Include(cs => cs.Schedule)
                .ToListAsync();
        }

        public override async Task<ClassSession?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(cs => cs.Class)
                .Include(cs => cs.Schedule)
                .FirstOrDefaultAsync(x => x.SessionId == id);
        }
    }
}
