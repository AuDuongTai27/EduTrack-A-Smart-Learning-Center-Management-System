using System;
using System.Collections.Generic;
using System.Linq;
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
                    .ThenInclude(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                .Include(ar => ar.Reviewer)
                .OrderByDescending(ar => ar.CreatedAt)
                .ToListAsync();
        }

        public override async Task<ApprovalRequest?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(ar => ar.Student)
                .Include(ar => ar.Class)
                .Include(ar => ar.Requester)
                    .ThenInclude(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                .Include(ar => ar.Reviewer)
                .FirstOrDefaultAsync(x => x.RequestId == id);
        }

        public async Task<bool> TryReviewPendingAsync(
            int id,
            string status,
            int reviewedBy,
            string? reviewNotes,
            DateTime reviewedAt)
        {
            var affected = await _dbSet
                .Where(ar => ar.RequestId == id
                          && ar.Status.ToLower() == "pending")
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(ar => ar.Status, status)
                    .SetProperty(ar => ar.ReviewedBy, (int?)reviewedBy)
                    .SetProperty(ar => ar.ReviewedAt, (DateTime?)reviewedAt)
                    .SetProperty(ar => ar.ReviewNotes, reviewNotes));

            return affected == 1;
        }
    }
}
