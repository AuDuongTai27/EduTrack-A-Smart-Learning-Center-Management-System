using System;

namespace EduTrack.API.Models.DTOs.Learning
{
    public class StudentAssignmentDetailDto
    {
        public int AssignmentId { get; set; }
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? FileUrl { get; set; }
        public string DueDate { get; set; } = string.Empty;
        public decimal MaxScore { get; set; } = 10.0m;
        public bool IsAiGradingEnabled { get; set; } = true;
        public string? RubricJson { get; set; }
        public StudentSubmissionDetailDto? Submission { get; set; }
    }

    public class StudentSubmissionDetailDto
    {
        public int SubmissionId { get; set; }
        public int AssignmentId { get; set; }
        public int StudentId { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string SubmittedAt { get; set; } = string.Empty;
        public decimal? Score { get; set; }
        public string? Feedback { get; set; }
        public decimal? AiScore { get; set; }
        public string? AiFeedbackJson { get; set; }
        public string? AiSummary { get; set; }
        public string Status { get; set; } = "submitted";
    }

    public class SubmitHomeworkRequestDto
    {
        public int AssignmentId { get; set; }
        public int StudentId { get; set; } = 6;
        public string? FileName { get; set; }
        public string? FileUrl { get; set; }
        public string? FileSizeText { get; set; }
    }
}
