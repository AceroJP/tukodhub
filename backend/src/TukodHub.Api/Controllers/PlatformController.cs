using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TukodHub.Api.Controllers;

[ApiController]
[Route("api/v1/platform")]
[Authorize(Policy = "PlatformOwner")]
public sealed class PlatformController : ControllerBase
{
    [HttpGet("me")]
    [ProducesResponseType(typeof(PlatformOwnerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public ActionResult<PlatformOwnerResponse> Me()
    {
        return Ok(new PlatformOwnerResponse(
            User.FindFirst("sub")?.Value ?? string.Empty,
            User.FindFirst("email")?.Value));
    }
}

public sealed record PlatformOwnerResponse(string UserId, string? Email);
