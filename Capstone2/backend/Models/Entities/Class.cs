using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("classes")]
    public class Class
    {
        [Key]
        [Column("class_id")]
        public int ClassId { get; set; }

        [Required]
        [StringLength(150)]
        [Column("class_name")]
        public string ClassName { get; set; } = null!;

        [Column("subject_id")]
        public int SubjectId { get; set; }

        [StringLength(50)]
        [Column("room")]
        public string? Room { get; set; }

        [Column("tuition_fee", TypeName = "decimal(12,2)")]
        public decimal TuitionFee { get; set; } = 0.00m;

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Required]
        [StringLength(20)]
        [Column("status")]
        public string Status { get; set; } = "active";

        // Navigation Properties
        [ForeignKey("SubjectId")]
        public virtual Subject Subject { get; set; } = null!;

        public virtual ICollection<TeacherClass> TeacherClasses { get; set; } = new List<TeacherClass>();
        public virtual ICollection<TaClass> TaClasses { get; set; } = new List<TaClass>();
        public virtual ICollection<StudentClass> StudentClasses { get; set; } = new List<StudentClass>();
        public virtual ICollection<ClassSchedule> ClassSchedules { get; set; } = new List<ClassSchedule>();
        public virtual ICollection<ClassSession> ClassSessions { get; set; } = new List<ClassSession>();
        public virtual ICollection<ContentUnit> ContentUnits { get; set; } = new List<ContentUnit>();
        public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
        public virtual ICollection<ProgressNote> ProgressNotes { get; set; } = new List<ProgressNote>();
        public virtual ICollection<TuitionInvoice> TuitionInvoices { get; set; } = new List<TuitionInvoice>();
        public virtual ICollection<ApprovalRequest> ApprovalRequests { get; set; } = new List<ApprovalRequest>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
