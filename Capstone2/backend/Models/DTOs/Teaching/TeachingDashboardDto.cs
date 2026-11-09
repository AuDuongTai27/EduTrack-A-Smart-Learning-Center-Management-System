using System;
using System.Collections.Generic;

namespace EduTrack.API.Models.DTOs.Teaching
{
    /// <summary>
    /// DTO tổng hợp dữ liệu Bảng điều khiển (Dashboard) cho Giáo viên (Teacher) và Trợ giảng (Teaching Assistant)
    /// </summary>
    public class TeachingDashboardDto
    {
        public TeachingProfileSummaryDto Profile { get; set; } = new();
        public TeachingKpiSummaryDto Kpis { get; set; } = new();
        public List<TodayClassSessionItemDto> TodayClasses { get; set; } = new();
        public List<TeachingNotificationItemDto> Notifications { get; set; } = new();
    }

    public class TeachingProfileSummaryDto
    {
        public int UserId { get; set; }
        public string UserCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Specialty { get; set; }
        public string? AvatarUrl { get; set; }
        public string RoleTitle { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class TeachingKpiSummaryDto
    {
        public int ActiveAssignments { get; set; }
        public int AssignmentsDueToday { get; set; }
        public int ActiveClasses { get; set; }
        public int ClassesToday { get; set; }
        public int TotalStudents { get; set; }
        public int PendingAttendance { get; set; }
    }

    public class TodayClassSessionItemDto
    {
        public int SessionId { get; set; }
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string? SubjectName { get; set; }
        public string? Room { get; set; }
        public string TimePeriod { get; set; } = string.Empty;
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string? Status { get; set; }
        public int StudentsCount { get; set; }
        public bool AttendanceTaken { get; set; }
    }

    public class TeachingNotificationItemDto
    {
        public int NotificationId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Sender { get; set; } = "Ban Giám Đốc EduTrack";
        public string Initials { get; set; } = "ET";
        public string InitialsBgClass { get; set; } = "bg-primary-subtle";
        public string InitialsColorClass { get; set; } = "text-primary";
        public bool IsNew { get; set; }
        public bool IsRead { get; set; }
        public string TimeAgo { get; set; } = "Hôm nay";
        public DateTime CreatedAt { get; set; }
    }
}

