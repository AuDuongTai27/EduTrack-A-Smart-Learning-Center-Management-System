using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class CenterSettingRepository : GenericRepository<CenterSetting>, ICenterSettingRepository
    {
        public CenterSettingRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<CenterSetting>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(cs => cs.Updater)
                .ToListAsync();
        }

        public override async Task<CenterSetting?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(cs => cs.Updater)
                .FirstOrDefaultAsync(x => x.SettingId == id);
        }
    }
}
