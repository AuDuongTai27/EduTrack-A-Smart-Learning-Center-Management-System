using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("ta_classes")]
    public class TaClass
    {
        [Key]
        [Column("ta_class_id")]
        public int TaClassId { get; set; }

        [Column("ta_id")]
        public int TaId { get; set; }

        [Column("class_id")]
        public int ClassId { get; set; }

        [Column("assigned_at")]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(20)]
        [Column("status")]
        public string Status { get; set; } = "active";

        // Navigation Properties
        [ForeignKey("TaId")]
        public virtual User Ta { get; set; } = null!;

        [ForeignKey("ClassId")]
        public virtual Class Class { get; set; } = null!;
    }
}
