using System;

namespace EduTrack.API.Models.DTOs
{
    public class TeacherClassDto
    {
        public int TeacherClassId { get; set; }
        public int TeacherId { get; set; }
        public string TeacherName { get; set; } = null!;
        public string TeacherCode { get; set; } = null!;
        public int ClassId { get; set; }
        public string ClassName { get; set; } = null!;
        public DateTime AssignedAt { get; set; }
        public string Status { get; set; } = null!;
    }
}
