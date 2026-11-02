using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Teaching;

namespace EduTrack.API.Services.Teaching.Interfaces
{
    public interface ITeachingRequestService
    {
        Task<List<ApprovalRequestDto>> GetTeachingRequestsAsync(int userId, string? status = null);
        Task<ApprovalRequestDto> CreateTeachingRequestAsync(CreateTeachingRequestDto dto);
        Task<ApprovalRequestDto?> UpdateTeachingRequestAsync(int requestId, UpdateTeachingRequestDto dto);
    }
}
