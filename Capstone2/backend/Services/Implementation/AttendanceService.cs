using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class AttendanceService : IAttendanceService
    {
        private readonly IAttendanceRepository _repository;

        public AttendanceService(IAttendanceRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<AttendanceDto>> GetAllAttendancesAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<AttendanceDto?> GetAttendanceByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static AttendanceDto MapToDto(Attendance x)
        {
            return new AttendanceDto
            {
                AttendanceId = x.AttendanceId,
                SessionId = x.SessionId,
                SessionDate = x.Session?.SessionDate,
                ClassId = x.Session?.ClassId,
                ClassName = x.Session?.Class?.ClassName,
                StudentId = x.StudentId,
                StudentName = x.Student?.FullName ?? string.Empty,
                StudentCode = x.Student?.UserCode ?? string.Empty,
                Status = x.Status,
                Note = x.Note,
                RecordedBy = x.RecordedBy,
                RecorderName = x.Recorder?.FullName ?? string.Empty,
                RecordedAt = x.RecordedAt
            };
        }
    }
}
