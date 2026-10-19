using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class SubmissionService : ISubmissionService
    {
        private readonly ISubmissionRepository _repository;

        public SubmissionService(ISubmissionRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<SubmissionDto>> GetAllSubmissionsAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<SubmissionDto?> GetSubmissionByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static SubmissionDto MapToDto(Submission x)
        {
            return new SubmissionDto
            {
                SubmissionId = x.SubmissionId,
                AssignmentId = x.AssignmentId,
                AssignmentTitle = x.Assignment?.Title ?? string.Empty,
                StudentId = x.StudentId,
                StudentName = x.Student?.FullName ?? string.Empty,
                StudentCode = x.Student?.UserCode ?? string.Empty,
                FileUrl = x.FileUrl,
                SubmittedAt = x.SubmittedAt,
                Score = x.Score,
                Feedback = x.Feedback,
                AiScore = x.AiScore,
                AiFeedbackJson = x.AiFeedbackJson,
                Status = x.Status,
                GradedBy = x.GradedBy,
                GraderName = x.Grader?.FullName
            };
        }
    }
}
