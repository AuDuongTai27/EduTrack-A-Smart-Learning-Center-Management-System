using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace EduTrack.API.Models.EF;

// Always pass --startup-project backend.Tests/ScheduleManagement: EF CLI can inspect
// startup services before choosing this factory. The factory itself never loads
// appsettings or AutoDetects a database. Database updates need an explicit --connection.
public sealed class EduTrackDesignTimeFactory : IDesignTimeDbContextFactory<EduTrackDbContext>
{
    public EduTrackDbContext CreateDbContext(string[] args) => new(
        new DbContextOptionsBuilder<EduTrackDbContext>().UseMySql(
            "Server=127.0.0.1;Port=1;Database=edutrack_design_only;User=design_only;Connection Timeout=1",
            new MySqlServerVersion(new Version(8, 0, 44))).Options);
}
