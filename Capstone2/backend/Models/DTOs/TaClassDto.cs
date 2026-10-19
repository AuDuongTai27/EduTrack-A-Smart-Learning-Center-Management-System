using System;

namespace EduTrack.API.Models.DTOs
{
    public class TaClassDto
    {
        public int TaClassId { get; set; }
        public int TaId { get; set; }
        public string TaName { get; set; } = null!;
        public string TaCode { get; set; } = null!;
        public int ClassId { get; set; }
        public string ClassName { get; set; } = null!;
        public DateTime AssignedAt { get; set; }
        public string Status { get; set; } = null!;
    }
}
