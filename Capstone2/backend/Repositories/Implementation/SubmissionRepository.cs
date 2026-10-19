using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class SubmissionRepository : GenericRepository<Submission>, ISubmissionRepository
    {
        public SubmissionRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Submission>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(s => s.Assignment)
                .Include(s => s.Student)
                .Include(s => s.Grader)
                .ToListAsync();
        }

        public override async Task<Submission?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(s => s.Assignment)
                .Include(s => s.Student)
                .Include(s => s.Grader)
                .FirstOrDefaultAsync(x => x.SubmissionId == id);
        }
    }
}
