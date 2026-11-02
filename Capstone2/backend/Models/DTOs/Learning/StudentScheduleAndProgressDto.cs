using System.Collections.Generic;

namespace EduTrack.API.Models.DTOs.Learning
{
    public class StudentScheduleSlotDto
    {
        public string Id { get; set; } = string.Empty;
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public int StartH { get; set; }
        public int StartM { get; set; }
        public int EndH { get; set; }
        public int EndM { get; set; }
        public string Teacher { get; set; } = string.Empty;
        public string Initials { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public int Day { get; set; } // 0 = Mon .. 6 = Sun
        public string Status { get; set; } = "upcoming"; // upcoming, ongoing, completed, cancelled
    }

    public class StudentProgressOverviewDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public int OverallAttendanceRate { get; set; }
        public int AttendedSessionsCount { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
        public int LateCount { get; set; }
        public int TotalSessionsCount { get; set; }
        public int EnrolledClassesCount { get; set; }
        public List<StudentProgressClassDto> CurrentClasses { get; set; } = new List<StudentProgressClassDto>();
    }

    public class StudentProgressClassDto
    {
        public string Id { get; set; } = string.Empty;
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public int Attended { get; set; }
        public int Total { get; set; }
        public int Percentage { get; set; }
        public bool IsCompleted { get; set; }
        public List<StudentProgressFeedbackDto> Feedbacks { get; set; } = new List<StudentProgressFeedbackDto>();
    }

    public class StudentProgressFeedbackDto
    {
        public string AssignmentTitle { get; set; } = string.Empty;
        public string Quote { get; set; } = string.Empty;
        public string TeacherName { get; set; } = string.Empty;
        public string StatusType { get; set; } = "dat"; // dat, chuadat, canluuy, chuacham
        public string StatusIcon { get; set; } = "bi-check2-all";
        public string StatusLabel { get; set; } = "Đạt";
    }
}
