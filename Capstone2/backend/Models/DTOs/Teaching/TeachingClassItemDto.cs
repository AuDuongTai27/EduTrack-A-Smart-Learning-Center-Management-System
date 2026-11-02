using System;

namespace EduTrack.API.Models.DTOs.Teaching
{
    /// <summary>
    /// DTO thông tin Lớp học do Giáo viên hoặc Trợ giảng phụ trách
    /// </summary>
    public class TeachingClassItemDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string? Room { get; set; }
        public decimal TuitionFee { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; } = "active";
        public int StudentCount { get; set; }
        public string? TeacherName { get; set; }
        public string? TaName { get; set; }
        public string? PartnerName { get; set; }
        public string? ScheduleSummary { get; set; }
    }

    /// <summary>
    /// DTO thông tin học sinh trong lớp học dành cho Giáo viên / Trợ giảng
    /// </summary>
    public class TeachingClassStudentItemDto
    {
        public int StudentId { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Gender { get; set; }
        public string? Dob { get; set; }
        public string? EnrollmentDate { get; set; }
        public string Status { get; set; } = "active";
        public string? ParentName { get; set; }
        public string? ParentPhone { get; set; }
        public int AttendanceRate { get; set; } = 100;
        public int TotalAttendedSessions { get; set; }
        public int TotalSessions { get; set; }
    }
}
