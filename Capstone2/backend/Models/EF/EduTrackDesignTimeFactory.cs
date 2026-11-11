using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace EduTrack.API.Models.EF;

public sealed class EduTrackDesignTimeFactory : IDesignTimeDbContextFactory<EduTrackDbContext>
{
    public EduTrackDbContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();
        var config = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var connectionString = config.GetConnectionString("DefaultConnection")
            ?? "Server=localhost;Database=edutrack_db;User=root;Password=123456;CharSet=utf8mb4;";

        return new EduTrackDbContext(
            new DbContextOptionsBuilder<EduTrackDbContext>().UseMySql(
                connectionString,
                new MySqlServerVersion(new Version(8, 0, 44))).Options);
    }
}
