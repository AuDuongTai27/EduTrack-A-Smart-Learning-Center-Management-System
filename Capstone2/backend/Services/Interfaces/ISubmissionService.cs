using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface ISubmissionService
    {
        Task<IEnumerable<SubmissionDto>> GetAllSubmissionsAsync();
        Task<SubmissionDto?> GetSubmissionByIdAsync(int id);
    }
}
