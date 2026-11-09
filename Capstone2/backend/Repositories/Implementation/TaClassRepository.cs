using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class TaClassRepository : GenericRepository<TaClass>, ITaClassRepository
    {
        public TaClassRepository(EduTrackDbContext context) : base(context)
        {
        }

        public Task<TaClass?> FindAssignmentAsync(int classId, int taId) =>
            _dbSet.FirstOrDefaultAsync(x => x.ClassId == classId && x.TaId == taId);

        public async Task<TaClass?> DeactivateAsync(int classId, int assignmentId)
        {
            await _dbSet.Where(x => x.ClassId == classId && x.TaClassId == assignmentId && x.Status != "inactive")
                .ExecuteUpdateAsync(update => update.SetProperty(x => x.Status, "inactive"));
            var assignment = await GetByIdAsync(assignmentId);
            return assignment?.ClassId == classId ? assignment : null;
        }

        public override async Task<IEnumerable<TaClass>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(tc => tc.Ta)
                .Include(tc => tc.Class)
                .ToListAsync();
        }

        public override async Task<TaClass?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(tc => tc.Ta)
                .Include(tc => tc.Class)
                .FirstOrDefaultAsync(x => x.TaClassId == id);
        }
    }
}
