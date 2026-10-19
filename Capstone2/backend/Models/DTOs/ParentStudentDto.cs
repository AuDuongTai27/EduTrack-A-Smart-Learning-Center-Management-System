using System;

namespace EduTrack.API.Models.DTOs
{
    public class ParentStudentDto
    {
        public int ParentId { get; set; }
        public string ParentName { get; set; } = null!;
        public string ParentPhone { get; set; } = null!;
        public string ParentEmail { get; set; } = null!;

        public int StudentId { get; set; }
        public string StudentName { get; set; } = null!;
        public string StudentCode { get; set; } = null!;

        public string Relationship { get; set; } = null!;
        public bool IsPrimaryContact { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
