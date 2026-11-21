using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities;

[Table("grades")]
public class Grade
{
    [Key]
    [Column("grade_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public int GradeId { get; set; }

    [Required, StringLength(50)]
    [Column("grade_name")]
    public string GradeName { get; set; } = null!;

    [Required, StringLength(20)]
    [Column("status")]
    public string Status { get; set; } = "active";

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();
    public virtual ICollection<UserGrade> UserGrades { get; set; } = new List<UserGrade>();
}
