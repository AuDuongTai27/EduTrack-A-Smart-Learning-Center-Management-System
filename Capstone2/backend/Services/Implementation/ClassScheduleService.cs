using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Schedule;

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
            return list.SelectMany(root => ScheduleTimeline.At(new[] {root}, ScheduleTimeline.ListingDate(root.Class.StartDate))
                .Select(version => MapToDto(root, version)));
        }

        public async Task<ClassScheduleDto?> GetClassScheduleByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            if (item == null) return null;
            var version = ScheduleTimeline.At(item, ScheduleTimeline.ListingDate(item.Class.StartDate));
            return version == null ? null : MapToDto(item, version);
        }

        private static ClassScheduleDto MapToDto(ClassSchedule root, ClassScheduleVersion x)
        {
            return new ClassScheduleDto
            {
                ScheduleId = x.ScheduleId,
                ClassId = root.ClassId,
                ClassName = root.Class?.ClassName ?? string.Empty,
                DayOfWeek = x.DayOfWeek,
                StartTime = x.StartTime,
                EndTime = x.EndTime,
                Room = x.Room
            };
        }
    }
}
