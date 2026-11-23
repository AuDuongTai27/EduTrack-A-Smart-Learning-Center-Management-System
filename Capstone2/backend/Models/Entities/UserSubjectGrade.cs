using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("user_subject_grades")]
    public class UserSubjectGrade
    {
        [Column("user_id")]
        public int UserId { get; set; }

        [Column("subject_id")]
        public int SubjectId { get; set; }

        [Column("grade_id")]
        public int GradeId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;

        [ForeignKey(nameof(SubjectId))]
        public virtual Subject Subject { get; set; } = null!;

        [ForeignKey(nameof(GradeId))]
        public virtual Grade Grade { get; set; } = null!;
    }
}
