using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class SubjectRepository : GenericRepository<Subject>, ISubjectRepository
    {
        public SubjectRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Subject>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(s => s.Classes)
                .ToListAsync();
        }

        public override async Task<Subject?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(s => s.Classes)
                .FirstOrDefaultAsync(x => x.SubjectId == id);
        }
    }
}
