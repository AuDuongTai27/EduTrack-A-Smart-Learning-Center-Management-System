using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface IAiEvaluationService
    {
        Task<IEnumerable<AiEvaluationDto>> GetAllAiEvaluationsAsync();
        Task<AiEvaluationDto?> GetAiEvaluationByIdAsync(int id);
    }
}
