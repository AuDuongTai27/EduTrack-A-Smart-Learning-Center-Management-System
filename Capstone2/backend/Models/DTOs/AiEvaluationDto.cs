using System;

namespace EduTrack.API.Models.DTOs
{
    public class AiEvaluationDto
    {
        public int EvaluationId { get; set; }
        public int SubmissionId { get; set; }
        public int RequestedBy { get; set; }
        public string RequesterName { get; set; } = null!;
        public decimal? AiScore { get; set; }
        public string? AiFeedback { get; set; }
        public string? RawResponse { get; set; }
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}
