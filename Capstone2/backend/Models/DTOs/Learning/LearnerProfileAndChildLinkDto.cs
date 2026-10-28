namespace EduTrack.API.Models.DTOs.Learning
{
    public class LearnerProfileDto
    {
        public int UserId { get; set; }
        public string UserCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string DateOfBirth { get; set; } = string.Empty;
        public string Gender { get; set; } = "Nam";
        public string EnrolledSince { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string IdentityCard { get; set; } = "001085012345";
        public string Relationship { get; set; } = "Phụ huynh";
    }

    public class UpdateLearnerProfileRequestDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Address { get; set; }
    }
}
