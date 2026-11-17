using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TukodHub.Api.Data;
using TukodHub.Api.Infrastructure;
using TukodHub.Api.Services;

namespace TukodHub.Api.Security;

public sealed class TenantSessionAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    AppDbContext dbContext,
    ITenantContextAccessor tenantContextAccessor) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    private const string SessionCookie = "tukodhub_session";

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Cookies.TryGetValue(SessionCookie, out var sessionToken) || string.IsNullOrWhiteSpace(sessionToken))
        {
            return AuthenticateResult.NoResult();
        }

        var tokenHash = PasswordSecurity.HashToken(sessionToken);
        var session = await dbContext.Sessions
            .Include(item => item.User)
            .Include(item => item.Tenant)
            .SingleOrDefaultAsync(item => item.TokenHash == tokenHash, Context.RequestAborted);

        if (session is null || session.RevokedAt is not null || session.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            Logger.LogInformation("Tenant session authentication failed due to invalid or expired session.");
            return AuthenticateResult.Fail("The session is invalid.");
        }

        if (session.User.Status != UserStatus.Active || session.Tenant.Status != TenantStatus.Active)
        {
            Logger.LogInformation("Tenant session authentication failed due to inactive account or tenant.");
            return AuthenticateResult.Fail("The account is not active.");
        }

        var membership = await dbContext.Memberships
            .Include(item => item.Role)
            .SingleOrDefaultAsync(
                item => item.UserId == session.UserId
                    && item.TenantId == session.TenantId
                    && item.Status == MembershipStatus.Active,
                Context.RequestAborted);

        if (membership is null)
        {
            Logger.LogInformation("Tenant session authentication failed due to missing active membership.");
            return AuthenticateResult.Fail("No active membership exists for this session.");
        }

        if (membership.Role.Scope != RoleScope.Tenant || !membership.Role.IsActive)
        {
            Logger.LogInformation("Tenant session authentication failed due to inactive or invalid role assignment.");
            return AuthenticateResult.Fail("No active tenant role exists for this session.");
        }

        var tenantContext = tenantContextAccessor.Current;
        if (tenantContext.Scope == HostScope.Tenant)
        {
            if (tenantContext.TenantId is null || tenantContext.TenantId != session.TenantId)
            {
                Logger.LogInformation("Tenant session authentication failed due to tenant mismatch.");
                return AuthenticateResult.Fail("The authenticated user does not belong to the requested tenant.");
            }

            if (!string.Equals(tenantContext.TenantSlug, session.Tenant.Slug, StringComparison.Ordinal))
            {
                Logger.LogInformation("Tenant session authentication failed due to tenant slug mismatch.");
                return AuthenticateResult.Fail("The authenticated tenant context is invalid.");
            }
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, session.UserId.ToString()),
            new("sub", session.UserId.ToString()),
            new(ClaimTypes.Email, session.User.Email),
            new("tenant_id", session.TenantId.ToString()),
            new("tenant_slug", session.Tenant.Slug),
            new("sid", session.Id.ToString()),
            new(ClaimTypes.Role, membership.Role.Name),
            new("membership_status", membership.Status.ToString())
        };

        var identity = new ClaimsIdentity(claims, AuthSchemes.TenantSession);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, AuthSchemes.TenantSession);
        return AuthenticateResult.Success(ticket);
    }
}
