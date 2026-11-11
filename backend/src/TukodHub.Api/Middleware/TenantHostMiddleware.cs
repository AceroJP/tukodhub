using TukodHub.Api.Infrastructure;

namespace TukodHub.Api.Middleware;

public sealed class TenantHostMiddleware(
    RequestDelegate next,
    ITenantHostResolver tenantHostResolver,
    ILogger<TenantHostMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var hostContext = tenantHostResolver.Resolve(context.Request.Host.Value ?? string.Empty);
        context.Items[typeof(TenantHostContext)] = hostContext;

        if (hostContext.Scope == HostScope.Unknown)
        {
            logger.LogWarning("Request received for an unrecognized host: {Host}", hostContext.Host);
        }

        await next(context);
    }
}
