using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("student_classes")]
    public class StudentClass
    {
        [Key]
        [Column("sc_id")]
        public int ScId { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("class_id")]
        public int ClassId { get; set; }

        [Column("enrolled_date")]
        public DateTime? EnrolledDate { get; set; }

        [Required]
        [StringLength(20)]
        [Column("status")]
        public string Status { get; set; } = "active";

        [Column("dropped_at")]
        public DateTime? DroppedAt { get; set; }

        [Column("drop_reason")]
        public string? DropReason { get; set; }

        // Navigation Properties
        [ForeignKey("StudentId")]
        public virtual User Student { get; set; } = null!;

        [ForeignKey("ClassId")]
        public virtual Class Class { get; set; } = null!;
    }
}
