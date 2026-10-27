using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class ClassService : IClassService
    {
        private readonly IClassRepository _repository;

        public ClassService(IClassRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ClassDto>> GetAllClassesAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<ClassDto?> GetClassByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static ClassDto MapToDto(Class x)
        {
            return new ClassDto
            {
                ClassId = x.ClassId,
                ClassName = x.ClassName,
                SubjectId = x.SubjectId,
                SubjectName = x.Subject?.SubjectName ?? string.Empty,
                SubjectCode = x.Subject?.SubjectCode ?? string.Empty,
                Room = x.Room,
                TuitionFee = x.TuitionFee,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                Status = x.Status
            };
        }
    }
}
