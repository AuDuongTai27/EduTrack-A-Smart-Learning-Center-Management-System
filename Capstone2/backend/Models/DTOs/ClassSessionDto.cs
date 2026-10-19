using System;

namespace EduTrack.API.Models.DTOs
{
    public class ClassSessionDto
    {
        public int SessionId { get; set; }
        public int ClassId { get; set; }
        public string ClassName { get; set; } = null!;
        public int? ScheduleId { get; set; }
        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string? Room { get; set; }
        public string Status { get; set; } = null!;
    }
}
