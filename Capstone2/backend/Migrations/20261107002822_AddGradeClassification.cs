using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EduTrack.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGradeClassification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "grade_id",
                table: "classes",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "grades",
                columns: table => new
                {
                    grade_id = table.Column<int>(type: "int", nullable: false),
                    grade_name = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_grades", x => x.grade_id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "grades",
                columns: new[] { "grade_id", "grade_name" },
                values: new object[,]
                {
                    { 1, "Khối 1" },
                    { 2, "Khối 2" },
                    { 3, "Khối 3" },
                    { 4, "Khối 4" },
                    { 5, "Khối 5" },
                    { 6, "Khối 6" },
                    { 7, "Khối 7" },
                    { 8, "Khối 8" },
                    { 9, "Khối 9" },
                    { 10, "Khối 10" },
                    { 11, "Khối 11" },
                    { 12, "Khối 12" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_classes_grade_id",
                table: "classes",
                column: "grade_id");

            migrationBuilder.AddForeignKey(
                name: "FK_classes_grades_grade_id",
                table: "classes",
                column: "grade_id",
                principalTable: "grades",
                principalColumn: "grade_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_classes_grades_grade_id",
                table: "classes");

            migrationBuilder.DropTable(
                name: "grades");

            migrationBuilder.DropIndex(
                name: "IX_classes_grade_id",
                table: "classes");

            migrationBuilder.DropColumn(
                name: "grade_id",
                table: "classes");
        }
    }
}
