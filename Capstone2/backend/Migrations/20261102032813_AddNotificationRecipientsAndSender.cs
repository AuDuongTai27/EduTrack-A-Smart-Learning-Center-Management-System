using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduTrack.API.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationRecipientsAndSender : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "sender_id",
                table: "notifications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "target_role",
                table: "notifications",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "target_scope",
                table: "notifications",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "notification_recipients",
                columns: table => new
                {
                    recipient_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    notification_id = table.Column<int>(type: "int", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    is_read = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    read_at = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification_recipients", x => x.recipient_id);
                    table.ForeignKey(
                        name: "FK_notification_recipients_notifications_notification_id",
                        column: x => x.notification_id,
                        principalTable: "notifications",
                        principalColumn: "notification_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_notification_recipients_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_sender_id",
                table: "notifications",
                column: "sender_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_recipients_notification_id_user_id",
                table: "notification_recipients",
                columns: new[] { "notification_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_notification_recipients_user_id",
                table: "notification_recipients",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_notifications_users_sender_id",
                table: "notifications",
                column: "sender_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_notifications_users_sender_id",
                table: "notifications");

            migrationBuilder.DropTable(
                name: "notification_recipients");

            migrationBuilder.DropIndex(
                name: "IX_notifications_sender_id",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "sender_id",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "target_role",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "target_scope",
                table: "notifications");
        }
    }
}
