using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TukodHub.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformAdministrationEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "platform_settings",
                schema: "public",
                columns: table => new
                {
                    Key = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ValueJson = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedBy = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_platform_settings", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "platform_audit_logs",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    Timestamp = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    ActorType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ActorId = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ActorEmail = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true),
                    Action = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    EntityName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    EntityId = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UserAgent = table.Column<string>(type: "text", nullable: true),
                    Details = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_platform_audit_logs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "support_tickets",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    TicketNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Subject = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    ResolvedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_support_tickets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_support_tickets_tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "support_ticket_messages",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SenderId = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    SenderName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    AttachmentsJson = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_support_ticket_messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_support_ticket_messages_support_tickets_TicketId",
                        column: x => x.TicketId,
                        principalSchema: "public",
                        principalTable: "support_tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "support_access_grants",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestedByAdminId = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ApprovedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false, defaultValue: 60),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_support_access_grants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_support_access_grants_tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_platform_audit_logs_Timestamp",
                schema: "public",
                table: "platform_audit_logs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_platform_audit_logs_TenantId",
                schema: "public",
                table: "platform_audit_logs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_support_tickets_TicketNumber",
                schema: "public",
                table: "support_tickets",
                column: "TicketNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_support_tickets_TenantId",
                schema: "public",
                table: "support_tickets",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_support_ticket_messages_TicketId",
                schema: "public",
                table: "support_ticket_messages",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_support_access_grants_TenantId",
                schema: "public",
                table: "support_access_grants",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "support_access_grants",
                schema: "public");

            migrationBuilder.DropTable(
                name: "support_ticket_messages",
                schema: "public");

            migrationBuilder.DropTable(
                name: "support_tickets",
                schema: "public");

            migrationBuilder.DropTable(
                name: "platform_audit_logs",
                schema: "public");

            migrationBuilder.DropTable(
                name: "platform_settings",
                schema: "public");
        }
    }
}
