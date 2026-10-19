using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class ParentStudentService : IParentStudentService
    {
        private readonly IParentStudentRepository _repository;

        public ParentStudentService(IParentStudentRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ParentStudentDto>> GetAllParentStudentsAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<ParentStudentDto?> GetByIdsAsync(int parentId, int studentId)
        {
            var item = await _repository.GetByIdsAsync(parentId, studentId);
            return item == null ? null : MapToDto(item);
        }

        private static ParentStudentDto MapToDto(ParentStudent x)
        {
            return new ParentStudentDto
            {
                ParentId = x.ParentId,
                ParentName = x.Parent?.FullName ?? string.Empty,
                ParentPhone = x.Parent?.Phone ?? string.Empty,
                ParentEmail = x.Parent?.Email ?? string.Empty,
                StudentId = x.StudentId,
                StudentName = x.Student?.FullName ?? string.Empty,
                StudentCode = x.Student?.UserCode ?? string.Empty,
                Relationship = x.Relationship,
                IsPrimaryContact = x.IsPrimaryContact,
                CreatedAt = x.CreatedAt
            };
        }
    }
}
