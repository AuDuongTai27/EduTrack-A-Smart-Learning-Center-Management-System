using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduTrack.API.Migrations
{
    /// <inheritdoc />
    public partial class ScheduleVersionExpand : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Requires MySQL >= 8.0.16 (enforced CHECK constraints).
            migrationBuilder.Sql(ScheduleMigrationGates.CompatibleLegacyClass);
            migrationBuilder.DropForeignKey(
                name: "FK_class_sessions_class_schedules_schedule_id",
                table: "class_sessions");

            migrationBuilder.DropIndex(
                name: "IX_class_sessions_schedule_id",
                table: "class_sessions");

            migrationBuilder.AddColumn<DateOnly>(
                name: "planned_occurrence_date",
                table: "class_sessions",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "schedule_version_id",
                table: "class_sessions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "occurrence_week_start",
                table: "class_sessions",
                type: "date",
                nullable: true,
                computedColumnSql: "DATE_SUB(planned_occurrence_date, INTERVAL WEEKDAY(planned_occurrence_date) DAY)",
                stored: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_schedule_class",
                table: "class_schedules",
                columns: new[] { "schedule_id", "class_id" });

            migrationBuilder.CreateTable(
                name: "class_schedule_versions",
                columns: table => new
                {
                    schedule_version_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    schedule_id = table.Column<int>(type: "int", nullable: false),
                    effective_from = table.Column<DateOnly>(type: "date", nullable: false),
                    effective_to = table.Column<DateOnly>(type: "date", nullable: true),
                    day_of_week = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    start_time = table.Column<TimeSpan>(type: "time(6)", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "time(6)", nullable: false),
                    room = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_class_schedule_versions", x => x.schedule_version_id);
                    table.UniqueConstraint("AK_version_schedule", x => new { x.schedule_version_id, x.schedule_id });
                    table.CheckConstraint("CK_version_effective", "WEEKDAY(effective_from) = 0 AND (effective_to IS NULL OR (effective_to > effective_from AND WEEKDAY(effective_to) = 0))");
                    table.CheckConstraint("CK_version_times", "start_time >= '00:00:00' AND start_time < end_time AND end_time < '24:00:00'");
                    table.CheckConstraint("CK_version_weekday", "day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')");
                    table.ForeignKey(
                        name: "FK_class_schedule_versions_class_schedules_schedule_id",
                        column: x => x.schedule_id,
                        principalTable: "class_schedules",
                        principalColumn: "schedule_id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_class_sessions_schedule_id_class_id",
                table: "class_sessions",
                columns: new[] { "schedule_id", "class_id" });

            migrationBuilder.CreateIndex(
                name: "IX_class_sessions_schedule_version_id_schedule_id",
                table: "class_sessions",
                columns: new[] { "schedule_version_id", "schedule_id" });

            migrationBuilder.CreateIndex(
                name: "IX_session_actual_range",
                table: "class_sessions",
                columns: new[] { "session_date", "start_time" });

            migrationBuilder.CreateIndex(
                name: "UQ_schedule_version_from",
                table: "class_schedule_versions",
                columns: new[] { "schedule_id", "effective_from" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_class_sessions_class_schedule_versions_schedule_version_id_s~",
                table: "class_sessions",
                columns: new[] { "schedule_version_id", "schedule_id" },
                principalTable: "class_schedule_versions",
                principalColumns: new[] { "schedule_version_id", "schedule_id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_class_sessions_class_schedules_schedule_id_class_id",
                table: "class_sessions",
                columns: new[] { "schedule_id", "class_id" },
                principalTable: "class_schedules",
                principalColumns: new[] { "schedule_id", "class_id" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(ScheduleMigrationGates.EmptyForDowngrade);
            migrationBuilder.DropForeignKey(
                name: "FK_class_sessions_class_schedule_versions_schedule_version_id_s~",
                table: "class_sessions");

            migrationBuilder.DropForeignKey(
                name: "FK_class_sessions_class_schedules_schedule_id_class_id",
                table: "class_sessions");

            migrationBuilder.DropTable(
                name: "class_schedule_versions");

            migrationBuilder.DropIndex(
                name: "IX_class_sessions_schedule_id_class_id",
                table: "class_sessions");

            migrationBuilder.DropIndex(
                name: "IX_class_sessions_schedule_version_id_schedule_id",
                table: "class_sessions");

            migrationBuilder.DropIndex(
                name: "IX_session_actual_range",
                table: "class_sessions");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_schedule_class",
                table: "class_schedules");

            migrationBuilder.DropColumn(
                name: "occurrence_week_start",
                table: "class_sessions");

            migrationBuilder.DropColumn(
                name: "planned_occurrence_date",
                table: "class_sessions");

            migrationBuilder.DropColumn(
                name: "schedule_version_id",
                table: "class_sessions");

            migrationBuilder.CreateIndex(
                name: "IX_class_sessions_schedule_id",
                table: "class_sessions",
                column: "schedule_id");

            migrationBuilder.AddForeignKey(
                name: "FK_class_sessions_class_schedules_schedule_id",
                table: "class_sessions",
                column: "schedule_id",
                principalTable: "class_schedules",
                principalColumn: "schedule_id");
        }
    }
}
