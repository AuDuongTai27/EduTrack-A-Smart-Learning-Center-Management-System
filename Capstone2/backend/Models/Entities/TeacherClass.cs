using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("teacher_classes")]
    public class TeacherClass
    {
        [Key]
        [Column("teacher_class_id")]
        public int TeacherClassId { get; set; }

        [Column("teacher_id")]
        public int TeacherId { get; set; }

        [Column("class_id")]
        public int ClassId { get; set; }

        [Column("assigned_at")]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(20)]
        [Column("status")]
        public string Status { get; set; } = "active";

        // Navigation Properties
        [ForeignKey("TeacherId")]
        public virtual User Teacher { get; set; } = null!;

        [ForeignKey("ClassId")]
        public virtual Class Class { get; set; } = null!;
    }
}
