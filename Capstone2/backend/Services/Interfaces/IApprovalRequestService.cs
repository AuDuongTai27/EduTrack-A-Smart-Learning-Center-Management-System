using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface IApprovalRequestService
    {
        Task<IEnumerable<ApprovalRequestDto>> GetAllApprovalRequestsAsync();
        Task<ApprovalRequestDto?> GetApprovalRequestByIdAsync(int id);
    }
}
