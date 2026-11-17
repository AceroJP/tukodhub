using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using TukodHub.Api.Controllers;
using TukodHub.Api.Data;
using TukodHub.Api.Infrastructure;
using TukodHub.Api.Tests.TestHost;
using Xunit;

namespace TukodHub.Api.Tests;

public sealed class ConfigurationAndMigrationTests
{
    [Fact]
    public async Task StartupFailsInProduction_WhenSupabaseConfigurationMissing()
    {
        await using var factory = new TestApplicationFactory(
            environment: "Production",
            configOverrides: new Dictionary<string, string?>
            {
                ["SupabaseUrl"] = "",
                ["PlatformOwnerJwtSigningKey"] = "",
                ["PlatformOwnerJwtIssuer"] = "",
                ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Database=test;Username=test;Password=test",
                ["FrontendUrl"] = "https://frontend.localhost",
                ["PlatformOwnerUserId"] = TestApplicationFactory.OwnerUserId
            });

        await Assert.ThrowsAnyAsync<InvalidOperationException>(async () =>
        {
            using var _ = factory.CreateClient();
            await Task.CompletedTask;
        });
    }

    [Fact]
    public void PublicAuthEndpoints_AreExplicitlyAllowAnonymous()
    {
        var methods = typeof(AuthController).GetMethods(BindingFlags.Instance | BindingFlags.Public)
            .Where(method => method.GetCustomAttributes().Any(attribute => attribute.GetType().Name.StartsWith("Http", StringComparison.Ordinal)))
            .ToDictionary(method => method.Name, method => method.GetCustomAttributes(true));

        Assert.Contains(methods["GetCsrfToken"], attribute => attribute is AllowAnonymousAttribute);
        Assert.Contains(methods["Register"], attribute => attribute is AllowAnonymousAttribute);
        Assert.Contains(methods["Login"], attribute => attribute is AllowAnonymousAttribute);
        Assert.Contains(methods["RequestPasswordReset"], attribute => attribute is AllowAnonymousAttribute);
        Assert.Contains(methods["ConfirmPasswordReset"], attribute => attribute is AllowAnonymousAttribute);
    }

    [Fact]
    public void ProtectedTenantEndpoints_ExplicitlyUseTenantSessionScheme()
    {
        var methods = typeof(AuthController).GetMethods(BindingFlags.Instance | BindingFlags.Public)
            .Where(method => method.GetCustomAttributes().Any(attribute => attribute.GetType().Name.StartsWith("Http", StringComparison.Ordinal)))
            .ToDictionary(method => method.Name, method => method.GetCustomAttributes<AuthorizeAttribute>(true).ToArray());

        var tenantProtectedMethods = new[]
        {
            "ChangePassword",
            "Account",
            "SwitchTenant",
            "Sessions",
            "RevokeSession",
            "Logout",
            "LogoutAll",
            "Me"
        };

        foreach (var methodName in tenantProtectedMethods)
        {
            var authorize = Assert.Single(methods[methodName]);
            Assert.Equal(AuthSchemes.TenantSession, authorize.AuthenticationSchemes);
            Assert.Equal("TenantMember", authorize.Policy);
        }
    }

    [Fact]
    public void PlatformEndpoints_ExplicitlyUsePlatformOwnerJwtScheme()
    {
        var authorize = Assert.Single(typeof(PlatformController)
            .GetCustomAttributes<AuthorizeAttribute>(true));

        Assert.Equal(AuthSchemes.PlatformOwnerJwt, authorize.AuthenticationSchemes);
        Assert.Equal("PlatformOwner", authorize.Policy);
    }

    [Fact]
    public async Task SnapshotAndModelContainPasswordHash()
    {
        var snapshotPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../src/TukodHub.Api/Data/Migrations/AppDbContextModelSnapshot.cs"));
        var migrationPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../src/TukodHub.Api/Data/Migrations/20261117090000_ReconcilePasswordHash.cs"));

        var snapshot = await File.ReadAllTextAsync(snapshotPath);
        var migration = await File.ReadAllTextAsync(migrationPath);

        Assert.Contains("PasswordHash", snapshot);
        Assert.Contains("ADD COLUMN IF NOT EXISTS \"PasswordHash\"", migration);

        await using var factory = new TestApplicationFactory();
        using var scope = factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var property = dbContext.Model.FindEntityType(typeof(User))?.FindProperty(nameof(User.PasswordHash));
        Assert.NotNull(property);
        Assert.False(property!.IsNullable);
    }

    [Fact]
    public async Task OptionalPostgreSqlCheck_ForPasswordHashColumn()
    {
        var connectionString = Environment.GetEnvironmentVariable("TUKODHUB_TEST_POSTGRES_CONNECTION");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return;
        }

        await using var connection = new Npgsql.NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        await using var command = new Npgsql.NpgsqlCommand(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'users'
              AND column_name = 'PasswordHash';
            """,
            connection);

        var result = await command.ExecuteScalarAsync();
        Assert.Equal("PasswordHash", result as string);
    }
}
