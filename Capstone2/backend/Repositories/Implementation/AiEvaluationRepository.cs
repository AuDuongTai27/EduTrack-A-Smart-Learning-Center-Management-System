using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class AiEvaluationRepository : GenericRepository<AiEvaluation>, IAiEvaluationRepository
    {
        public AiEvaluationRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<AiEvaluation>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(ae => ae.Submission)
                .Include(ae => ae.Requester)
                .ToListAsync();
        }

        public override async Task<AiEvaluation?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(ae => ae.Submission)
                .Include(ae => ae.Requester)
                .FirstOrDefaultAsync(x => x.EvaluationId == id);
        }
    }
}
