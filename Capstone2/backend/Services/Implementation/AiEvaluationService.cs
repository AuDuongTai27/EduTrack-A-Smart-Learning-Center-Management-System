using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class AiEvaluationService : IAiEvaluationService
    {
        private readonly IAiEvaluationRepository _repository;

        public AiEvaluationService(IAiEvaluationRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<AiEvaluationDto>> GetAllAiEvaluationsAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<AiEvaluationDto?> GetAiEvaluationByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static AiEvaluationDto MapToDto(AiEvaluation x)
        {
            return new AiEvaluationDto
            {
                EvaluationId = x.EvaluationId,
                SubmissionId = x.SubmissionId,
                RequestedBy = x.RequestedBy,
                RequesterName = x.Requester?.FullName ?? string.Empty,
                AiScore = x.AiScore,
                AiFeedback = x.AiFeedback,
                RawResponse = x.RawResponse,
                Status = x.Status,
                CreatedAt = x.CreatedAt
            };
        }
    }
}
