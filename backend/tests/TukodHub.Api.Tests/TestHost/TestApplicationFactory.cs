using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TukodHub.Api.Data;

namespace TukodHub.Api.Tests.TestHost;

public sealed class TestApplicationFactory : WebApplicationFactory<Program>
{
    public const string OwnerUserId = "owner-user-id";
    public const string JwtIssuer = "https://test.supabase.local/auth/v1";
    public const string JwtSigningKey = "test-signing-key-for-platform-owner-auth-123456";

    private readonly string environment;
    private readonly IDictionary<string, string?> configOverrides;

    public TestApplicationFactory(
        string environment = "Development",
        IDictionary<string, string?>? configOverrides = null)
    {
        this.environment = environment;
        this.configOverrides = configOverrides ?? new Dictionary<string, string?>();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment(environment);

        builder.ConfigureAppConfiguration((_, configurationBuilder) =>
        {
            var defaults = new Dictionary<string, string?>
            {
                ["FrontendUrl"] = "https://frontend.localhost",
                ["PlatformOwnerUserId"] = OwnerUserId,
                ["PlatformOwnerJwtSigningKey"] = JwtSigningKey,
                ["PlatformOwnerJwtIssuer"] = JwtIssuer,
                ["SupabaseUrl"] = "",
                ["ConnectionStrings:DefaultConnection"] = "Data Source=test"
            };

            foreach (var pair in configOverrides)
            {
                defaults[pair.Key] = pair.Value;
            }

            configurationBuilder.AddInMemoryCollection(defaults);
        });

        builder.ConfigureServices(services =>
        {
            RemoveDbContextRegistration(services);

            var connection = new SqliteConnection("DataSource=:memory:");
            connection.Open();
            services.AddSingleton(connection);

            services.AddDbContext<AppDbContext>(options => options.UseSqlite(connection));

            using var scope = services.BuildServiceProvider().CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            dbContext.Database.EnsureCreated();
            TestDataSeeder.Seed(dbContext);
        });
    }

    private static void RemoveDbContextRegistration(IServiceCollection services)
    {
        var descriptors = services
            .Where(descriptor => descriptor.ServiceType == typeof(DbContextOptions<AppDbContext>)
                || descriptor.ServiceType == typeof(DbContextOptions)
                || descriptor.ServiceType == typeof(AppDbContext)
                || (descriptor.ServiceType.IsGenericType
                    && descriptor.ServiceType.GetGenericTypeDefinition() == typeof(IDbContextOptionsConfiguration<>))
                || descriptor.ServiceType == typeof(SqliteConnection))
            .ToList();

        foreach (var descriptor in descriptors)
        {
            services.Remove(descriptor);
        }
    }
}

internal static class TestDataSeeder
{
    public static readonly Guid TenantAId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid TenantBId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid InactiveTenantId = Guid.Parse("66666666-6666-6666-6666-666666666666");
    public static readonly Guid ActiveUserId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    public static readonly Guid MultiTenantUserId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
    public static readonly Guid SuspendedMembershipUserId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    public static readonly Guid NoMembershipUserId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");
    public static readonly Guid RevokedMembershipUserId = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee");
    public static readonly Guid InactiveTenantMembershipUserId = Guid.Parse("ffffffff-ffff-ffff-ffff-ffffffffffff");
    public const string ActiveSessionToken = "active-session-token";
    public const string MultiTenantSessionToken = "multi-tenant-session-token";
    public const string SuspendedSessionToken = "suspended-session-token";
    public const string RevokedSessionToken = "revoked-session-token";
    private static readonly Guid RoleOwnerId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    private static readonly Guid RoleManagerId = Guid.Parse("44444444-4444-4444-4444-444444444444");

    public static void Seed(AppDbContext db)
    {
        if (db.Tenants.Any())
        {
            return;
        }

        db.Tenants.AddRange(
            new Tenant { Id = TenantAId, Name = "Acero Aircon", Slug = "aceroaircon", Status = TenantStatus.Active, CreatedAt = DateTimeOffset.UtcNow },
            new Tenant { Id = TenantBId, Name = "Other Tenant", Slug = "othertenant", Status = TenantStatus.Active, CreatedAt = DateTimeOffset.UtcNow },
            new Tenant { Id = InactiveTenantId, Name = "Inactive Tenant", Slug = "inactivetenant", Status = TenantStatus.Suspended, CreatedAt = DateTimeOffset.UtcNow });

        var activeUser = new User
        {
            Id = ActiveUserId,
            Email = "active@tenant.test",
            NormalizedEmail = "ACTIVE@TENANT.TEST",
            PasswordHash = HashPassword("CorrectHorseBattery1!"),
            DisplayName = "Active User",
            Status = UserStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var suspendedMembershipUser = new User
        {
            Id = SuspendedMembershipUserId,
            Email = "suspended@tenant.test",
            NormalizedEmail = "SUSPENDED@TENANT.TEST",
            PasswordHash = HashPassword("CorrectHorseBattery1!"),
            DisplayName = "Suspended Membership User",
            Status = UserStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var multiTenantUser = new User
        {
            Id = MultiTenantUserId,
            Email = "multi@tenant.test",
            NormalizedEmail = "MULTI@TENANT.TEST",
            PasswordHash = HashPassword("CorrectHorseBattery1!"),
            DisplayName = "Multi Tenant User",
            Status = UserStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var noMembershipUser = new User
        {
            Id = NoMembershipUserId,
            Email = "nomembership@tenant.test",
            NormalizedEmail = "NOMEMBERSHIP@TENANT.TEST",
            PasswordHash = HashPassword("CorrectHorseBattery1!"),
            DisplayName = "No Membership User",
            Status = UserStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var revokedMembershipUser = new User
        {
            Id = RevokedMembershipUserId,
            Email = "revoked@tenant.test",
            NormalizedEmail = "REVOKED@TENANT.TEST",
            PasswordHash = HashPassword("CorrectHorseBattery1!"),
            DisplayName = "Revoked Membership User",
            Status = UserStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var inactiveTenantMembershipUser = new User
        {
            Id = InactiveTenantMembershipUserId,
            Email = "inactivetenant@tenant.test",
            NormalizedEmail = "INACTIVETENANT@TENANT.TEST",
            PasswordHash = HashPassword("CorrectHorseBattery1!"),
            DisplayName = "Inactive Tenant Membership User",
            Status = UserStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.Users.AddRange(activeUser, suspendedMembershipUser, multiTenantUser, noMembershipUser, revokedMembershipUser, inactiveTenantMembershipUser);

        db.Roles.Add(new Role
        {
            Id = RoleOwnerId,
            Name = "Owner",
            Scope = RoleScope.Tenant,
            IsActive = true
        });

        db.Roles.Add(new Role
        {
            Id = RoleManagerId,
            Name = "Manager",
            Scope = RoleScope.Tenant,
            IsActive = true
        });

        db.Memberships.AddRange(
            new Membership
            {
                Id = Guid.NewGuid(),
                TenantId = TenantAId,
                UserId = ActiveUserId,
                RoleId = RoleOwnerId,
                Status = MembershipStatus.Active,
                CreatedAt = DateTimeOffset.UtcNow
            },
            new Membership
            {
                Id = Guid.NewGuid(),
                TenantId = TenantAId,
                UserId = SuspendedMembershipUserId,
                RoleId = RoleOwnerId,
                Status = MembershipStatus.Suspended,
                CreatedAt = DateTimeOffset.UtcNow
            },
            new Membership
            {
                Id = Guid.NewGuid(),
                TenantId = TenantAId,
                UserId = MultiTenantUserId,
                RoleId = RoleOwnerId,
                Status = MembershipStatus.Active,
                CreatedAt = DateTimeOffset.UtcNow
            },
            new Membership
            {
                Id = Guid.NewGuid(),
                TenantId = TenantBId,
                UserId = MultiTenantUserId,
                RoleId = RoleManagerId,
                Status = MembershipStatus.Active,
                CreatedAt = DateTimeOffset.UtcNow
            },
            new Membership
            {
                Id = Guid.NewGuid(),
                TenantId = TenantAId,
                UserId = RevokedMembershipUserId,
                RoleId = RoleOwnerId,
                Status = MembershipStatus.Revoked,
                CreatedAt = DateTimeOffset.UtcNow
            },
            new Membership
            {
                Id = Guid.NewGuid(),
                TenantId = InactiveTenantId,
                UserId = InactiveTenantMembershipUserId,
                RoleId = RoleOwnerId,
                Status = MembershipStatus.Active,
                CreatedAt = DateTimeOffset.UtcNow
            });

        db.Sessions.AddRange(
            new Session
            {
                Id = Guid.NewGuid(),
                UserId = ActiveUserId,
                TenantId = TenantAId,
                TokenHash = HashToken(ActiveSessionToken),
                ExpiresAt = DateTimeOffset.UtcNow.AddHours(1),
                CreatedAt = DateTimeOffset.UtcNow
            },
            new Session
            {
                Id = Guid.NewGuid(),
                UserId = SuspendedMembershipUserId,
                TenantId = TenantAId,
                TokenHash = HashToken(SuspendedSessionToken),
                ExpiresAt = DateTimeOffset.UtcNow.AddHours(1),
                CreatedAt = DateTimeOffset.UtcNow
            },
            new Session
            {
                Id = Guid.NewGuid(),
                UserId = MultiTenantUserId,
                TenantId = TenantAId,
                TokenHash = HashToken(MultiTenantSessionToken),
                ExpiresAt = DateTimeOffset.UtcNow.AddHours(1),
                CreatedAt = DateTimeOffset.UtcNow
            },
            new Session
            {
                Id = Guid.NewGuid(),
                UserId = RevokedMembershipUserId,
                TenantId = TenantAId,
                TokenHash = HashToken(RevokedSessionToken),
                ExpiresAt = DateTimeOffset.UtcNow.AddHours(1),
                CreatedAt = DateTimeOffset.UtcNow
            });

        db.SaveChanges();
    }

    private static string HashPassword(string password)
    {
        var iterations = 120_000;
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, 32);
        return $"v1${iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    private static string HashToken(string token)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
