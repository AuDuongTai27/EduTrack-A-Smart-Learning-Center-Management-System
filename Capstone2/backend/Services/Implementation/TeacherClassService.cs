using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class TeacherClassService : ITeacherClassService
    {
        private readonly ITeacherClassRepository _repository;

        public TeacherClassService(ITeacherClassRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<TeacherClassDto>> GetAllTeacherClassesAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<TeacherClassDto?> GetTeacherClassByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static TeacherClassDto MapToDto(TeacherClass x)
        {
            return new TeacherClassDto
            {
                TeacherClassId = x.TeacherClassId,
                TeacherId = x.TeacherId,
                TeacherName = x.Teacher?.FullName ?? string.Empty,
                TeacherCode = x.Teacher?.UserCode ?? string.Empty,
                ClassId = x.ClassId,
                ClassName = x.Class?.ClassName ?? string.Empty,
                AssignedAt = x.AssignedAt,
                Status = x.Status
            };
        }
    }
}
