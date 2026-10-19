using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class ClassScheduleService : IClassScheduleService
    {
        private readonly IClassScheduleRepository _repository;

        public ClassScheduleService(IClassScheduleRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ClassScheduleDto>> GetAllClassSchedulesAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<ClassScheduleDto?> GetClassScheduleByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static ClassScheduleDto MapToDto(ClassSchedule x)
        {
            return new ClassScheduleDto
            {
                ScheduleId = x.ScheduleId,
                ClassId = x.ClassId,
                ClassName = x.Class?.ClassName ?? string.Empty,
                DayOfWeek = x.DayOfWeek,
                StartTime = x.StartTime,
                EndTime = x.EndTime,
                Room = x.Room
            };
        }
    }
}
