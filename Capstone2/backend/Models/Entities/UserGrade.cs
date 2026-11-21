using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("user_grades")]
    public class UserGrade
    {
        [Column("user_id")]
        public int UserId { get; set; }

        [Column("grade_id")]
        public int GradeId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;

        [ForeignKey(nameof(GradeId))]
        public virtual Grade Grade { get; set; } = null!;
    }
}
