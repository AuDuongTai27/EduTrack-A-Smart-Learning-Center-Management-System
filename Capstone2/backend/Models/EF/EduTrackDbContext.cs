using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.Entities;

namespace EduTrack.API.Models.EF
{
    public class EduTrackDbContext : DbContext
    {
        public EduTrackDbContext(DbContextOptions<EduTrackDbContext> options) : base(options)
        {
        }

        // 22 DbSets for EduTrack Schema
        public virtual DbSet<User> Users { get; set; } = null!;
        public virtual DbSet<Role> Roles { get; set; } = null!;
        public virtual DbSet<UserRole> UserRoles { get; set; } = null!;
        public virtual DbSet<ParentStudent> ParentStudents { get; set; } = null!;
        public virtual DbSet<Subject> Subjects { get; set; } = null!;
        public virtual DbSet<Class> Classes { get; set; } = null!;
        public virtual DbSet<TeacherClass> TeacherClasses { get; set; } = null!;
        public virtual DbSet<TaClass> TaClasses { get; set; } = null!;
        public virtual DbSet<StudentClass> StudentClasses { get; set; } = null!;
        public virtual DbSet<ClassSchedule> ClassSchedules { get; set; } = null!;
        public virtual DbSet<ClassSession> ClassSessions { get; set; } = null!;
        public virtual DbSet<ContentUnit> ContentUnits { get; set; } = null!;
        public virtual DbSet<Attendance> Attendances { get; set; } = null!;
        public virtual DbSet<Assignment> Assignments { get; set; } = null!;
        public virtual DbSet<Submission> Submissions { get; set; } = null!;
        public virtual DbSet<AiEvaluation> AiEvaluations { get; set; } = null!;
        public virtual DbSet<ProgressNote> ProgressNotes { get; set; } = null!;
        public virtual DbSet<TuitionInvoice> TuitionInvoices { get; set; } = null!;
        public virtual DbSet<Payment> Payments { get; set; } = null!;
        public virtual DbSet<ApprovalRequest> ApprovalRequests { get; set; } = null!;
        public virtual DbSet<Notification> Notifications { get; set; } = null!;
        public virtual DbSet<CenterSetting> CenterSettings { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Composite Key for parent_students
            modelBuilder.Entity<ParentStudent>(entity =>
            {
                entity.HasKey(ps => new { ps.ParentId, ps.StudentId });

                entity.HasOne(ps => ps.Parent)
                    .WithMany(u => u.ParentLinks)
                    .HasForeignKey(ps => ps.ParentId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ps => ps.Student)
                    .WithMany(u => u.StudentLinks)
                    .HasForeignKey(ps => ps.StudentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 2. UserRole unique constraint
            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.HasIndex(ur => new { ur.UserId, ur.RoleId }).IsUnique();

                entity.HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(ur => ur.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 3. User indexes
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.UserCode).IsUnique();
                entity.HasIndex(u => u.Email).IsUnique();
            });

            // 4. Classes & Academic Relationships
            modelBuilder.Entity<TeacherClass>(entity =>
            {
                entity.HasIndex(tc => new { tc.TeacherId, tc.ClassId }).IsUnique();

                entity.HasOne(tc => tc.Teacher)
                    .WithMany(u => u.TeacherClasses)
                    .HasForeignKey(tc => tc.TeacherId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(tc => tc.Class)
                    .WithMany(c => c.TeacherClasses)
                    .HasForeignKey(tc => tc.ClassId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<TaClass>(entity =>
            {
                entity.HasIndex(tac => new { tac.TaId, tac.ClassId }).IsUnique();

                entity.HasOne(tac => tac.Ta)
                    .WithMany(u => u.TaClasses)
                    .HasForeignKey(tac => tac.TaId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(tac => tac.Class)
                    .WithMany(c => c.TaClasses)
                    .HasForeignKey(tac => tac.ClassId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<StudentClass>(entity =>
            {
                entity.HasIndex(sc => new { sc.StudentId, sc.ClassId }).IsUnique();

                entity.HasOne(sc => sc.Student)
                    .WithMany(u => u.StudentClasses)
                    .HasForeignKey(sc => sc.StudentId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(sc => sc.Class)
                    .WithMany(c => c.StudentClasses)
                    .HasForeignKey(sc => sc.ClassId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 5. Attendance (dual relations to User: Student and Recorder)
            modelBuilder.Entity<Attendance>(entity =>
            {
                entity.HasIndex(a => new { a.SessionId, a.StudentId }).IsUnique();

                entity.HasOne(a => a.Student)
                    .WithMany(u => u.Attendances)
                    .HasForeignKey(a => a.StudentId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(a => a.Recorder)
                    .WithMany(u => u.RecordedAttendances)
                    .HasForeignKey(a => a.RecordedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Session)
                    .WithMany(s => s.Attendances)
                    .HasForeignKey(a => a.SessionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 6. Submissions (dual relations to User: Student and Grader)
            modelBuilder.Entity<Submission>(entity =>
            {
                entity.HasIndex(s => new { s.AssignmentId, s.StudentId }).IsUnique();

                entity.HasOne(s => s.Student)
                    .WithMany(u => u.Submissions)
                    .HasForeignKey(s => s.StudentId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(s => s.Grader)
                    .WithMany(u => u.GradedSubmissions)
                    .HasForeignKey(s => s.GradedBy)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(s => s.Assignment)
                    .WithMany(a => a.Submissions)
                    .HasForeignKey(s => s.AssignmentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 7. ProgressNote
            modelBuilder.Entity<ProgressNote>(entity =>
            {
                entity.HasOne(pn => pn.Student)
                    .WithMany(u => u.StudentProgressNotes)
                    .HasForeignKey(pn => pn.StudentId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pn => pn.Author)
                    .WithMany(u => u.WrittenProgressNotes)
                    .HasForeignKey(pn => pn.WrittenBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(pn => pn.Class)
                    .WithMany(c => c.ProgressNotes)
                    .HasForeignKey(pn => pn.ClassId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 8. Payment (dual relations to User: Payer and Recorder)
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasOne(p => p.Invoice)
                    .WithMany(i => i.Payments)
                    .HasForeignKey(p => p.InvoiceId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(p => p.Payer)
                    .WithMany(u => u.PaymentsMade)
                    .HasForeignKey(p => p.PaidByUserId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(p => p.Recorder)
                    .WithMany(u => u.PaymentsRecorded)
                    .HasForeignKey(p => p.RecordedBy)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // 9. ApprovalRequest (triple relations to User: Student, Requester, Reviewer)
            modelBuilder.Entity<ApprovalRequest>(entity =>
            {
                entity.HasIndex(ar => ar.RequestCode).IsUnique();

                entity.HasOne(ar => ar.Student)
                    .WithMany(u => u.StudentApprovalRequests)
                    .HasForeignKey(ar => ar.StudentId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(ar => ar.Requester)
                    .WithMany(u => u.RequestedApprovalRequests)
                    .HasForeignKey(ar => ar.RequestedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ar => ar.Reviewer)
                    .WithMany(u => u.ReviewedApprovalRequests)
                    .HasForeignKey(ar => ar.ReviewedBy)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(ar => ar.Class)
                    .WithMany(c => c.ApprovalRequests)
                    .HasForeignKey(ar => ar.ClassId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(ar => ar.Invoice)
                    .WithMany(i => i.ApprovalRequests)
                    .HasForeignKey(ar => ar.InvoiceId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // 10. CenterSetting
            modelBuilder.Entity<CenterSetting>(entity =>
            {
                entity.HasIndex(cs => cs.SettingKey).IsUnique();

                entity.HasOne(cs => cs.Updater)
                    .WithMany(u => u.UpdatedSettings)
                    .HasForeignKey(cs => cs.UpdatedBy)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // 11. ContentUnit self-reference
            modelBuilder.Entity<ContentUnit>(entity =>
            {
                entity.HasOne(cu => cu.ParentUnit)
                    .WithMany(cu => cu.SubUnits)
                    .HasForeignKey(cu => cu.ParentUnitId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(cu => cu.Class)
                    .WithMany(c => c.ContentUnits)
                    .HasForeignKey(cu => cu.ClassId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 12. Notification
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasOne(n => n.User)
                    .WithMany(u => u.Notifications)
                    .HasForeignKey(n => n.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(n => n.Class)
                    .WithMany(c => c.Notifications)
                    .HasForeignKey(n => n.ClassId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
