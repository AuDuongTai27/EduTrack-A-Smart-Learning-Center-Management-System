using System;

namespace EduTrack.API.Models.DTOs
{
    public class SubjectDto
    {
        public int SubjectId { get; set; }
        public string SubjectCode { get; set; } = null!;
        public string SubjectName { get; set; } = null!;
        public string? Description { get; set; }
        public int TotalClasses { get; set; }
    }
}
