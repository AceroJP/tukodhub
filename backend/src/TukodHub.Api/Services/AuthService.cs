using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TukodHub.Api.Contracts;
using TukodHub.Api.Data;

namespace TukodHub.Api.Services;

public interface IAuthService
{
    Task<AuthOperationResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<AuthOperationResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<AuthUserResponse?> GetCurrentUserAsync(string? sessionToken, CancellationToken cancellationToken);
    Task LogoutAsync(string? sessionToken, CancellationToken cancellationToken);
}

public sealed class AuthService(AppDbContext dbContext) : IAuthService
{
    private const int SessionLifetimeHours = 24;

    public async Task<AuthOperationResult> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        if (await dbContext.Users.AnyAsync(user => user.NormalizedEmail == normalizedEmail, cancellationToken))
        {
            return AuthOperationResult.Conflict("An account with this email already exists.");
        }

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = request.BusinessName.Trim(),
            Slug = await CreateUniqueSlugAsync(request.BusinessName, cancellationToken),
            CreatedAt = DateTimeOffset.UtcNow
        };
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.Trim(),
            NormalizedEmail = normalizedEmail,
            PasswordHash = PasswordSecurity.Hash(request.Password),
            DisplayName = request.OwnerName.Trim(),
            Phone = request.Phone?.Trim(),
            Status = UserStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };
        var role = await dbContext.Roles.SingleOrDefaultAsync(
            item => item.Scope == RoleScope.Tenant && item.Name == "Owner",
            cancellationToken);
        var roleExists = role is not null;
        role ??= new Role
        {
            Id = Guid.NewGuid(),
            Name = "Owner",
            Scope = RoleScope.Tenant
        };
        var membership = new Membership
        {
            Id = Guid.NewGuid(),
            TenantId = tenant.Id,
            UserId = user.Id,
            RoleId = role.Id,
            Status = MembershipStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };
        var profile = new BusinessProfile
        {
            TenantId = tenant.Id,
            LegalName = request.BusinessName.Trim(),
            DisplayName = request.BusinessName.Trim(),
            Phone = request.Phone?.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        var session = CreateSession(user.Id, tenant.Id, out var rawToken);

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        dbContext.Tenants.Add(tenant);
        dbContext.Users.Add(user);
        if (!roleExists)
        {
            dbContext.Roles.Add(role);
        }
        dbContext.BusinessProfiles.Add(profile);
        dbContext.Memberships.Add(membership);
        dbContext.Sessions.Add(session);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return AuthOperationResult.Success(CreateResponse(user, tenant, role, session, rawToken));
    }

    public async Task<AuthOperationResult> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        var user = await dbContext.Users
            .Include(item => item.Memberships)
            .ThenInclude(item => item.Tenant)
            .SingleOrDefaultAsync(item => item.NormalizedEmail == normalizedEmail, cancellationToken);

        if (user is null || user.Status != UserStatus.Active || !PasswordSecurity.Verify(request.Password, user.PasswordHash))
        {
            return AuthOperationResult.Unauthorized("Invalid email or password.");
        }

        var membership = user.Memberships.FirstOrDefault(item => item.Status == MembershipStatus.Active);
        if (membership is null)
        {
            return AuthOperationResult.Unauthorized("This account has no active business membership.");
        }

        var role = await dbContext.Roles.FindAsync([membership.RoleId], cancellationToken);
        if (role is null)
        {
            return AuthOperationResult.Unauthorized("This account has no valid role.");
        }

        var session = CreateSession(user.Id, membership.TenantId, out var rawToken);
        dbContext.Sessions.Add(session);
        await dbContext.SaveChangesAsync(cancellationToken);
        return AuthOperationResult.Success(CreateResponse(user, membership.Tenant, role, session, rawToken));
    }

    public async Task<AuthUserResponse?> GetCurrentUserAsync(
        string? sessionToken,
        CancellationToken cancellationToken)
    {
        var session = await FindSessionAsync(sessionToken, cancellationToken);
        if (session is null)
        {
            return null;
        }

        var membership = await dbContext.Memberships
            .Include(item => item.User)
            .Include(item => item.Tenant)
            .Include(item => item.Role)
            .SingleOrDefaultAsync(
                item => item.UserId == session.UserId
                    && item.TenantId == session.TenantId
                    && item.Status == MembershipStatus.Active,
                cancellationToken);

        return membership is null
            ? null
            : CreateResponse(membership.User, membership.Tenant, membership.Role, session, null).User;
    }

    public async Task LogoutAsync(string? sessionToken, CancellationToken cancellationToken)
    {
        var session = await FindSessionAsync(sessionToken, cancellationToken);
        if (session is null)
        {
            return;
        }

        session.RevokedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<Session?> FindSessionAsync(string? sessionToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(sessionToken))
        {
            return null;
        }

        var tokenHash = PasswordSecurity.HashToken(sessionToken);
        return await dbContext.Sessions.SingleOrDefaultAsync(
            item => item.TokenHash == tokenHash
                && item.RevokedAt == null
                && item.ExpiresAt > DateTimeOffset.UtcNow,
            cancellationToken);
    }

    private async Task<string> CreateUniqueSlugAsync(string businessName, CancellationToken cancellationToken)
    {
        var baseSlug = Slugify(businessName);
        var slug = baseSlug;
        var suffix = 2;
        while (await dbContext.Tenants.AnyAsync(item => item.Slug == slug, cancellationToken))
        {
            slug = $"{baseSlug}-{suffix++}";
        }

        return slug;
    }

    private static Session CreateSession(Guid userId, Guid tenantId, out string rawToken)
    {
        rawToken = PasswordSecurity.CreateToken();
        return new Session
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TenantId = tenantId,
            TokenHash = PasswordSecurity.HashToken(rawToken),
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(SessionLifetimeHours),
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    private static AuthResponse CreateResponse(
        User user,
        Tenant tenant,
        Role role,
        Session session,
        string? rawToken)
    {
        return new AuthResponse(
            rawToken,
            session.ExpiresAt,
            new AuthUserResponse(user.Id, user.Email, user.DisplayName, tenant.Id, tenant.Name, role.Name));
    }

    private static string NormalizeEmail(string email) => email.Trim().ToUpperInvariant();

    private static string Slugify(string value)
    {
        var slug = new string(value.Trim().ToLowerInvariant()
            .Select(character => char.IsLetterOrDigit(character) ? character : '-')
            .ToArray());
        return string.Join('-', slug.Split('-', StringSplitOptions.RemoveEmptyEntries)) is { Length: > 0 } result
            ? result
            : $"business-{Guid.NewGuid():N}"[..20];
    }
}

internal static class PasswordSecurity
{
    private const int Iterations = 120_000;

    public static string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, 32);
        return $"v1${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public static bool Verify(string password, string encodedHash)
    {
        var parts = encodedHash.Split('$');
        if (parts.Length != 4 || parts[0] != "v1" || !int.TryParse(parts[1], out var iterations))
        {
            return false;
        }

        try
        {
            var salt = Convert.FromBase64String(parts[2]);
            var expected = Convert.FromBase64String(parts[3]);
            var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException)
        {
            return false;
        }
    }

    public static string CreateToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

    public static string HashToken(string token)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
