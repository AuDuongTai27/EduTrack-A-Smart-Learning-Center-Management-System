using System;

namespace EduTrack.API.Models.DTOs
{
    public class ContentUnitDto
    {
        public int ContentUnitId { get; set; }
        public int ClassId { get; set; }
        public string ClassName { get; set; } = null!;
        public int? ParentUnitId { get; set; }
        public string? ParentUnitTitle { get; set; }
        public string Title { get; set; } = null!;
        public string UnitType { get; set; } = null!;
        public string? Description { get; set; }
        public int OrderIndex { get; set; }
    }
}
