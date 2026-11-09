using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduTrack.API.Migrations
{
    /// <inheritdoc />
    public partial class ScheduleChangeRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "schedule_change_request_details",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    session_id = table.Column<int>(type: "int", nullable: false),
                    change_kind = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    original_session_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    original_start_time = table.Column<TimeSpan>(type: "time(6)", nullable: false),
                    original_end_time = table.Column<TimeSpan>(type: "time(6)", nullable: false),
                    original_room = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    original_status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    expected_session_fingerprint = table.Column<string>(type: "varchar(64)", maxLength: 64, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    proposed_session_date = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    proposed_start_time = table.Column<TimeSpan>(type: "time(6)", nullable: true),
                    proposed_end_time = table.Column<TimeSpan>(type: "time(6)", nullable: true),
                    proposed_room = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    client_request_key = table.Column<string>(type: "varchar(36)", maxLength: 36, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    applied_at = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_schedule_change_request_details", x => x.request_id);
                    table.CheckConstraint("CK_change_kind", "change_kind IN ('reschedule','cancel','makeup')");
                    table.CheckConstraint("CK_change_target", "(change_kind='cancel' AND proposed_session_date IS NULL AND proposed_start_time IS NULL AND proposed_end_time IS NULL AND proposed_room IS NULL) OR (change_kind IN ('reschedule','makeup') AND proposed_session_date IS NOT NULL AND proposed_start_time IS NOT NULL AND proposed_end_time IS NOT NULL AND proposed_start_time >= '00:00:00' AND proposed_start_time < proposed_end_time AND proposed_end_time < '24:00:00')");
                    table.ForeignKey(
                        name: "FK_schedule_change_request_details_approval_requests_request_id",
                        column: x => x.request_id,
                        principalTable: "approval_requests",
                        principalColumn: "request_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_schedule_change_request_details_class_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "class_sessions",
                        principalColumn: "session_id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_schedule_change_request_details_session_id",
                table: "schedule_change_request_details",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "UQ_change_client_key",
                table: "schedule_change_request_details",
                column: "client_request_key",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Never erase typed request/apply history by an automatic downgrade.
            migrationBuilder.Sql("""
                DROP TEMPORARY TABLE IF EXISTS edutrack_change_down_gate;
                CREATE TEMPORARY TABLE edutrack_change_down_gate (
                  empty_history INT NOT NULL,
                  CONSTRAINT CK_change_down_requires_review CHECK (empty_history=1)
                );
                INSERT INTO edutrack_change_down_gate SELECT IF(EXISTS(SELECT 1 FROM schedule_change_request_details),0,1);
                DROP TEMPORARY TABLE edutrack_change_down_gate;
                """);
            migrationBuilder.DropTable(
                name: "schedule_change_request_details");
        }
    }
}
