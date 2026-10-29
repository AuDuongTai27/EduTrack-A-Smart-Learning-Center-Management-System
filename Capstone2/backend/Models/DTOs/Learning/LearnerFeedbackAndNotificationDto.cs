using System;

namespace EduTrack.API.Models.DTOs.Learning
{
    public class LearnerFeedbackItemDto
    {
        public int RequestId { get; set; }
        public string RequestCode { get; set; } = string.Empty;
        public string RequestType { get; set; } = "feedback";
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? StudentId { get; set; }
        public string? StudentName { get; set; }
        public int? ClassId { get; set; }
        public string? ClassName { get; set; }
        public int RequestedBy { get; set; }
        public string RequesterName { get; set; } = string.Empty;
        public string RequesterRole { get; set; } = "student";
        public int? ReviewedBy { get; set; }
        public string? ReviewerName { get; set; }
        public string Priority { get; set; } = "medium";
        public string Status { get; set; } = "pending";
        public string StatusLabel { get; set; } = "Chưa xem xét giải quyết";
        public bool CanEdit { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
    }

    public class CreateLearnerFeedbackRequestDto
    {
        public int UserId { get; set; }
        public int? StudentId { get; set; }
        public int? ClassId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = "medium";
    }

    public class UpdateLearnerFeedbackRequestDto
    {
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class LearnerNotificationItemDto
    {
        public int NotificationId { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public int? ClassId { get; set; }
        public string? ClassName { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Type { get; set; } = "system";
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
