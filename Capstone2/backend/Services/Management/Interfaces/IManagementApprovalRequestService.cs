using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;

namespace EduTrack.API.Services.Management.Interfaces
{
    public interface IManagementApprovalRequestService
    {
        Task<ApprovalRequestDto> CreateAsync(
            CreateApprovalRequestDto dto);

        Task<ApprovalRequestDto?> ReviewAsync(
            int id, ReviewApprovalRequestDto dto);
    }
}