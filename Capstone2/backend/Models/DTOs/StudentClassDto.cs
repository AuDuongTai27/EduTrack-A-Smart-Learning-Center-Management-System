using System;

namespace EduTrack.API.Models.DTOs
{
    public class StudentClassDto
    {
        public int ScId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = null!;
        public string StudentCode { get; set; } = null!;
        public int ClassId { get; set; }
        public string ClassName { get; set; } = null!;
        public DateTime? EnrolledDate { get; set; }
        public string Status { get; set; } = null!;
        public DateTime? DroppedAt { get; set; }
        public string? DropReason { get; set; }
    }
}
