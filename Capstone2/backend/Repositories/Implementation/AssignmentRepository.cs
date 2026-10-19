using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class AssignmentRepository : GenericRepository<Assignment>, IAssignmentRepository
    {
        public AssignmentRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Assignment>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(a => a.Class)
                .Include(a => a.ContentUnit)
                .Include(a => a.Creator)
                .ToListAsync();
        }

        public override async Task<Assignment?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(a => a.Class)
                .Include(a => a.ContentUnit)
                .Include(a => a.Creator)
                .FirstOrDefaultAsync(x => x.AssignmentId == id);
        }
    }
}
