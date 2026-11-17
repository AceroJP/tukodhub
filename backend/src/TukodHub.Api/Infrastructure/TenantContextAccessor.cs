namespace TukodHub.Api.Infrastructure;

public interface ITenantContextAccessor
{
    TenantHostContext Current { get; }
    void SetCurrent(TenantHostContext context);
}

public sealed class TenantContextAccessor : ITenantContextAccessor
{
    private TenantHostContext current = new(HostScope.Unknown, null, string.Empty, null);

    public TenantHostContext Current => current;

    public void SetCurrent(TenantHostContext context)
    {
        current = context;
    }
}
