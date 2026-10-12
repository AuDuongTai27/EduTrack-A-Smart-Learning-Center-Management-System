using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("notifications")]
    public class Notification
    {
        [Key]
        [Column("notification_id")]
        public int NotificationId { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }

        [Column("class_id")]
        public int? ClassId { get; set; }

        [Required]
        [StringLength(200)]
        [Column("title")]
        public string Title { get; set; } = null!;

        [Required]
        [Column("content")]
        public string Content { get; set; } = null!;

        [Required]
        [StringLength(20)]
        [Column("type")]
        public string Type { get; set; } = "system";

        [Column("is_read")]
        public bool IsRead { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("ClassId")]
        public virtual Class? Class { get; set; }
    }
}
