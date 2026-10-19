using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class ClassScheduleRepository : GenericRepository<ClassSchedule>, IClassScheduleRepository
    {
        public ClassScheduleRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<ClassSchedule>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(cs => cs.Class)
                .ToListAsync();
        }

        public override async Task<ClassSchedule?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(cs => cs.Class)
                .FirstOrDefaultAsync(x => x.ScheduleId == id);
        }
    }
}
