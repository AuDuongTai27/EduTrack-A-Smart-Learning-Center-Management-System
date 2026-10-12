using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("content_units")]
    public class ContentUnit
    {
        [Key]
        [Column("content_unit_id")]
        public int ContentUnitId { get; set; }

        [Column("class_id")]
        public int ClassId { get; set; }

        [Column("parent_unit_id")]
        public int? ParentUnitId { get; set; }

        [Required]
        [StringLength(200)]
        [Column("title")]
        public string Title { get; set; } = null!;

        [Required]
        [StringLength(20)]
        [Column("unit_type")]
        public string UnitType { get; set; } = "lesson";

        [Column("description")]
        public string? Description { get; set; }

        [Column("order_index")]
        public int OrderIndex { get; set; } = 1;

        // Navigation Properties
        [ForeignKey("ClassId")]
        public virtual Class Class { get; set; } = null!;

        [ForeignKey("ParentUnitId")]
        public virtual ContentUnit? ParentUnit { get; set; }

        public virtual ICollection<ContentUnit> SubUnits { get; set; } = new List<ContentUnit>();
        public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    }
}
