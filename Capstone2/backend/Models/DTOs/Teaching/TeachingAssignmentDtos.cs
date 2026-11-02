using System;
using System.Collections.Generic;

namespace EduTrack.API.Models.DTOs.Teaching
{
    /// <summary>
    /// DTO yêu cầu tạo bài tập mới cho lớp học
    /// </summary>
    public class CreateTeachingAssignmentRequestDto
    {
        public int ClassId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime DueDate { get; set; } = DateTime.UtcNow.AddDays(7);
        public string? AssignmentType { get; set; } = "Written Assignment";
        public string? FileUrl { get; set; }
        public decimal MaxScore { get; set; } = 10.00m;
        public int CreatedBy { get; set; } = 3; // Mặc định ThS. Hoàng Quốc Việt (TC001)
        public bool IsAiGradingEnabled { get; set; } = true;
    }

    /// <summary>
    /// DTO hiển thị thông tin bài tập
    /// </summary>
    public class TeachingAssignmentItemDto
    {
        public int AssignmentId { get; set; }
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? FileUrl { get; set; }
        public string DueDate { get; set; } = string.Empty;
        public string DueDateFormatted { get; set; } = string.Empty;
        public decimal MaxScore { get; set; } = 10.00m;
        public int CreatedBy { get; set; }
        public string CreatorName { get; set; } = string.Empty;
        public string? AssignmentType { get; set; } = "Written Assignment";
        public int SubmissionCount { get; set; }
        public int GradedCount { get; set; }
        public string Status { get; set; } = "active";
        public bool IsAiGradingEnabled { get; set; } = true;
        public string CreatedAt { get; set; } = string.Empty;
    }
}

