using System;

namespace EduTrack.API.Models.DTOs
{
    public class NotificationDto
    {
        public int NotificationId { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public int? ClassId { get; set; }
        public string? ClassName { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string Type { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }

        public int? SenderId { get; set; }
        public string? SenderName { get; set; }
        public string? TargetScope { get; set; }
        public string? TargetRole { get; set; }
        public int? RecipientCount { get; set; }
        public DateTime? ReadAt { get; set; }
    }
}
