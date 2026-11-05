using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Teaching
{
    /// <summary>
    /// Thông tin tiến độ học tập và điểm danh của một học sinh trong lớp
    /// </summary>
    public class TeachingStudentProgressItemDto
    {
        public int StudentId { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string AvatarInitials { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        // Điểm danh (Attendance)
        public int PresentDays { get; set; }
        public int AbsentDays { get; set; }
        public int LateDays { get; set; }
        public int TotalDays { get; set; }
        public int AttendancePercentage { get; set; }
        public string AttendanceStatus { get; set; } = "Present"; // Present, Late, Absent

        // Bài tập mới nhất (Latest Assignment)
        public string LatestAssignmentTitle { get; set; } = string.Empty;
        public string LatestAssignmentStatus { get; set; } = "Submitted"; // Submitted, Late, Missing, Pending, Graded
        public decimal? LatestAssignmentScore { get; set; }
        public decimal? MaxScore { get; set; }

        // Ghi chú / Nhận xét gần nhất
        public string? LatestNote { get; set; }
    }

    /// <summary>
    /// Báo cáo tiến độ học tập tổng thể của một lớp học
    /// </summary>
    public class TeachingClassProgressDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string TeacherName { get; set; } = string.Empty;
        public int TotalStudents { get; set; }
        public int TotalSessions { get; set; }
        public int CompletedSessions { get; set; }
        public string LatestAssignmentTitle { get; set; } = string.Empty;
        public List<TeachingStudentProgressItemDto> Students { get; set; } = new();
    }

    /// <summary>
    /// Chi tiết bài tập của một học sinh trong môn học
    /// </summary>
    public class TeachingStudentAssignmentDetailItemDto
    {
        public int AssignmentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string WeekTitle { get; set; } = string.Empty;
        public string DueDate { get; set; } = string.Empty;
        public string? SubmittedAt { get; set; }
        public string Status { get; set; } = "pending"; // graded, submitted, late, missing, pending
        public decimal? Score { get; set; }
        public decimal MaxScore { get; set; } = 10;
        public decimal? AiScore { get; set; }
        public string? SubmissionFileUrl { get; set; }
        public string? TeacherFeedback { get; set; }
        public string? AiFeedback { get; set; }
    }

    /// <summary>
    /// Đánh giá cá nhân của GV/TA đối với học sinh (lưu trữ trong progress_notes)
    /// </summary>
    public class TeachingStudentEvaluationItemDto
    {
        public int Id { get; set; }
        public string EvaluatorName { get; set; } = string.Empty;
        public string EvaluatorRole { get; set; } = "Giáo viên";
        public string EvaluationType { get; set; } = "attitude";
        public string TypeLabel { get; set; } = "Thái độ & Tinh thần học tập";
        public string Rating { get; set; } = "good";
        public string RatingLabel { get; set; } = "Tốt / Đạt yêu cầu";
        public string Content { get; set; } = string.Empty;
        public string? Suggestions { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
    }

    /// <summary>
    /// Chi tiết toàn diện về một học sinh trong môn học (phục vụ trang Student Progress Detail)
    /// </summary>
    public class TeachingStudentProgressDetailDto
    {
        public int StudentId { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string AvatarInitials { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int PresentDays { get; set; }
        public int AbsentDays { get; set; }
        public int TotalDays { get; set; }
        public int AttendancePercentage { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string AvgScore { get; set; } = "9.0";
        public List<TeachingStudentAssignmentDetailItemDto> Assignments { get; set; } = new();
        public List<TeachingStudentEvaluationItemDto> Evaluations { get; set; } = new();
    }

    /// <summary>
    /// Yêu cầu tạo mới đánh giá cá nhân từ GV hoặc TA
    /// </summary>
    public class CreateTeachingEvaluationRequest
    {
        public int ClassId { get; set; }
        public int StudentId { get; set; }
        public string EvaluatorName { get; set; } = string.Empty;
        public string EvaluatorRole { get; set; } = "Giáo viên";
        public string EvaluationType { get; set; } = "attitude";
        public string TypeLabel { get; set; } = "Thái độ & Tinh thần học tập";
        public string Rating { get; set; } = "good";
        public string RatingLabel { get; set; } = "Tốt / Đạt yêu cầu";
        [Required]
        public string Content { get; set; } = string.Empty;
        public string? Suggestions { get; set; }
    }
}
