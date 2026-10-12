using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduTrack.API.Models.Entities
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [StringLength(20)]
        [Column("user_code")]
        public string UserCode { get; set; } = null!;

        [Required]
        [StringLength(150)]
        [Column("full_name")]
        public string FullName { get; set; } = null!;

        [StringLength(150)]
        [Column("email")]
        public string? Email { get; set; }

        [StringLength(20)]
        [Column("phone")]
        public string? Phone { get; set; }

        [Required]
        [StringLength(255)]
        [Column("password_hash")]
        public string PasswordHash { get; set; } = null!;

        [StringLength(500)]
        [Column("avatar_url")]
        public string? AvatarUrl { get; set; }

        [Column("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }

        [Column("gender")]
        [StringLength(20)]
        public string? Gender { get; set; }

        [StringLength(100)]
        [Column("specialty")]
        public string? Specialty { get; set; }

        [Column("enrolled_since")]
        public DateTime? EnrolledSince { get; set; }

        [Required]
        [Column("status")]
        [StringLength(20)]
        public string Status { get; set; } = "active";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public virtual ICollection<ParentStudent> ParentLinks { get; set; } = new List<ParentStudent>();
        public virtual ICollection<ParentStudent> StudentLinks { get; set; } = new List<ParentStudent>();
        public virtual ICollection<TeacherClass> TeacherClasses { get; set; } = new List<TeacherClass>();
        public virtual ICollection<TaClass> TaClasses { get; set; } = new List<TaClass>();
        public virtual ICollection<StudentClass> StudentClasses { get; set; } = new List<StudentClass>();
        public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
        public virtual ICollection<Attendance> RecordedAttendances { get; set; } = new List<Attendance>();
        public virtual ICollection<Assignment> CreatedAssignments { get; set; } = new List<Assignment>();
        public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();
        public virtual ICollection<Submission> GradedSubmissions { get; set; } = new List<Submission>();
        public virtual ICollection<AiEvaluation> RequestedAiEvaluations { get; set; } = new List<AiEvaluation>();
        public virtual ICollection<ProgressNote> StudentProgressNotes { get; set; } = new List<ProgressNote>();
        public virtual ICollection<ProgressNote> WrittenProgressNotes { get; set; } = new List<ProgressNote>();
        public virtual ICollection<TuitionInvoice> TuitionInvoices { get; set; } = new List<TuitionInvoice>();
        public virtual ICollection<Payment> PaymentsMade { get; set; } = new List<Payment>();
        public virtual ICollection<Payment> PaymentsRecorded { get; set; } = new List<Payment>();
        public virtual ICollection<ApprovalRequest> StudentApprovalRequests { get; set; } = new List<ApprovalRequest>();
        public virtual ICollection<ApprovalRequest> RequestedApprovalRequests { get; set; } = new List<ApprovalRequest>();
        public virtual ICollection<ApprovalRequest> ReviewedApprovalRequests { get; set; } = new List<ApprovalRequest>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public virtual ICollection<CenterSetting> UpdatedSettings { get; set; } = new List<CenterSetting>();
    }
}
