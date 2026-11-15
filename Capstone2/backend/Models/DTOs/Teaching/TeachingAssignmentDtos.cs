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
    /// DTO yêu cầu cập nhật bài tập
    /// </summary>
    public class UpdateTeachingAssignmentRequestDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public string? AssignmentType { get; set; }
        public string? FileUrl { get; set; }
        public decimal? MaxScore { get; set; }
        public bool? IsAiGradingEnabled { get; set; }
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

    /// <summary>
    /// DTO hiển thị bài nộp của học sinh
    /// </summary>
    public class TeachingSubmissionItemDto
    {
        public int SubmissionId { get; set; }
        public int AssignmentId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        public string? StudentAvatarUrl { get; set; }
        public string? FileUrl { get; set; }
        public string SubmittedAt { get; set; } = string.Empty;
        public string SubmittedAtFormatted { get; set; } = string.Empty;
        public decimal? Score { get; set; }
        public string? Feedback { get; set; }
        public decimal? AiScore { get; set; }
        public string Status { get; set; } = "submitted";
        public int? GradedBy { get; set; }
        public string? GraderName { get; set; }
    }

    /// <summary>
    /// DTO yêu cầu chấm điểm bài nộp học sinh
    /// </summary>
    public class GradeTeachingSubmissionRequestDto
    {
        public decimal Score { get; set; }
        public string? Feedback { get; set; }
        public int GradedBy { get; set; } = 3;
    }
}
