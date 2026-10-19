using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class AssignmentService : IAssignmentService
    {
        private readonly IAssignmentRepository _repository;

        public AssignmentService(IAssignmentRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<AssignmentDto>> GetAllAssignmentsAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<AssignmentDto?> GetAssignmentByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static AssignmentDto MapToDto(Assignment x)
        {
            return new AssignmentDto
            {
                AssignmentId = x.AssignmentId,
                ClassId = x.ClassId,
                ClassName = x.Class?.ClassName ?? string.Empty,
                ContentUnitId = x.ContentUnitId,
                ContentUnitTitle = x.ContentUnit?.Title,
                Title = x.Title,
                Description = x.Description,
                FileUrl = x.FileUrl,
                DueDate = x.DueDate,
                MaxScore = x.MaxScore,
                CreatedBy = x.CreatedBy,
                CreatorName = x.Creator?.FullName ?? string.Empty,
                IsAiGradingEnabled = x.IsAiGradingEnabled
            };
        }
    }
}
