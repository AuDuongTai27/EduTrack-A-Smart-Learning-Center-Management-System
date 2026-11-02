using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class CreateManagementNotificationDto
    {
        [Range(1, int.MaxValue)]
        public int SenderId { get; set; }

        [Required, StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        [Required, StringLength(4000, MinimumLength = 1)]
        public string Content { get; set; } = string.Empty;

        [Required, StringLength(20)]
        public string Type { get; set; } = "announcement";

        // all | role | class | user
        [Required, StringLength(20)]
        public string TargetScope { get; set; } = "all";

        public string? TargetRole { get; set; }
        public int? ClassId { get; set; }
        public int? UserId { get; set; }
    }
}
