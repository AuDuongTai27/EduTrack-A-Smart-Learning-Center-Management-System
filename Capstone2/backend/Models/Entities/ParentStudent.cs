using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("parent_students")]
    public class ParentStudent
    {
        [Column("parent_id")]
        public int ParentId { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Required]
        [StringLength(50)]
        [Column("relationship")]
        public string Relationship { get; set; } = "Parent";

        [Column("is_primary_contact")]
        public bool IsPrimaryContact { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("ParentId")]
        public virtual User Parent { get; set; } = null!;

        [ForeignKey("StudentId")]
        public virtual User Student { get; set; } = null!;
    }
}
