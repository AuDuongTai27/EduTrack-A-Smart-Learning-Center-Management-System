using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface IAssignmentService
    {
        Task<IEnumerable<AssignmentDto>> GetAllAssignmentsAsync();
        Task<AssignmentDto?> GetAssignmentByIdAsync(int id);
    }
}
