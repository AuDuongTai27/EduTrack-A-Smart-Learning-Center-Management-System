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
}

