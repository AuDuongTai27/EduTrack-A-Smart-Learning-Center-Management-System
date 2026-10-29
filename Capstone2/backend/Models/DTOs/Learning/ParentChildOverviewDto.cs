using System.Collections.Generic;

namespace EduTrack.API.Models.DTOs.Learning
{
    public class ParentChildOverviewDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public string School { get; set; } = string.Empty;
        public string Dob { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Relationship { get; set; } = string.Empty;
        public bool IsPrimaryContact { get; set; }
        public int ClassesCount { get; set; }
        public int AttendanceRate { get; set; }
        public decimal AverageScore { get; set; }
        public decimal UnpaidAmount { get; set; }
        public List<ParentChildClassDto> Classes { get; set; } = new List<ParentChildClassDto>();
    }

    public class ParentChildClassDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string SubjectClass { get; set; } = string.Empty;
        public string Badge { get; set; } = string.Empty;
        public string Teacher { get; set; } = string.Empty;
        public string TeacherInitials { get; set; } = string.Empty;
        public string Schedule { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public int AttendedLessons { get; set; }
        public int TotalLessons { get; set; }
        public string Notes { get; set; } = string.Empty;
    }
}
