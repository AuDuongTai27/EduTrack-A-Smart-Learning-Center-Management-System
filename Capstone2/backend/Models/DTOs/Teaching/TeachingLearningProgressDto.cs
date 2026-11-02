using System.Collections.Generic;

namespace EduTrack.API.Models.DTOs.Teaching
{
    /// <summary>
    /// Thông tin tiến độ học tập và điểm danh của một học sinh trong lớp
    /// </summary>
    public class TeachingStudentProgressItemDto
    {
        public int StudentId { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string AvatarInitials { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        // Điểm danh (Attendance)
        public int PresentDays { get; set; }
        public int AbsentDays { get; set; }
        public int LateDays { get; set; }
        public int TotalDays { get; set; }
        public int AttendancePercentage { get; set; }
        public string AttendanceStatus { get; set; } = "Present"; // Present, Late, Absent

        // Bài tập mới nhất (Latest Assignment)
        public string LatestAssignmentTitle { get; set; } = string.Empty;
        public string LatestAssignmentStatus { get; set; } = "Submitted"; // Submitted, Late, Missing, Pending, Graded
        public decimal? LatestAssignmentScore { get; set; }
        public decimal? MaxScore { get; set; }

        // Ghi chú / Nhận xét gần nhất
        public string? LatestNote { get; set; }
    }

    /// <summary>
    /// Báo cáo tiến độ học tập tổng thể của một lớp học
    /// </summary>
    public class TeachingClassProgressDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string TeacherName { get; set; } = string.Empty;
        public int TotalStudents { get; set; }
        public int TotalSessions { get; set; }
        public int CompletedSessions { get; set; }
        public string LatestAssignmentTitle { get; set; } = string.Empty;
        public List<TeachingStudentProgressItemDto> Students { get; set; } = new();
    }
}

