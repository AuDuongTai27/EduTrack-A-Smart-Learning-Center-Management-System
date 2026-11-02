using System;
using System.Collections.Generic;

namespace EduTrack.API.Models.DTOs.Landing
{
    public class LandingCenterInfoDto
    {
        public string CenterName { get; set; } = "EduTrack Smart Learning Center";
        public string Slogan { get; set; } = "Đồng Hành Cùng Tri Thức - Nâng Tầm Tương Lai";
        public string Address { get; set; } = "123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh";
        public string Hotline { get; set; } = "1900 6868";
        public string Email { get; set; } = "contact@edutrack.edu.vn";
        public string AcademicYear { get; set; } = "2026 - 2027";
    }

    public class LandingStatsDto
    {
        public int TotalStudents { get; set; }
        public int TotalCourses { get; set; }
        public int TotalSchedules { get; set; }
        public int TotalTrainers { get; set; }
    }

    public class LandingSubjectItemDto
    {
        public int SubjectId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int ActiveClassesCount { get; set; }
    }

    public class LandingCourseItemDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public decimal TuitionFee { get; set; }
        public string Room { get; set; } = string.Empty;
        public string TeacherName { get; set; } = string.Empty;
        public string? TeacherAvatar { get; set; }
        public int StudentsCount { get; set; }
        public int LikesCount { get; set; } = 45;
        public string ImageUrl { get; set; } = "/assets/img/course-1.webp";
    }

    public class LandingTrainerItemDto
    {
        public int UserId { get; set; }
        public string UserCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Specialty { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string RoleTitle { get; set; } = "Giảng viên chuyên môn";
    }

    public class LandingOverviewDto
    {
        public LandingCenterInfoDto CenterInfo { get; set; } = new();
        public LandingStatsDto Stats { get; set; } = new();
        public List<LandingSubjectItemDto> Subjects { get; set; } = new();
        public List<LandingCourseItemDto> Courses { get; set; } = new();
        public List<LandingTrainerItemDto> Trainers { get; set; } = new();
    }

    public class SubscribeNewsletterRequestDto
    {
        public string Email { get; set; } = string.Empty;
    }
}

