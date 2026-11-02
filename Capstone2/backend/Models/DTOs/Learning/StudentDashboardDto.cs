using System.Collections.Generic;

namespace EduTrack.API.Models.DTOs.Learning
{
    public class StudentDashboardDto
    {
        public int StudentId { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string AvatarInitials { get; set; } = string.Empty;
        public int EnrolledClassesCount { get; set; }
        public int PendingAssignmentsCount { get; set; }
        public List<StudentEnrolledClassDto> Classes { get; set; } = new List<StudentEnrolledClassDto>();
    }

    public class StudentEnrolledClassDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string TeacherName { get; set; } = string.Empty;
        public string TeacherInitials { get; set; } = string.Empty;
        public string ScheduleText { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public int AttendedLessons { get; set; }
        public int TotalLessons { get; set; }
        public string Status { get; set; } = "active";
    }
}
