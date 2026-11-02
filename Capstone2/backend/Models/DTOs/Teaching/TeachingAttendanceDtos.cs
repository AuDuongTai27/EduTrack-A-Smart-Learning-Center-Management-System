using System;
using System.Collections.Generic;

namespace EduTrack.API.Models.DTOs.Teaching
{
    /// <summary>
    /// DTO thông tin buổi học trong danh sách chọn điểm danh
    /// </summary>
    public class TeachingSessionItemDto
    {
        public int SessionId { get; set; }
        public int ClassId { get; set; }
        public string SessionDate { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string TimePeriod { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public string Status { get; set; } = "scheduled"; // scheduled, in_progress, completed, cancelled
        public string Title { get; set; } = string.Empty;
        public bool IsRecorded { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
        public int LateCount { get; set; }
        public int ExcusedCount { get; set; }
        public int TotalRecorded { get; set; }
    }

    /// <summary>
    /// DTO thông tin điểm danh của từng học sinh trong buổi học
    /// </summary>
    public class TeachingStudentAttendanceItemDto
    {
        public int StudentId { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public int? AttendanceId { get; set; }
        public string Status { get; set; } = "present"; // present, absent, late, excused
        public string? Note { get; set; }
        public int? RecordedBy { get; set; }
        public string? RecorderName { get; set; }
        public string? RecordedAt { get; set; }
        public bool IsRecorded { get; set; }
    }

    /// <summary>
    /// Thống kê sĩ số và điểm danh của buổi học
    /// </summary>
    public class TeachingAttendanceStatsDto
    {
        public int TotalStudents { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
        public int LateCount { get; set; }
        public int ExcusedCount { get; set; }
        public double AttendanceRate { get; set; }
    }

    /// <summary>
    /// DTO toàn bộ bảng điểm danh của lớp cho một buổi học cụ thể
    /// </summary>
    public class TeachingClassAttendanceSheetDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public TeachingSessionItemDto? CurrentSession { get; set; }
        public List<TeachingSessionItemDto> AvailableSessions { get; set; } = new();
        public List<TeachingStudentAttendanceItemDto> Students { get; set; } = new();
        public TeachingAttendanceStatsDto Stats { get; set; } = new();
    }

    /// <summary>
    /// DTO từng phần tử gửi lên khi lưu điểm danh
    /// </summary>
    public class StudentAttendanceInputDto
    {
        public int StudentId { get; set; }
        public string Status { get; set; } = "present";
        public string? Note { get; set; }
    }

    /// <summary>
    /// DTO request lưu điểm danh đồng loạt cả lớp
    /// </summary>
    public class SaveBulkTeachingAttendanceRequestDto
    {
        public int ClassId { get; set; }
        public int SessionId { get; set; }
        public int RecordedBy { get; set; }
        public List<StudentAttendanceInputDto> Items { get; set; } = new();
    }

    /// <summary>
    /// DTO request cập nhật trạng thái điểm danh của 1 học sinh
    /// </summary>
    public class UpdateSingleAttendanceRequestDto
    {
        public string Status { get; set; } = "present";
        public string? Note { get; set; }
        public int RecordedBy { get; set; }
    }
}

