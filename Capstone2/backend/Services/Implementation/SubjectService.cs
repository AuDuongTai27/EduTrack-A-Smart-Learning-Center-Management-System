using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class SubjectService : ISubjectService
    {
        private readonly ISubjectRepository _repository;

        public SubjectService(ISubjectRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<SubjectDto>> GetAllSubjectsAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<SubjectDto?> GetSubjectByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<SubjectDto> CreateSubjectAsync(CreateSubjectDto dto)
        {
            var entity = new Subject
            {
                SubjectCode = dto.SubjectCode.Trim().ToUpper(),
                SubjectName = dto.SubjectName.Trim(),
                Description = dto.Description?.Trim()
            };

            var added = await _repository.AddAsync(entity);
            return MapToDto(added);
        }

        public async Task<SubjectDto?> UpdateSubjectAsync(int id, UpdateSubjectDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return null;

            var entityToUpdate = new Subject
            {
                SubjectId = id,
                SubjectCode = string.IsNullOrWhiteSpace(dto.SubjectCode) ? existing.SubjectCode : dto.SubjectCode.Trim().ToUpper(),
                SubjectName = dto.SubjectName.Trim(),
                Description = dto.Description?.Trim()
            };

            var updated = await _repository.UpdateAsync(entityToUpdate);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteSubjectAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static SubjectDto MapToDto(Subject x)
        {
            return new SubjectDto
            {
                SubjectId = x.SubjectId,
                SubjectCode = x.SubjectCode,
                SubjectName = x.SubjectName,
                Description = x.Description,
                TotalClasses = x.Classes?.Count ?? 0
            };
        }
    }
}

