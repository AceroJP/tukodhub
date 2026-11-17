using Microsoft.EntityFrameworkCore;
using TukodHub.Api.Data;
using TukodHub.Api.Infrastructure;

namespace TukodHub.Api.Middleware;

public sealed class TenantHostMiddleware(
    RequestDelegate next,
    ITenantHostResolver tenantHostResolver,
    ILogger<TenantHostMiddleware> logger)
{
    public async Task InvokeAsync(
        HttpContext context,
        AppDbContext dbContext,
        ITenantContextAccessor tenantContextAccessor)
    {
        var hostContext = tenantHostResolver.Resolve(context.Request.Host.Value ?? string.Empty);

        if (hostContext.Scope == HostScope.Tenant && !string.IsNullOrWhiteSpace(hostContext.TenantSlug))
        {
            var tenant = await dbContext.Tenants
                .AsNoTracking()
                .Where(item => item.Slug == hostContext.TenantSlug)
                .Select(item => new { item.Id, item.Slug, item.Status })
                .SingleOrDefaultAsync(context.RequestAborted);

            if (tenant is null || tenant.Status != TenantStatus.Active)
            {
                logger.LogWarning("Request received for an unknown or inactive tenant host: {Host}", hostContext.Host);
                hostContext = new TenantHostContext(HostScope.Unknown, null, hostContext.Host, null);
            }
            else
            {
                hostContext = hostContext with { TenantId = tenant.Id };
            }
        }

        tenantContextAccessor.SetCurrent(hostContext);
        context.Items[typeof(TenantHostContext)] = hostContext;

        if (hostContext.Scope == HostScope.Unknown)
        {
            logger.LogWarning("Request received for an unrecognized host: {Host}", hostContext.Host);
        }

        await next(context);
    }
}
