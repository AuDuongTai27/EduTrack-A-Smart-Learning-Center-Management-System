using EduTrack.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Models.EF;

// Application model: read both Expand legacy rows and fully mapped Contract rows.
// Schema migrations must use EduTrackDbContext / EduTrackDesignTimeFactory. Keeping
// that model separate prevents a nullable runtime mapping from generating a migration
// that accidentally relaxes the approved Contract NOT NULL constraints.
public sealed class EduTrackRuntimeDbContext(DbContextOptions<EduTrackRuntimeDbContext> options)
    : EduTrackDbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<ClassSession>(session =>
        {
            session.Property(x => x.ScheduleId).IsRequired(false);
            session.Property(x => x.ScheduleVersionId).IsRequired(false);
            session.Property(x => x.PlannedOccurrenceDate).IsRequired(false);
            session.HasOne(x => x.Schedule).WithMany(x => x.ClassSessions)
                .HasForeignKey(x => new { x.ScheduleId, x.ClassId })
                .HasPrincipalKey(x => new { x.ScheduleId, x.ClassId })
                .IsRequired(false).OnDelete(DeleteBehavior.Restrict);
            session.HasOne(x => x.ScheduleVersion).WithMany(x => x.ClassSessions)
                .HasForeignKey(x => new { x.ScheduleVersionId, x.ScheduleId })
                .HasPrincipalKey(x => new { x.ScheduleVersionId, x.ScheduleId })
                .IsRequired(false).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
