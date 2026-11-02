using System;

namespace EduTrack.API.Models.DTOs.Teaching
{
    /// <summary>
    /// DTO thông tin ca học trong Thời khóa biểu cá nhân của Giáo viên hoặc Trợ giảng
    /// </summary>
    public class TeachingScheduleItemDto
    {
        public int ScheduleId { get; set; }
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string? SubjectName { get; set; }
        public string? Room { get; set; }
        public string DayOfWeek { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public int StudentCount { get; set; }
        public string? TeacherName { get; set; }
        public string? TaName { get; set; }
        public string? PartnerName { get; set; }
        public string Status { get; set; } = "active";
    }
}

