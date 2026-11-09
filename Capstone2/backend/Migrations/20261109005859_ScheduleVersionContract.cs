using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduTrack.API.Migrations
{
    /// <inheritdoc />
    public partial class ScheduleVersionContract : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(ScheduleMigrationGates.Resolved);
            migrationBuilder.AlterColumn<int>(
                name: "schedule_version_id",
                table: "class_sessions",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "schedule_id",
                table: "class_sessions",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "planned_occurrence_date",
                table: "class_sessions",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "UQ_schedule_occurrence_week",
                table: "class_sessions",
                columns: new[] { "schedule_id", "occurrence_week_start" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_occurrence_week_known",
                table: "class_sessions",
                sql: "occurrence_week_start IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(ScheduleMigrationGates.EmptyForDowngrade);
            migrationBuilder.DropIndex(
                name: "UQ_schedule_occurrence_week",
                table: "class_sessions");

            migrationBuilder.DropCheckConstraint(
                name: "CK_occurrence_week_known",
                table: "class_sessions");

            migrationBuilder.AlterColumn<int>(
                name: "schedule_version_id",
                table: "class_sessions",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "schedule_id",
                table: "class_sessions",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "planned_occurrence_date",
                table: "class_sessions",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date");
        }
    }
}
