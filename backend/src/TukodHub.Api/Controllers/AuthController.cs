using Microsoft.AspNetCore.Mvc;
using TukodHub.Api.Contracts;
using TukodHub.Api.Services;

namespace TukodHub.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    private const string SessionCookie = "tukodhub_session";

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthUserResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthUserResponse>> Register(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.RegisterAsync(request, cancellationToken);
        if (result.Response is null)
        {
            return Conflict(new ProblemDetails { Title = result.Error, Status = result.StatusCode });
        }

        SetSessionCookie(result.Response.SessionToken!, result.Response.SessionExpiresAt);
        return StatusCode(StatusCodes.Status201Created, result.Response.User);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthUserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthUserResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);
        if (result.Response is null)
        {
            return Unauthorized(new ProblemDetails { Title = result.Error, Status = result.StatusCode });
        }

        SetSessionCookie(result.Response.SessionToken!, result.Response.SessionExpiresAt);
        return Ok(result.Response.User);
    }

    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        await authService.LogoutAsync(Request.Cookies[SessionCookie], cancellationToken);
        Response.Cookies.Delete(SessionCookie);
        return NoContent();
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(AuthUserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthUserResponse>> Me(CancellationToken cancellationToken)
    {
        var user = await authService.GetCurrentUserAsync(Request.Cookies[SessionCookie], cancellationToken);
        return user is null
            ? Unauthorized(new ProblemDetails { Title = "Authentication is required.", Status = 401 })
            : Ok(user);
    }

    private void SetSessionCookie(string token, DateTimeOffset expires)
    {
        Response.Cookies.Append(SessionCookie, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !HttpContext.RequestServices
                .GetRequiredService<IWebHostEnvironment>().IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Expires = expires,
            IsEssential = true,
            Path = "/"
        });
    }
}
