using System;

namespace EduTrack.API.Models.DTOs.Teaching
{
    /// <summary>
    /// DTO chi tiết thông báo dành cho Giáo viên (Teacher) và Trợ giảng (Teaching Assistant)
    /// </summary>
    public class TeachingNotificationDto
    {
        public int NotificationId { get; set; }
        public int? UserId { get; set; }
        public int? ClassId { get; set; }
        public string? ClassName { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Sender { get; set; } = "EduTrack Staff";
        public string Initials { get; set; } = "ES";
        public string InitialsBgClass { get; set; } = "bg-primary-subtle";
        public string InitialsColorClass { get; set; } = "text-primary";
        public string Type { get; set; } = "system";
        public bool IsNew { get; set; }
        public bool IsRead { get; set; }
        public string TimeAgo { get; set; } = "Hôm nay";
        public DateTime CreatedAt { get; set; }
    }
}

