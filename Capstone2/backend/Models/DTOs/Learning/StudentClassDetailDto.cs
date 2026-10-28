using System.Collections.Generic;

namespace EduTrack.API.Models.DTOs.Learning
{
    public class StudentClassDetailDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public string Schedule { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int StudentCount { get; set; }
        public int AttendedLessons { get; set; }
        public int TotalLessons { get; set; }
        public string LatestTeacherNote { get; set; } = string.Empty;

        public string TeacherName { get; set; } = string.Empty;
        public string TeacherInitials { get; set; } = string.Empty;
        public string TeacherEmail { get; set; } = string.Empty;
        public string TeacherPhone { get; set; } = string.Empty;

        public List<ClassMaterialItemDto> Materials { get; set; } = new List<ClassMaterialItemDto>();
        public List<ClassAssignmentItemDto> Assignments { get; set; } = new List<ClassAssignmentItemDto>();
        public List<ClassSessionAttendanceItemDto> Sessions { get; set; } = new List<ClassSessionAttendanceItemDto>();
    }

    public class ClassMaterialItemDto
    {
        public int Id { get; set; }
        public int ClassId { get; set; }
        public string Type { get; set; } = "PDF";
        public string FileName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string UploadDate { get; set; } = string.Empty;
        public string UploadedBy { get; set; } = string.Empty;
        public decimal SizeMb { get; set; } = 2.0m;
    }

    public class ClassAssignmentItemDto
    {
        public int Id { get; set; }
        public int ClassId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string DueDate { get; set; } = string.Empty;
        public string Status { get; set; } = "Chưa nộp";
        public decimal? Score { get; set; }
        public decimal? AiScore { get; set; }
        public decimal MaxScore { get; set; } = 10.0m;
    }

    public class ClassSessionAttendanceItemDto
    {
        public int SessionId { get; set; }
        public int SessionNo { get; set; }
        public string Date { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public string Status { get; set; } = "present";
        public string StatusLabel { get; set; } = "Có mặt";
        public string Notes { get; set; } = string.Empty;
    }
}
