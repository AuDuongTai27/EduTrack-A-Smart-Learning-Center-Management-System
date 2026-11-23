using System;
using System.Collections.Generic;

namespace EduTrack.API.Models.DTOs
{
    public class UserSpecialtyGroupDto
    {
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = null!;
        public List<int> GradeIds { get; set; } = new();
        public List<string> GradeNames { get; set; } = new();
    }

    public class UserDto
    {
        public int UserId { get; set; }
        public string UserCode { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Specialty { get; set; }
        public int? GradeId { get; set; }
        public string? GradeName { get; set; }
        public List<UserSpecialtyGroupDto> SubjectGrades { get; set; } = new();
        public List<int> SubjectIds { get; set; } = new();
        public List<string> SubjectNames { get; set; } = new();
        public List<int> GradeIds { get; set; } = new();
        public List<string> GradeNames { get; set; } = new();
        public DateTime? EnrolledSince { get; set; }
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public List<string> Roles { get; set; } = new();
    }
}
