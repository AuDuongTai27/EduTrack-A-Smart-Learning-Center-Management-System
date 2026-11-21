namespace EduTrack.API.Models.DTOs;

public class GradeDto
{
    public int GradeId { get; set; }
    public string GradeName { get; set; } = null!;
    public int TotalClasses { get; set; }
    public string Status { get; set; } = "active";
}
