using System.Threading.Tasks;
using EduTrack.API.Models.Entities;

namespace EduTrack.API.Repositories.Interfaces
{
    public interface IApprovalRequestRepository : IGenericRepository<ApprovalRequest>
    {
        Task<bool> TryReviewPendingAsync(
            int id,
            string status,
            int reviewedBy,
            string? reviewNotes,
            DateTime reviewedAt);
    }
}
