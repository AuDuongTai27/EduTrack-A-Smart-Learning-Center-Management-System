using System;
using System.Collections.Generic;

namespace EduTrack.API.Models.DTOs.Landing
{
    public class LandingCenterInfoDto
    {
        public string CenterName { get; set; } = "EduTrack Smart Learning Center";
        public string Slogan { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Hotline { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
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
        public int LikesCount { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int? GradeId { get; set; }
        public string? GradeName { get; set; }
        public List<LandingSessionDto> UpcomingSessions { get; set; } = new();
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
        public string RoleTitle { get; set; } = string.Empty;
        public List<LandingSubjectItemDto> Subjects { get; set; } = new();
    }

    public record LandingSessionDto(string Date, string StartTime, string EndTime);

    public class LandingClassesPageDto
    {
        public List<LandingCourseItemDto> Items { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public bool HasMore => (long)Page * PageSize < TotalCount;
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

