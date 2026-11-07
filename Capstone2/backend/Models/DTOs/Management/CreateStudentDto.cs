using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management;

// UserCode is the stable identity of an Add Student attempt, including retries.
public class CreateStudentDto : CreateUserDto
{
    [Range(1, int.MaxValue)]
    public int? GradeId { get; set; }

    [Required]
    public List<int> ClassIds { get; set; } = new();
}
