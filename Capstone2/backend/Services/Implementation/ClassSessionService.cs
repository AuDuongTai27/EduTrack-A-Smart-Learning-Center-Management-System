using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class ClassSessionService : IClassSessionService
    {
        private readonly IClassSessionRepository _repository;

        public ClassSessionService(IClassSessionRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ClassSessionDto>> GetAllClassSessionsAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<ClassSessionDto?> GetClassSessionByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static ClassSessionDto MapToDto(ClassSession x)
        {
            return new ClassSessionDto
            {
                SessionId = x.SessionId,
                ClassId = x.ClassId,
                ClassName = x.Class?.ClassName ?? string.Empty,
                ScheduleId = x.ScheduleId,
                SessionDate = x.SessionDate,
                StartTime = x.StartTime,
                EndTime = x.EndTime,
                Room = x.Room,
                Status = x.Status
            };
        }
    }
}
