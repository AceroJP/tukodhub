using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using TukodHub.Api.Contracts;
using TukodHub.Api.Data;
using TukodHub.Api.Infrastructure;

namespace TukodHub.Api.Services;

public interface IAuthService
{
    Task<AuthOperationResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<AuthOperationResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<AuthOperationResult> SwitchTenantAsync(string? sessionToken, SwitchTenantRequest request, CancellationToken cancellationToken);
    Task<AuthenticatedAccountResponse?> GetAccountAsync(string? sessionToken, CancellationToken cancellationToken);
    Task<AuthOperationResult> ChangePasswordAsync(string? sessionToken, ChangePasswordRequest request, CancellationToken cancellationToken);
    Task<string?> RequestPasswordResetAsync(PasswordResetRequest request, CancellationToken cancellationToken);
    Task<AuthOperationResult> ConfirmPasswordResetAsync(ConfirmPasswordResetRequest request, CancellationToken cancellationToken);
    Task<AuthUserResponse?> GetCurrentUserAsync(string? sessionToken, CancellationToken cancellationToken);
    Task<IReadOnlyList<SessionSummaryResponse>> GetSessionsAsync(string? sessionToken, CancellationToken cancellationToken);
    Task LogoutAsync(string? sessionToken, CancellationToken cancellationToken);
    Task LogoutAllAsync(string? sessionToken, CancellationToken cancellationToken);
    Task<bool> RevokeSessionAsync(string? currentSessionToken, Guid sessionId, CancellationToken cancellationToken);
}

public sealed class AuthService(
    AppDbContext dbContext,
    ILogger<AuthService> logger,
    IHostEnvironment environment,
    IDataProtectionProvider dataProtectionProvider,
    ITenantHostResolver tenantHostResolver) : IAuthService
{
    private const int SessionLifetimeHours = 24;
    private const int PasswordResetTokenLifetimeMinutes = 30;
    private readonly IDataProtector resetTokenProtector = dataProtectionProvider.CreateProtector("tukodhub:auth:password-reset:v1");

    public async Task<AuthOperationResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        if (await dbContext.Users.AnyAsync(user => user.NormalizedEmail == normalizedEmail, cancellationToken))
        {
            logger.LogWarning("Registration rejected because email is already registered.");
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

        var activeMembership = new ActiveMembership(
            membership.Id,
            tenant.Id,
            tenant.Slug,
            tenant.Name,
            role.Id,
            role.Name,
            role.Scope,
            role.IsActive);

        var account = BuildAccountResponse(user, activeMembership, [activeMembership], requiresTenantSelection: false);
        return AuthOperationResult.Success(new AuthResponse(rawToken, session.ExpiresAt, account));
    }

    public async Task<AuthOperationResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        var user = await dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.NormalizedEmail == normalizedEmail, cancellationToken);

        if (user is null || user.Status != UserStatus.Active || !PasswordSecurity.Verify(request.Password, user.PasswordHash))
        {
            logger.LogWarning("Login rejected due to invalid credentials or inactive account.");
            return AuthOperationResult.Unauthorized("Invalid email or password.");
        }

        var activeMemberships = await GetActiveMembershipsAsync(user.Id, cancellationToken);
        if (activeMemberships.Count == 0)
        {
            logger.LogWarning("Login rejected because account has no active tenant membership.");
            return AuthOperationResult.Unauthorized("Invalid email or password.");
        }

        var selectedMembership = ResolvePreferredMembership(activeMemberships, request.PreferredTenantHost, request.PreferredTenantSlug);
        if (selectedMembership is null && activeMemberships.Count > 1)
        {
            logger.LogInformation("Login succeeded for user {UserId} and requires explicit tenant selection.", user.Id);
            var selectionAccount = BuildAccountResponse(user, null, activeMemberships, requiresTenantSelection: true);
            return AuthOperationResult.Success(new AuthResponse(null, null, selectionAccount));
        }

        if (selectedMembership is null)
        {
            selectedMembership = activeMemberships[0];
        }

        var session = CreateSession(user.Id, selectedMembership.TenantId, out var rawToken);
        dbContext.Sessions.Add(session);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Tenant user login succeeded for user {UserId} in tenant {TenantId}.", user.Id, selectedMembership.TenantId);
        var account = BuildAccountResponse(user, selectedMembership, activeMemberships, requiresTenantSelection: false);
        return AuthOperationResult.Success(new AuthResponse(rawToken, session.ExpiresAt, account));
    }

    public async Task<AuthOperationResult> SwitchTenantAsync(
        string? sessionToken,
        SwitchTenantRequest request,
        CancellationToken cancellationToken)
    {
        var currentSession = await FindSessionAsync(sessionToken, includeUser: true, cancellationToken);
        if (currentSession is null || currentSession.User.Status != UserStatus.Active)
        {
            return AuthOperationResult.Unauthorized("Authentication is required.");
        }

        if (!TryNormalizeHost(request.TargetTenantHost, out var requestedHost))
        {
            return AuthOperationResult.BadRequest("A valid tenant host is required.");
        }

        var hostContext = tenantHostResolver.Resolve(requestedHost);
        if (hostContext.Scope != HostScope.Tenant || string.IsNullOrWhiteSpace(hostContext.TenantSlug))
        {
            logger.LogWarning("Tenant switch rejected due to unsupported tenant host: {RequestedHost}", requestedHost);
            return AuthOperationResult.BadRequest("The tenant host is not valid.");
        }

        var activeMemberships = await GetActiveMembershipsAsync(currentSession.UserId, cancellationToken);
        var destination = activeMemberships.SingleOrDefault(item => item.TenantSlug == hostContext.TenantSlug);
        if (destination is null)
        {
            logger.LogWarning("Tenant switch rejected because user {UserId} has no active membership for {TenantSlug}.", currentSession.UserId, hostContext.TenantSlug);
            return AuthOperationResult.Unauthorized("You are not authorized for the requested tenant.");
        }

        currentSession.RevokedAt = DateTimeOffset.UtcNow;

        var replacementSession = CreateSession(currentSession.UserId, destination.TenantId, out var rawToken);
        dbContext.Sessions.Add(replacementSession);
        await dbContext.SaveChangesAsync(cancellationToken);

        var account = BuildAccountResponse(currentSession.User, destination, activeMemberships, requiresTenantSelection: false);
        logger.LogInformation("Tenant switch succeeded for user {UserId}: {SourceTenantId} -> {DestinationTenantId}.",
            currentSession.UserId,
            currentSession.TenantId,
            destination.TenantId);

        return AuthOperationResult.Success(new AuthResponse(rawToken, replacementSession.ExpiresAt, account));
    }

    public async Task<AuthenticatedAccountResponse?> GetAccountAsync(string? sessionToken, CancellationToken cancellationToken)
    {
        var session = await FindSessionAsync(sessionToken, includeUser: true, cancellationToken);
        if (session is null || session.User.Status != UserStatus.Active)
        {
            return null;
        }

        var memberships = await GetActiveMembershipsAsync(session.UserId, cancellationToken);
        var active = memberships.SingleOrDefault(item => item.TenantId == session.TenantId);
        return BuildAccountResponse(session.User, active, memberships, requiresTenantSelection: false);
    }

    public async Task<AuthOperationResult> ChangePasswordAsync(
        string? sessionToken,
        ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var session = await FindSessionAsync(sessionToken, includeUser: true, cancellationToken);
        if (session is null || session.User.Status != UserStatus.Active)
        {
            logger.LogWarning("Password change rejected due to invalid session.");
            return AuthOperationResult.Unauthorized("Authentication is required.");
        }

        if (!PasswordSecurity.Verify(request.CurrentPassword, session.User.PasswordHash))
        {
            logger.LogWarning("Password change rejected due to invalid current password for user {UserId}.", session.UserId);
            return AuthOperationResult.Unauthorized("The current password is incorrect.");
        }

        session.User.PasswordHash = PasswordSecurity.Hash(request.NewPassword);
        await RevokeAllActiveSessionsForUserAsync(session.UserId, cancellationToken);

        var memberships = await GetActiveMembershipsAsync(session.UserId, cancellationToken);
        var activeMembership = memberships.SingleOrDefault(item => item.TenantId == session.TenantId);
        if (activeMembership is null)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            logger.LogWarning("Password changed but no active tenant role remains for user {UserId}.", session.UserId);
            return AuthOperationResult.Unauthorized("This account has no active tenant role.");
        }

        var replacementSession = CreateSession(session.UserId, session.TenantId, out var rawToken);
        dbContext.Sessions.Add(replacementSession);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Password changed and all sessions revoked for user {UserId}.", session.UserId);
        var account = BuildAccountResponse(session.User, activeMembership, memberships, requiresTenantSelection: false);
        return AuthOperationResult.Success(new AuthResponse(rawToken, replacementSession.ExpiresAt, account));
    }

    public async Task<string?> RequestPasswordResetAsync(PasswordResetRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        var user = await dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.NormalizedEmail == normalizedEmail, cancellationToken);

        if (user is null || user.Status != UserStatus.Active)
        {
            logger.LogInformation("Password reset requested for unknown or inactive email.");
            return null;
        }

        var memberships = await GetActiveMembershipsAsync(user.Id, cancellationToken);
        if (memberships.Count == 0)
        {
            logger.LogInformation("Password reset requested for user with no active membership: {UserId}.", user.Id);
            return null;
        }

        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(PasswordResetTokenLifetimeMinutes);
        var proof = PasswordSecurity.HashToken(user.PasswordHash);
        var payload = $"{user.Id:N}|{expiresAt.ToUnixTimeSeconds()}|{proof}";
        var resetToken = resetTokenProtector.Protect(payload);

        logger.LogInformation("Password reset token generated for user {UserId}.", user.Id);

        if (!environment.IsDevelopment())
        {
            return null;
        }

        logger.LogInformation("Development password reset token for user {UserId}: {ResetToken}", user.Id, resetToken);
        return resetToken;
    }

    public async Task<AuthOperationResult> ConfirmPasswordResetAsync(
        ConfirmPasswordResetRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryReadResetToken(request.ResetToken, out var userId, out var expiresAtUnix, out var proofHash))
        {
            logger.LogWarning("Password reset confirmation rejected due to invalid token format.");
            return AuthOperationResult.Unauthorized("The password reset token is invalid or expired.");
        }

        if (DateTimeOffset.FromUnixTimeSeconds(expiresAtUnix) <= DateTimeOffset.UtcNow)
        {
            logger.LogWarning("Password reset confirmation rejected due to expired token.");
            return AuthOperationResult.Unauthorized("The password reset token is invalid or expired.");
        }

        var user = await dbContext.Users.SingleOrDefaultAsync(item => item.Id == userId, cancellationToken);
        if (user is null || user.Status != UserStatus.Active)
        {
            logger.LogWarning("Password reset confirmation rejected due to inactive user.");
            return AuthOperationResult.Unauthorized("The password reset token is invalid or expired.");
        }

        var currentProof = PasswordSecurity.HashToken(user.PasswordHash);
        if (!CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(currentProof), Encoding.UTF8.GetBytes(proofHash)))
        {
            logger.LogWarning("Password reset confirmation rejected due to stale token proof mismatch.");
            return AuthOperationResult.Unauthorized("The password reset token is invalid or expired.");
        }

        var memberships = await GetActiveMembershipsAsync(userId, cancellationToken);
        if (memberships.Count == 0)
        {
            logger.LogWarning("Password reset confirmation rejected due to missing tenant membership/role.");
            return AuthOperationResult.Unauthorized("The password reset token is invalid or expired.");
        }

        user.PasswordHash = PasswordSecurity.Hash(request.NewPassword);
        await RevokeAllActiveSessionsForUserAsync(userId, cancellationToken);

        if (memberships.Count > 1)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Password reset confirmed for user {UserId}; explicit tenant selection is required.", userId);
            var selectionAccount = BuildAccountResponse(user, null, memberships, requiresTenantSelection: true);
            return AuthOperationResult.Success(new AuthResponse(null, null, selectionAccount));
        }

        var activeMembership = memberships[0];
        var session = CreateSession(userId, activeMembership.TenantId, out var rawToken);
        dbContext.Sessions.Add(session);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Password reset confirmed and sessions revoked for user {UserId}.", userId);
        var account = BuildAccountResponse(user, activeMembership, memberships, requiresTenantSelection: false);
        return AuthOperationResult.Success(new AuthResponse(rawToken, session.ExpiresAt, account));
    }

    public async Task<AuthUserResponse?> GetCurrentUserAsync(string? sessionToken, CancellationToken cancellationToken)
    {
        var session = await FindSessionAsync(sessionToken, includeUser: false, cancellationToken);
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
            : new AuthUserResponse(
                membership.User.Id,
                membership.User.Email,
                membership.User.DisplayName,
                membership.Tenant.Id,
                membership.Tenant.Name,
                membership.Role.Name);
    }

    public async Task<IReadOnlyList<SessionSummaryResponse>> GetSessionsAsync(string? sessionToken, CancellationToken cancellationToken)
    {
        var currentSession = await FindSessionAsync(sessionToken, includeUser: false, cancellationToken);
        if (currentSession is null)
        {
            return [];
        }

        var now = DateTimeOffset.UtcNow;
        var sessions = await dbContext.Sessions
            .AsNoTracking()
            .Where(item => item.UserId == currentSession.UserId
                && item.TenantId == currentSession.TenantId
                && item.RevokedAt == null
                && item.ExpiresAt > now)
            .OrderByDescending(item => item.CreatedAt)
            .Select(item => new SessionSummaryResponse(
                item.Id,
                item.ExpiresAt,
                item.CreatedAt,
                item.Id == currentSession.Id))
            .ToListAsync(cancellationToken);

        return sessions;
    }

    public async Task LogoutAsync(string? sessionToken, CancellationToken cancellationToken)
    {
        var session = await FindSessionAsync(sessionToken, includeUser: false, cancellationToken);
        if (session is null)
        {
            return;
        }

        session.RevokedAt = DateTimeOffset.UtcNow;
        logger.LogInformation("Session revoked for user {UserId} in tenant {TenantId}.", session.UserId, session.TenantId);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task LogoutAllAsync(string? sessionToken, CancellationToken cancellationToken)
    {
        var session = await FindSessionAsync(sessionToken, includeUser: false, cancellationToken);
        if (session is null)
        {
            return;
        }

        await RevokeSessionsForTenantAsync(session.UserId, session.TenantId, null, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("All sessions revoked for user {UserId} in tenant {TenantId}.", session.UserId, session.TenantId);
    }

    public async Task<bool> RevokeSessionAsync(string? currentSessionToken, Guid sessionId, CancellationToken cancellationToken)
    {
        var currentSession = await FindSessionAsync(currentSessionToken, includeUser: false, cancellationToken);
        if (currentSession is null)
        {
            return false;
        }

        var targetSession = await dbContext.Sessions.SingleOrDefaultAsync(
            item => item.Id == sessionId
                && item.UserId == currentSession.UserId
                && item.TenantId == currentSession.TenantId
                && item.RevokedAt == null,
            cancellationToken);

        if (targetSession is null)
        {
            return false;
        }

        targetSession.RevokedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Session {SessionId} revoked for user {UserId} in tenant {TenantId}.", sessionId, currentSession.UserId, currentSession.TenantId);
        return true;
    }

    private async Task<Session?> FindSessionAsync(string? sessionToken, bool includeUser, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(sessionToken))
        {
            return null;
        }

        var tokenHash = PasswordSecurity.HashToken(sessionToken);
        var query = dbContext.Sessions.AsQueryable();

        if (includeUser)
        {
            query = query.Include(item => item.User);
        }

        return await query.SingleOrDefaultAsync(
            item => item.TokenHash == tokenHash
                && item.RevokedAt == null
                && item.ExpiresAt > DateTimeOffset.UtcNow,
            cancellationToken);
    }

    private async Task<List<ActiveMembership>> GetActiveMembershipsAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await dbContext.Memberships
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(item => item.UserId == userId
                && item.Status == MembershipStatus.Active
                && item.Tenant.Status == TenantStatus.Active
                && item.Role.Scope == RoleScope.Tenant
                && item.Role.IsActive)
            .OrderBy(item => item.Tenant.Name)
            .Select(item => new ActiveMembership(
                item.Id,
                item.Tenant.Id,
                item.Tenant.Slug,
                item.Tenant.Name,
                item.Role.Id,
                item.Role.Name,
                item.Role.Scope,
                item.Role.IsActive))
            .ToListAsync(cancellationToken);
    }

    private ActiveMembership? ResolvePreferredMembership(
        IReadOnlyList<ActiveMembership> memberships,
        string? preferredTenantHost,
        string? preferredTenantSlug)
    {
        if (string.IsNullOrWhiteSpace(preferredTenantHost) && string.IsNullOrWhiteSpace(preferredTenantSlug))
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(preferredTenantHost))
        {
            if (!TryNormalizeHost(preferredTenantHost, out var hostValue))
            {
                return null;
            }

            var hostContext = tenantHostResolver.Resolve(hostValue);
            if (hostContext.Scope != HostScope.Tenant || string.IsNullOrWhiteSpace(hostContext.TenantSlug))
            {
                return null;
            }

            return memberships.SingleOrDefault(item => item.TenantSlug == hostContext.TenantSlug);
        }

        var slug = preferredTenantSlug!.Trim().ToLowerInvariant();
        return memberships.SingleOrDefault(item => item.TenantSlug == slug);
    }

    private static bool TryNormalizeHost(string value, out string host)
    {
        host = string.Empty;
        var trimmed = value.Trim();
        if (string.IsNullOrWhiteSpace(trimmed))
        {
            return false;
        }

        if (Uri.TryCreate(trimmed, UriKind.Absolute, out var absolute))
        {
            host = absolute.Authority;
            return !string.IsNullOrWhiteSpace(host);
        }

        host = trimmed;
        return true;
    }

    private async Task RevokeAllActiveSessionsForUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var activeSessions = await dbContext.Sessions
            .IgnoreQueryFilters()
            .Where(item => item.UserId == userId
                && item.RevokedAt == null
                && item.ExpiresAt > now)
            .ToListAsync(cancellationToken);

        foreach (var activeSession in activeSessions)
        {
            activeSession.RevokedAt = now;
        }
    }

    private async Task RevokeSessionsForTenantAsync(Guid userId, Guid tenantId, Guid? exceptSessionId, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var activeSessions = await dbContext.Sessions
            .Where(item => item.UserId == userId
                && item.TenantId == tenantId
                && item.RevokedAt == null
                && item.ExpiresAt > now
                && (exceptSessionId == null || item.Id != exceptSessionId))
            .ToListAsync(cancellationToken);

        foreach (var activeSession in activeSessions)
        {
            activeSession.RevokedAt = now;
        }
    }

    private static AuthenticatedAccountResponse BuildAccountResponse(
        User user,
        ActiveMembership? activeMembership,
        IReadOnlyList<ActiveMembership> memberships,
        bool requiresTenantSelection)
    {
        var available = memberships
            .OrderBy(item => item.TenantName, StringComparer.Ordinal)
            .Select(ToSummary)
            .ToList();

        return new AuthenticatedAccountResponse(
            new AuthPrincipalResponse(user.Id, user.Email, user.DisplayName),
            activeMembership is null ? null : ToSummary(activeMembership),
            available,
            requiresTenantSelection);
    }

    private static TenantMembershipSummaryResponse ToSummary(ActiveMembership membership)
    {
        return new TenantMembershipSummaryResponse(
            membership.MembershipId,
            membership.TenantId,
            membership.TenantSlug,
            membership.TenantName,
            membership.RoleId,
            membership.RoleName);
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

    private bool TryReadResetToken(
        string token,
        out Guid userId,
        out long expiresAtUnix,
        out string proofHash)
    {
        userId = Guid.Empty;
        expiresAtUnix = 0;
        proofHash = string.Empty;

        try
        {
            var unprotected = resetTokenProtector.Unprotect(token);
            var parts = unprotected.Split('|');
            if (parts.Length != 3)
            {
                return false;
            }

            if (!Guid.TryParseExact(parts[0], "N", out userId)
                || !long.TryParse(parts[1], out expiresAtUnix)
                || string.IsNullOrWhiteSpace(parts[2]))
            {
                return false;
            }

            proofHash = parts[2];
            return true;
        }
        catch
        {
            return false;
        }
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

    private sealed record ActiveMembership(
        Guid MembershipId,
        Guid TenantId,
        string TenantSlug,
        string TenantName,
        Guid RoleId,
        string RoleName,
        RoleScope RoleScope,
        bool RoleIsActive);
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
