using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("notification_recipients")]
    public class NotificationRecipient
    {
        [Key]
        [Column("recipient_id")]
        public int RecipientId { get; set; }

        [Column("notification_id")]
        public int NotificationId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("is_read")]
        public bool IsRead { get; set; } = false;

        [Column("read_at")]
        public DateTime? ReadAt { get; set; }

        // Ẩn khỏi hộp thư của người nhận, không xóa thông báo gốc.
        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        public virtual Notification Notification { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
