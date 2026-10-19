using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class ContentUnitRepository : GenericRepository<ContentUnit>, IContentUnitRepository
    {
        public ContentUnitRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<ContentUnit>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(cu => cu.Class)
                .Include(cu => cu.ParentUnit)
                .ToListAsync();
        }

        public override async Task<ContentUnit?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(cu => cu.Class)
                .Include(cu => cu.ParentUnit)
                .FirstOrDefaultAsync(x => x.ContentUnitId == id);
        }
    }
}
