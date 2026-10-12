using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("subjects")]
    public class Subject
    {
        [Key]
        [Column("subject_id")]
        public int SubjectId { get; set; }

        [Required]
        [StringLength(20)]
        [Column("subject_code")]
        public string SubjectCode { get; set; } = null!;

        [Required]
        [StringLength(100)]
        [Column("subject_name")]
        public string SubjectName { get; set; } = null!;

        [Column("description")]
        public string? Description { get; set; }

        // Navigation Properties
        public virtual ICollection<Class> Classes { get; set; } = new List<Class>();
    }
}
