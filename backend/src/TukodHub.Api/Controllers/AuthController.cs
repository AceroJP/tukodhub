using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TukodHub.Api.Contracts;
using TukodHub.Api.Infrastructure;
using TukodHub.Api.Services;

namespace TukodHub.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController(IAuthService authService, IAntiforgery antiforgery) : ControllerBase
{
    private const string SessionCookie = "tukodhub_session";

    [HttpGet("csrf")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CsrfTokenResponse), StatusCodes.Status200OK)]
    public ActionResult<CsrfTokenResponse> GetCsrfToken()
    {
        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(new CsrfTokenResponse(tokens.RequestToken ?? string.Empty));
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthWrite")]
    [ProducesResponseType(typeof(AuthenticatedAccountResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthenticatedAccountResponse>> Register(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.RegisterAsync(request, cancellationToken);
        if (result.Response is null)
        {
            return Conflict(new ProblemDetails { Title = result.Error, Status = result.StatusCode });
        }

        ApplySessionFromAuthResponse(result.Response);
        return StatusCode(StatusCodes.Status201Created, result.Response.Account);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthWrite")]
    [ProducesResponseType(typeof(AuthenticatedAccountResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthenticatedAccountResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);
        if (result.Response is null)
        {
            return Unauthorized(new ProblemDetails { Title = result.Error, Status = result.StatusCode });
        }

        ApplySessionFromAuthResponse(result.Response);
        return Ok(result.Response.Account);
    }

    [HttpPost("password-reset/request")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthWrite")]
    [ProducesResponseType(typeof(PasswordResetRequestAcceptedResponse), StatusCodes.Status202Accepted)]
    public async Task<ActionResult<PasswordResetRequestAcceptedResponse>> RequestPasswordReset(
        PasswordResetRequest request,
        CancellationToken cancellationToken)
    {
        var resetToken = await authService.RequestPasswordResetAsync(request, cancellationToken);
        return Accepted(new PasswordResetRequestAcceptedResponse(resetToken));
    }

    [HttpPost("password-reset/confirm")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthWrite")]
    [ProducesResponseType(typeof(AuthenticatedAccountResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthenticatedAccountResponse>> ConfirmPasswordReset(
        ConfirmPasswordResetRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.ConfirmPasswordResetAsync(request, cancellationToken);
        if (result.Response is null)
        {
            return Unauthorized(new ProblemDetails { Title = result.Error, Status = result.StatusCode });
        }

        ApplySessionFromAuthResponse(result.Response);
        return Ok(result.Response.Account);
    }

    [HttpPost("password/change")]
    [Authorize(AuthenticationSchemes = AuthSchemes.TenantSession, Policy = "TenantMember")]
    [ProducesResponseType(typeof(AuthenticatedAccountResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AuthenticatedAccountResponse>> ChangePassword(
        ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        await antiforgery.ValidateRequestAsync(HttpContext);

        var result = await authService.ChangePasswordAsync(Request.Cookies[SessionCookie], request, cancellationToken);
        if (result.Response is null)
        {
            return Unauthorized(new ProblemDetails { Title = result.Error, Status = result.StatusCode });
        }

        ApplySessionFromAuthResponse(result.Response);
        return Ok(result.Response.Account);
    }

    [HttpGet("account")]
    [Authorize(AuthenticationSchemes = AuthSchemes.TenantSession, Policy = "TenantMember")]
    [ProducesResponseType(typeof(AuthenticatedAccountResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AuthenticatedAccountResponse>> Account(CancellationToken cancellationToken)
    {
        var account = await authService.GetAccountAsync(Request.Cookies[SessionCookie], cancellationToken);
        return account is null
            ? Unauthorized(new ProblemDetails { Title = "Authentication is required.", Status = 401 })
            : Ok(account);
    }

    [HttpPost("tenant/switch")]
    [Authorize(AuthenticationSchemes = AuthSchemes.TenantSession, Policy = "TenantMember")]
    [ProducesResponseType(typeof(AuthenticatedAccountResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AuthenticatedAccountResponse>> SwitchTenant(
        SwitchTenantRequest request,
        CancellationToken cancellationToken)
    {
        await antiforgery.ValidateRequestAsync(HttpContext);

        var result = await authService.SwitchTenantAsync(Request.Cookies[SessionCookie], request, cancellationToken);
        if (result.Response is null)
        {
            return result.StatusCode switch
            {
                StatusCodes.Status400BadRequest => BadRequest(new ProblemDetails { Title = result.Error, Status = result.StatusCode }),
                _ => Unauthorized(new ProblemDetails { Title = result.Error, Status = result.StatusCode })
            };
        }

        ApplySessionFromAuthResponse(result.Response);
        return Ok(result.Response.Account);
    }

    [HttpGet("sessions")]
    [Authorize(AuthenticationSchemes = AuthSchemes.TenantSession, Policy = "TenantMember")]
    [ProducesResponseType(typeof(IReadOnlyList<SessionSummaryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<SessionSummaryResponse>>> Sessions(CancellationToken cancellationToken)
    {
        var sessions = await authService.GetSessionsAsync(Request.Cookies[SessionCookie], cancellationToken);
        return Ok(sessions);
    }

    [HttpDelete("sessions/{sessionId:guid}")]
    [Authorize(AuthenticationSchemes = AuthSchemes.TenantSession, Policy = "TenantMember")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RevokeSession(Guid sessionId, CancellationToken cancellationToken)
    {
        await antiforgery.ValidateRequestAsync(HttpContext);

        var revoked = await authService.RevokeSessionAsync(Request.Cookies[SessionCookie], sessionId, cancellationToken);
        if (!revoked)
        {
            return NotFound();
        }

        if (User.FindFirst("sid")?.Value == sessionId.ToString())
        {
            Response.Cookies.Delete(SessionCookie);
        }

        return NoContent();
    }

    [HttpPost("logout")]
    [Authorize(AuthenticationSchemes = AuthSchemes.TenantSession, Policy = "TenantMember")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        await antiforgery.ValidateRequestAsync(HttpContext);
        await authService.LogoutAsync(Request.Cookies[SessionCookie], cancellationToken);
        Response.Cookies.Delete(SessionCookie);
        return NoContent();
    }

    [HttpPost("logout-all")]
    [Authorize(AuthenticationSchemes = AuthSchemes.TenantSession, Policy = "TenantMember")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> LogoutAll(CancellationToken cancellationToken)
    {
        await antiforgery.ValidateRequestAsync(HttpContext);
        await authService.LogoutAllAsync(Request.Cookies[SessionCookie], cancellationToken);
        Response.Cookies.Delete(SessionCookie);
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize(AuthenticationSchemes = AuthSchemes.TenantSession, Policy = "TenantMember")]
    [ProducesResponseType(typeof(AuthenticatedAccountResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AuthenticatedAccountResponse>> Me(CancellationToken cancellationToken)
    {
        var account = await authService.GetAccountAsync(Request.Cookies[SessionCookie], cancellationToken);
        return account is null
            ? Unauthorized(new ProblemDetails { Title = "Authentication is required.", Status = 401 })
            : Ok(account);
    }

    private void ApplySessionFromAuthResponse(AuthResponse response)
    {
        if (!string.IsNullOrWhiteSpace(response.SessionToken) && response.SessionExpiresAt is { } expiresAt)
        {
            SetSessionCookie(response.SessionToken, expiresAt);
            return;
        }

        Response.Cookies.Delete(SessionCookie);
    }

    private void SetSessionCookie(string token, DateTimeOffset expires)
    {
        var isDevelopment = HttpContext.RequestServices
            .GetRequiredService<IWebHostEnvironment>()
            .IsDevelopment();

        Response.Cookies.Append(SessionCookie, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Lax,
            Expires = expires,
            IsEssential = true,
            Path = "/"
        });
    }
}

public sealed record CsrfTokenResponse(string Token);
