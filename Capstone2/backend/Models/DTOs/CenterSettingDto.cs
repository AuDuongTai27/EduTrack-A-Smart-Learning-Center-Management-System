using System;

namespace EduTrack.API.Models.DTOs
{
    public class CenterSettingDto
    {
        public int SettingId { get; set; }
        public string SettingKey { get; set; } = null!;
        public string? SettingValue { get; set; }
        public int? UpdatedBy { get; set; }
        public string? UpdaterName { get; set; }
    }
}
