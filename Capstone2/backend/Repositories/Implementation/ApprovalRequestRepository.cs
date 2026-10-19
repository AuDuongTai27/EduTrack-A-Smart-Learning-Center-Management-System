using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class ApprovalRequestRepository : GenericRepository<ApprovalRequest>, IApprovalRequestRepository
    {
        public ApprovalRequestRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<ApprovalRequest>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(ar => ar.Student)
                .Include(ar => ar.Class)
                .Include(ar => ar.Requester)
                .Include(ar => ar.Reviewer)
                .ToListAsync();
        }

        public override async Task<ApprovalRequest?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(ar => ar.Student)
                .Include(ar => ar.Class)
                .Include(ar => ar.Requester)
                .Include(ar => ar.Reviewer)
                .FirstOrDefaultAsync(x => x.RequestId == id);
        }
    }
}
