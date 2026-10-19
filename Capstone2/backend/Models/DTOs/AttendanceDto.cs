using System;

namespace EduTrack.API.Models.DTOs
{
    public class AttendanceDto
    {
        public int AttendanceId { get; set; }
        public int SessionId { get; set; }
        public DateTime? SessionDate { get; set; }
        public int? ClassId { get; set; }
        public string? ClassName { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = null!;
        public string StudentCode { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? Note { get; set; }
        public int RecordedBy { get; set; }
        public string RecorderName { get; set; } = null!;
        public DateTime RecordedAt { get; set; }
    }
}
