using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management;

public class AddStudentEnrollmentsDto
{
    [Range(1, int.MaxValue)]
    public int GradeId { get; set; }

    [Required, MinLength(1)]
    public List<int> ClassIds { get; set; } = new();
}

public class DropStudentEnrollmentDto
{
    [StringLength(500)]
    public string? Reason { get; set; }
}
