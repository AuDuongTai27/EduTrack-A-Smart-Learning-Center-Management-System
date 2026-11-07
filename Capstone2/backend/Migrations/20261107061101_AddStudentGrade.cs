using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduTrack.API.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentGrade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "grade_id",
                table: "users",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_grade_id",
                table: "users",
                column: "grade_id");

            migrationBuilder.AddForeignKey(
                name: "FK_users_grades_grade_id",
                table: "users",
                column: "grade_id",
                principalTable: "grades",
                principalColumn: "grade_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_users_grades_grade_id",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_users_grade_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "grade_id",
                table: "users");
        }
    }
}
