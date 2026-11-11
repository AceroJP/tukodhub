namespace TukodHub.Api.Infrastructure;

public enum HostScope
{
    Platform,
    Tenant,
    Unknown
}

public sealed record TenantHostContext(HostScope Scope, string? TenantSlug, string Host);

public interface ITenantHostResolver
{
    TenantHostContext Resolve(string host);
}

public sealed class TenantHostResolver(IConfiguration configuration) : ITenantHostResolver
{
    public TenantHostContext Resolve(string host)
    {
        var normalizedHost = host.Split(':')[0].Trim().ToLowerInvariant();
        var platformHost = Normalize(configuration["PlatformHost"] ?? "app.tukodhub.com");
        var baseDomain = Normalize(configuration["TenantBaseDomain"] ?? "tukodhub.com");

        if (normalizedHost == platformHost || normalizedHost == "localhost")
        {
            return new TenantHostContext(HostScope.Platform, null, normalizedHost);
        }

        if (normalizedHost.EndsWith($".{baseDomain}", StringComparison.Ordinal))
        {
            var subdomain = normalizedHost[..^(baseDomain.Length + 1)];
            if (IsValidTenantSlug(subdomain))
            {
                return new TenantHostContext(HostScope.Tenant, subdomain, normalizedHost);
            }
        }

        if (normalizedHost.EndsWith(".localhost", StringComparison.Ordinal))
        {
            var subdomain = normalizedHost[..^".localhost".Length];
            if (IsValidTenantSlug(subdomain))
            {
                return new TenantHostContext(HostScope.Tenant, subdomain, normalizedHost);
            }
        }

        return new TenantHostContext(HostScope.Unknown, null, normalizedHost);
    }

    private static string Normalize(string host) => host.Split(':')[0].Trim().ToLowerInvariant();

    private static bool IsValidTenantSlug(string value) =>
        value.Length is >= 3 and <= 100
        && value.All(character => char.IsLetterOrDigit(character) || character == '-')
        && value[0] != '-'
        && value[^1] != '-';
}
