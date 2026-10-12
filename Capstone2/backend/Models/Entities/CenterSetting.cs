using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("center_settings")]
    public class CenterSetting
    {
        [Key]
        [Column("setting_id")]
        public int SettingId { get; set; }

        [Required]
        [StringLength(100)]
        [Column("setting_key")]
        public string SettingKey { get; set; } = null!;

        [Column("setting_value")]
        public string? SettingValue { get; set; }

        [Column("updated_by")]
        public int? UpdatedBy { get; set; }

        // Navigation Properties
        [ForeignKey("UpdatedBy")]
        public virtual User? Updater { get; set; }
    }
}
