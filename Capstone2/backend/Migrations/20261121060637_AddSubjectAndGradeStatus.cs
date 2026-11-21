using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduTrack.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSubjectAndGradeStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "subjects",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "active")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "grades",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "active")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "grades",
                keyColumn: "grade_id",
                keyValue: 1,
                column: "status",
                value: "active");

            migrationBuilder.UpdateData(
                table: "grades",
                keyColumn: "grade_id",
                keyValue: 2,
                column: "status",
                value: "active");

            migrationBuilder.UpdateData(
                table: "grades",
                keyColumn: "grade_id",
                keyValue: 3,
                column: "status",
                value: "active");

            migrationBuilder.UpdateData(
                table: "grades",
                keyColumn: "grade_id",
                keyValue: 4,
                column: "status",
                value: "active");

            migrationBuilder.UpdateData(
                table: "grades",
                keyColumn: "grade_id",
                keyValue: 5,
                column: "status",
                value: "active");

            migrationBuilder.UpdateData(
                table: "grades",
                keyColumn: "grade_id",
                keyValue: 6,
                column: "status",
                value: "active");

            migrationBuilder.UpdateData(
                table: "grades",
                keyColumn: "grade_id",
                keyValue: 7,
                column: "status",
                value: "active");

            migrationBuilder.UpdateData(
                table: "grades",
                keyColumn: "grade_id",
                keyValue: 8,
                column: "status",
                value: "active");

            migrationBuilder.UpdateData(
                table: "grades",
                keyColumn: "grade_id",
                keyValue: 9,
                column: "status",
                value: "active");

            migrationBuilder.UpdateData(
                table: "grades",
                keyColumn: "grade_id",
                keyValue: 10,
                column: "status",
                value: "active");

            migrationBuilder.UpdateData(
                table: "grades",
                keyColumn: "grade_id",
                keyValue: 11,
                column: "status",
                value: "active");

            migrationBuilder.UpdateData(
                table: "grades",
                keyColumn: "grade_id",
                keyValue: 12,
                column: "status",
                value: "active");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "status",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "status",
                table: "grades");
        }
    }
}
