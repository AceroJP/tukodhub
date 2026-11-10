namespace TukodHub.Api.Data;

public enum TenantStatus
{
    Active,
    Suspended,
    Archived
}

public enum UserStatus
{
    Active,
    Invited,
    Suspended,
    Deactivated
}

public enum RoleScope
{
    Platform,
    Tenant
}

public enum MembershipStatus
{
    Active,
    Invited,
    Suspended,
    Revoked
}

public sealed class Tenant
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public TenantStatus Status { get; set; } = TenantStatus.Active;
    public DateTimeOffset CreatedAt { get; set; }

    public BusinessProfile? BusinessProfile { get; set; }
    public ICollection<Membership> Memberships { get; } = [];
    public ICollection<Session> Sessions { get; } = [];
}

public sealed class BusinessProfile
{
    public Guid TenantId { get; set; }
    public required string LegalName { get; set; }
    public required string DisplayName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string Timezone { get; set; } = "Asia/Manila";
    public string Currency { get; set; } = "PHP";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Tenant Tenant { get; set; } = null!;
}

public sealed class User
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string NormalizedEmail { get; set; }
    public required string PasswordHash { get; set; }
    public required string DisplayName { get; set; }
    public string? Phone { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Invited;
    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<Membership> Memberships { get; } = [];
    public ICollection<Session> Sessions { get; } = [];
}

public sealed class Role
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public RoleScope Scope { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Membership> Memberships { get; } = [];
    public ICollection<RolePermission> RolePermissions { get; } = [];
}

public sealed class Permission
{
    public Guid Id { get; set; }
    public required string Code { get; set; }
    public required string Description { get; set; }

    public ICollection<RolePermission> RolePermissions { get; } = [];
}

public sealed class RolePermission
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }

    public Role Role { get; set; } = null!;
    public Permission Permission { get; set; } = null!;
}

public sealed class Membership
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public MembershipStatus Status { get; set; } = MembershipStatus.Invited;
    public DateTimeOffset CreatedAt { get; set; }

    public Tenant Tenant { get; set; } = null!;
    public User User { get; set; } = null!;
    public Role Role { get; set; } = null!;
}

public sealed class Session
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public required string TokenHash { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public User User { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
}
