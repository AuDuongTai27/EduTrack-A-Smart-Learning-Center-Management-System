using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class CenterSettingValueInputDto
    {
        [Required]
        [StringLength(100)]
        public string SettingKey { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? SettingValue { get; set; }
    }

    public class CenterSettingsBulkUpdateDto
    {
        [Required]
        [MinLength(1)]
        [MaxLength(20)]
        public List<CenterSettingValueInputDto> Settings { get; set; } = new();
    }
}
