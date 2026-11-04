using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;

namespace EduTrack.API.Services.Management.Interfaces
{
    public interface IManagementApprovalRequestService
    {
        Task<ApprovalRequestDto> CreateAsync(
            CreateApprovalRequestDto dto);

        Task<ApprovalRequestDto?> UpdateAsync(
            int id, UpdateApprovalRequestDto dto);

        Task<ApprovalRequestDto?> ReviewAsync(
            int id, ReviewApprovalRequestDto dto);
    }
}
