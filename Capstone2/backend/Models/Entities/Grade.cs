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

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();
}
