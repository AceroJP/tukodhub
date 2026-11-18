using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TukodHub.Api.Data;
using TukodHub.Api.Infrastructure;

namespace TukodHub.Api.Controllers;

[ApiController]
[Route("api/v1/platform")]
[Authorize(AuthenticationSchemes = AuthSchemes.PlatformOwnerJwt, Policy = "PlatformOwner")]
public sealed class PlatformController(AppDbContext dbContext) : ControllerBase
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

    [HttpGet("overview")]
    [ProducesResponseType(typeof(PlatformOverviewResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PlatformOverviewResponse>> GetOverview(CancellationToken cancellationToken)
    {
        var totalTenants = await dbContext.Tenants.IgnoreQueryFilters().CountAsync(cancellationToken);
        var activeTenants = await dbContext.Tenants.IgnoreQueryFilters().CountAsync(t => t.Status == TenantStatus.Active, cancellationToken);
        var suspendedTenants = await dbContext.Tenants.IgnoreQueryFilters().CountAsync(t => t.Status == TenantStatus.Suspended, cancellationToken);
        var trialTenants = await dbContext.Tenants.IgnoreQueryFilters().CountAsync(t => t.Status == TenantStatus.Active && t.CreatedAt >= DateTimeOffset.UtcNow.AddDays(-14), cancellationToken);

        var openTickets = 0;
        var activeSupportSessions = 0;

        try
        {
            openTickets = await dbContext.SupportTickets.CountAsync(t => t.Status == "Open" || t.Status == "InProgress", cancellationToken);
            activeSupportSessions = await dbContext.SupportAccessGrants.CountAsync(g => g.Status == "Approved" && g.ExpiresAt > DateTimeOffset.UtcNow, cancellationToken);
        }
        catch
        {
            // In case support tables have not yet been migrated to database
        }

        return Ok(new PlatformOverviewResponse(
            TotalTenants: totalTenants,
            ActiveTenants: activeTenants,
            TrialTenants: trialTenants,
            SuspendedTenants: suspendedTenants,
            OpenSupportTickets: openTickets,
            ActiveSupportSessions: activeSupportSessions,
            SystemStatus: "Operational"));
    }

    [HttpGet("tenants")]
    [ProducesResponseType(typeof(List<PlatformTenantItem>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PlatformTenantItem>>> GetTenants(CancellationToken cancellationToken)
    {
        var tenants = await dbContext.Tenants
            .IgnoreQueryFilters()
            .Include(t => t.BusinessProfile)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new PlatformTenantItem(
                t.Id,
                t.Name,
                t.Slug,
                t.Status.ToString(),
                t.CreatedAt,
                dbContext.Memberships.IgnoreQueryFilters()
                    .Where(m => m.TenantId == t.Id)
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => m.User.Email)
                    .FirstOrDefault(),
                t.BusinessProfile != null ? t.BusinessProfile.Phone : null,
                dbContext.Memberships.IgnoreQueryFilters().Count(m => m.TenantId == t.Id)))
            .ToListAsync(cancellationToken);

        return Ok(tenants);
    }

    [HttpPatch("tenants/{id:guid}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTenantStatus(
        Guid id,
        [FromBody] UpdateTenantStatusRequest request,
        CancellationToken cancellationToken)
    {
        var tenant = await dbContext.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (tenant is null)
        {
            return NotFound();
        }

        if (!Enum.TryParse<TenantStatus>(request.Status, true, out var nextStatus))
        {
            return BadRequest(new ProblemDetails { Title = "Invalid tenant status specified." });
        }

        var oldStatus = tenant.Status.ToString();
        tenant.Status = nextStatus;

        try
        {
            dbContext.PlatformAuditLogs.Add(new PlatformAuditLog
            {
                ActorType = "PlatformAdmin",
                ActorId = User.FindFirst("sub")?.Value ?? "owner",
                ActorEmail = User.FindFirst("email")?.Value,
                TenantId = tenant.Id,
                Action = "tenant.status_changed",
                EntityName = "Tenant",
                EntityId = tenant.Id.ToString(),
                Details = $"Tenant {tenant.Slug} status changed from {oldStatus} to {nextStatus}. Reason: {request.Reason ?? "Administrative action"}",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = Request.Headers.UserAgent.ToString()
            });
        }
        catch
        {
            // Non-blocking if table is being created
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("landing-page")]
    [ProducesResponseType(typeof(PlatformSettingResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PlatformSettingResponse>> GetLandingPageConfig(CancellationToken cancellationToken)
    {
        var setting = await dbContext.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "landing_page_config", cancellationToken);
        if (setting is null)
        {
            return Ok(new PlatformSettingResponse("landing_page_config", null, null));
        }

        return Ok(new PlatformSettingResponse(setting.Key, setting.ValueJson, setting.UpdatedAt));
    }

    [HttpPut("landing-page")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> SaveLandingPageConfig(
        [FromBody] SaveLandingPageConfigRequest request,
        CancellationToken cancellationToken)
    {
        var setting = await dbContext.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "landing_page_config", cancellationToken);
        if (setting is null)
        {
            setting = new PlatformSetting
            {
                Key = "landing_page_config",
                ValueJson = request.ConfigJson,
                UpdatedAt = DateTimeOffset.UtcNow,
                UpdatedBy = User.FindFirst("email")?.Value ?? "owner"
            };
            dbContext.PlatformSettings.Add(setting);
        }
        else
        {
            setting.ValueJson = request.ConfigJson;
            setting.UpdatedAt = DateTimeOffset.UtcNow;
            setting.UpdatedBy = User.FindFirst("email")?.Value ?? "owner";
        }

        dbContext.PlatformAuditLogs.Add(new PlatformAuditLog
        {
            ActorType = "PlatformAdmin",
            ActorId = User.FindFirst("sub")?.Value ?? "owner",
            ActorEmail = User.FindFirst("email")?.Value,
            Action = "landing_page.published",
            EntityName = "PlatformSetting",
            EntityId = "landing_page_config",
            Details = "Main public marketing landing page configuration published.",
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString()
        });

        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("landing-page/public")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PlatformSettingResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PlatformSettingResponse>> GetPublicLandingPageConfig(CancellationToken cancellationToken)
    {
        var setting = await dbContext.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "landing_page_config", cancellationToken);
        if (setting is null)
        {
            return Ok(new PlatformSettingResponse("landing_page_config", null, null));
        }

        return Ok(new PlatformSettingResponse(setting.Key, setting.ValueJson, setting.UpdatedAt));
    }

    [HttpGet("audit-logs")]
    [ProducesResponseType(typeof(List<PlatformAuditLogResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PlatformAuditLogResponse>>> GetAuditLogs(
        [FromQuery] int limit = 50,
        CancellationToken cancellationToken = default)
    {
        var logs = await dbContext.PlatformAuditLogs
            .OrderByDescending(l => l.Timestamp)
            .Take(Math.Min(limit, 200))
            .Select(l => new PlatformAuditLogResponse(
                l.Id,
                l.Timestamp,
                l.ActorType,
                l.ActorId,
                l.ActorEmail,
                l.TenantId,
                l.Action,
                l.EntityName,
                l.EntityId,
                l.Details,
                l.IpAddress))
            .ToListAsync(cancellationToken);

        return Ok(logs);
    }

    [HttpGet("support/tickets")]
    [ProducesResponseType(typeof(List<SupportTicketSummaryResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SupportTicketSummaryResponse>>> GetSupportTickets(CancellationToken cancellationToken)
    {
        var tickets = await dbContext.SupportTickets
            .Include(t => t.Tenant)
            .Include(t => t.Messages)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new SupportTicketSummaryResponse(
                t.Id,
                t.TicketNumber,
                t.Tenant != null ? t.Tenant.Name : "Unknown Tenant",
                t.Tenant != null ? t.Tenant.Slug : string.Empty,
                t.Subject,
                t.Category,
                t.Priority,
                t.Status,
                t.CreatedAt,
                t.Messages.Count))
            .ToListAsync(cancellationToken);

        return Ok(tickets);
    }
}

public sealed record PlatformOwnerResponse(string UserId, string? Email);

public sealed record PlatformOverviewResponse(
    int TotalTenants,
    int ActiveTenants,
    int TrialTenants,
    int SuspendedTenants,
    int OpenSupportTickets,
    int ActiveSupportSessions,
    string SystemStatus);

public sealed record PlatformTenantItem(
    Guid Id,
    string Name,
    string Slug,
    string Status,
    DateTimeOffset CreatedAt,
    string? OwnerEmail,
    string? Phone,
    int MemberCount);

public sealed record UpdateTenantStatusRequest(string Status, string? Reason);

public sealed record PlatformSettingResponse(string Key, string? ValueJson, DateTimeOffset? UpdatedAt);

public sealed record SaveLandingPageConfigRequest(string ConfigJson);

public sealed record PlatformAuditLogResponse(
    Guid Id,
    DateTimeOffset Timestamp,
    string ActorType,
    string ActorId,
    string? ActorEmail,
    Guid? TenantId,
    string Action,
    string? EntityName,
    string? EntityId,
    string? Details,
    string? IpAddress);

public sealed record SupportTicketSummaryResponse(
    Guid Id,
    string TicketNumber,
    string TenantName,
    string TenantSlug,
    string Subject,
    string Category,
    string Priority,
    string Status,
    DateTimeOffset CreatedAt,
    int MessageCount);
