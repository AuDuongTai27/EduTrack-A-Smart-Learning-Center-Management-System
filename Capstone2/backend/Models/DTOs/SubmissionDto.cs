using System;

namespace EduTrack.API.Models.DTOs
{
    public class SubmissionDto
    {
        public int SubmissionId { get; set; }
        public int AssignmentId { get; set; }
        public string AssignmentTitle { get; set; } = null!;
        public int StudentId { get; set; }
        public string StudentName { get; set; } = null!;
        public string StudentCode { get; set; } = null!;
        public string? FileUrl { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public decimal? Score { get; set; }
        public string? Feedback { get; set; }
        public decimal? AiScore { get; set; }
        public string? AiFeedbackJson { get; set; }
        public string Status { get; set; } = null!;
        public int? GradedBy { get; set; }
        public string? GraderName { get; set; }
    }
}
