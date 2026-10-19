using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class StudentClassService : IStudentClassService
    {
        private readonly IStudentClassRepository _repository;

        public StudentClassService(IStudentClassRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<StudentClassDto>> GetAllStudentClassesAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<StudentClassDto?> GetStudentClassByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static StudentClassDto MapToDto(StudentClass x)
        {
            return new StudentClassDto
            {
                ScId = x.ScId,
                StudentId = x.StudentId,
                StudentName = x.Student?.FullName ?? string.Empty,
                StudentCode = x.Student?.UserCode ?? string.Empty,
                ClassId = x.ClassId,
                ClassName = x.Class?.ClassName ?? string.Empty,
                EnrolledDate = x.EnrolledDate,
                Status = x.Status,
                DroppedAt = x.DroppedAt,
                DropReason = x.DropReason
            };
        }
    }
}
