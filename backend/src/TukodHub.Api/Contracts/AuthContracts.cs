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
}

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
    DateTimeOffset SessionExpiresAt,
    AuthUserResponse User);

public sealed record AuthOperationResult(
    AuthResponse? Response,
    int StatusCode,
    string? Error)
{
    public static AuthOperationResult Success(AuthResponse response) => new(response, 200, null);
    public static AuthOperationResult Conflict(string error) => new(null, 409, error);
    public static AuthOperationResult Unauthorized(string error) => new(null, 401, error);
}
