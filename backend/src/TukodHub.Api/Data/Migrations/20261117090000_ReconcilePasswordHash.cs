using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TukodHub.Api.Data.Migrations;

public partial class ReconcilePasswordHash : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            ALTER TABLE public."users"
                ADD COLUMN IF NOT EXISTS "PasswordHash" character varying(256);
            """);

        migrationBuilder.Sql(
            """
            UPDATE public."users"
            SET "PasswordHash" = 'legacy-unset'
            WHERE "PasswordHash" IS NULL;
            """);

        migrationBuilder.Sql(
            """
            ALTER TABLE public."users"
                ALTER COLUMN "PasswordHash" SET NOT NULL;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            ALTER TABLE public."users"
                DROP COLUMN IF EXISTS "PasswordHash";
            """);
    }
}
