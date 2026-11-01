using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Teaching;

namespace EduTrack.API.Services.Teaching.Interfaces
{
    public interface ITeachingRequestService
    {
        Task<ApprovalRequestDto> CreateTeachingRequestAsync(CreateTeachingRequestDto dto);
    }
}

