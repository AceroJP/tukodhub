using System.ComponentModel.DataAnnotations;

namespace TukodHub.Api.Contracts;

/// <summary>Payload for creating a business owner account.</summary>
public sealed record RegisterRequest
{
    [Required, MaxLength(200)]
    public required string BusinessName { get; init; }

    [Required, MaxLength(200)]
    public required string OwnerName { get; init; }

    [Required, EmailAddress, MaxLength(320)]
    public required string Email { get; init; }

    [MaxLength(40)]
    public string? Phone { get; init; }

    [Required, MinLength(12), MaxLength(128)]
    public required string Password { get; init; }
}

/// <summary>Payload for authenticating a business user.</summary>
public sealed record LoginRequest
{
    [Required, EmailAddress, MaxLength(320)]
    public required string Email { get; init; }

    [Required, MinLength(1), MaxLength(128)]
    public required string Password { get; init; }

    [MaxLength(255)]
    public string? PreferredTenantHost { get; init; }

    [MaxLength(100)]
    public string? PreferredTenantSlug { get; init; }
}

public sealed record ChangePasswordRequest
{
    [Required, MinLength(1), MaxLength(128)]
    public required string CurrentPassword { get; init; }

    [Required, MinLength(12), MaxLength(128)]
    public required string NewPassword { get; init; }
}

public sealed record PasswordResetRequest
{
    [Required, EmailAddress, MaxLength(320)]
    public required string Email { get; init; }
}

public sealed record ConfirmPasswordResetRequest
{
    [Required, MinLength(20), MaxLength(512)]
    public required string ResetToken { get; init; }

    [Required, MinLength(12), MaxLength(128)]
    public required string NewPassword { get; init; }
}

public sealed record PasswordResetRequestAcceptedResponse(string? ResetToken);

public sealed record SwitchTenantRequest
{
    [Required, MaxLength(255)]
    public required string TargetTenantHost { get; init; }
}

public sealed record SessionSummaryResponse(
    Guid SessionId,
    DateTimeOffset ExpiresAt,
    DateTimeOffset CreatedAt,
    bool IsCurrent);

public sealed record TenantMembershipSummaryResponse(
    Guid MembershipId,
    Guid TenantId,
    string TenantSlug,
    string TenantName,
    Guid RoleId,
    string RoleName);

public sealed record AuthPrincipalResponse(
    Guid UserId,
    string Email,
    string DisplayName);

public sealed record AuthenticatedAccountResponse(
    AuthPrincipalResponse User,
    TenantMembershipSummaryResponse? ActiveTenant,
    IReadOnlyList<TenantMembershipSummaryResponse> AvailableTenants,
    bool RequiresTenantSelection);

/// <summary>Authenticated user and tenant information.</summary>
public sealed record AuthUserResponse(
    Guid UserId,
    string Email,
    string DisplayName,
    Guid TenantId,
    string TenantName,
    string Role);

/// <summary>Authentication result returned after registration or login.</summary>
public sealed record AuthResponse(
    string? SessionToken,
    DateTimeOffset? SessionExpiresAt,
    AuthenticatedAccountResponse Account);

public sealed record AuthOperationResult(
    AuthResponse? Response,
    int StatusCode,
    string? Error)
{
    public static AuthOperationResult Success(AuthResponse response) => new(response, 200, null);
    public static AuthOperationResult Conflict(string error) => new(null, 409, error);
    public static AuthOperationResult Unauthorized(string error) => new(null, 401, error);
    public static AuthOperationResult BadRequest(string error) => new(null, 400, error);
}
