using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EduTrack.API.Models.DTOs.Management;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class SaveGradeDto
{
    [Required(ErrorMessage = "Vui lòng nhập tên khối lớp.")]
    [StringLength(50, ErrorMessage = "Tên khối lớp tối đa 50 ký tự.")]
    public string GradeName { get; set; } = null!;
}
