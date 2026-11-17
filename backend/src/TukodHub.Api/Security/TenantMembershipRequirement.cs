using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using TukodHub.Api.Data;
using TukodHub.Api.Infrastructure;

namespace TukodHub.Api.Security;

public sealed class TenantMembershipRequirement : IAuthorizationRequirement;

public sealed class TenantMembershipHandler(ITenantContextAccessor tenantContextAccessor)
    : AuthorizationHandler<TenantMembershipRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        TenantMembershipRequirement requirement)
    {
        var tenantContext = tenantContextAccessor.Current;
        if (tenantContext.Scope != HostScope.Tenant || tenantContext.TenantId is null)
        {
            context.Fail();
            return Task.CompletedTask;
        }

        var principal = context.User;
        if (principal.Identity?.IsAuthenticated != true)
        {
            return Task.CompletedTask;
        }

        var tenantIdClaim = principal.FindFirst("tenant_id")?.Value;
        var membershipStatus = principal.FindFirst("membership_status")?.Value;
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(tenantIdClaim, out var tenantId) || tenantId != tenantContext.TenantId)
        {
            context.Fail();
            return Task.CompletedTask;
        }

        if (!string.Equals(membershipStatus, MembershipStatus.Active.ToString(), StringComparison.Ordinal)
            || string.IsNullOrWhiteSpace(userIdClaim))
        {
            context.Fail();
            return Task.CompletedTask;
        }

        context.Succeed(requirement);
        return Task.CompletedTask;
    }
}

