using System;

namespace EduTrack.API.Models.DTOs.Teaching
{
    /// <summary>
    /// DTO thông tin chi tiết Hồ sơ cá nhân của Giáo viên (Teacher) và Trợ giảng (Teaching Assistant)
    /// </summary>
    public class TeacherProfileDto
    {
        public int UserId { get; set; }
        public string UserCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string DateOfBirth { get; set; } = string.Empty;
        public string Gender { get; set; } = "Nam";
        public string EnrolledSince { get; set; } = string.Empty;
        public string Specialty { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string RoleTitle { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int ActiveClassesCount { get; set; }
        public int TotalStudentsCount { get; set; }
    }

    /// <summary>
    /// DTO yêu cầu cập nhật hồ sơ cá nhân GV / TA
    /// </summary>
    public class UpdateTeacherProfileRequestDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Specialty { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Address { get; set; }
    }
}

