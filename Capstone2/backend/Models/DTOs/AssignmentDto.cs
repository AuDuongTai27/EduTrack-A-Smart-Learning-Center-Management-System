using System;

namespace EduTrack.API.Models.DTOs
{
    public class AssignmentDto
    {
        public int AssignmentId { get; set; }
        public int ClassId { get; set; }
        public string ClassName { get; set; } = null!;
        public int? ContentUnitId { get; set; }
        public string? ContentUnitTitle { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? FileUrl { get; set; }
        public DateTime DueDate { get; set; }
        public decimal MaxScore { get; set; }
        public int CreatedBy { get; set; }
        public string CreatorName { get; set; } = null!;
        public bool IsAiGradingEnabled { get; set; }
    }
}
