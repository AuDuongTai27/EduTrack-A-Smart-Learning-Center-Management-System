using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs.Teaching;

namespace EduTrack.API.Services.Teaching.Interfaces
{
    public interface ITeachingAssignmentService
    {
        Task<TeachingAssignmentItemDto> CreateAssignmentAsync(CreateTeachingAssignmentRequestDto request);
        Task<List<TeachingAssignmentItemDto>> GetClassAssignmentsAsync(int classId);
        Task<TeachingAssignmentItemDto?> GetAssignmentByIdAsync(int assignmentId);
    }
}

