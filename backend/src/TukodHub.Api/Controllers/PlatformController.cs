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
        // If table is empty, seed demo tickets linked to an existing tenant
        if (!await dbContext.SupportTickets.AnyAsync(cancellationToken))
        {
            var tenant = await dbContext.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(cancellationToken);
            if (tenant is not null)
            {
                var seedTicket1 = new SupportTicket
                {
                    TicketNumber = "TK-108",
                    TenantId = tenant.Id,
                    Subject = "Technician mobile app GPS proof not saving on branch 2",
                    Category = "Technical Bug",
                    Priority = "High",
                    Status = "Open",
                    CreatedAt = DateTimeOffset.UtcNow.AddHours(-3),
                    Messages = new List<SupportTicketMessage>
                    {
                        new()
                        {
                            SenderType = "TenantOwner",
                            SenderId = "tenant-owner",
                            SenderName = "Tenant Owner",
                            Message = "Hi Super Admin, our field technicians report that when they complete a job and upload proof photos, the GPS location tag errors out with code #503. I've attached a screenshot and a short video clip showing the error.",
                            AttachmentsJson = "[{\"name\":\"gps_error_screenshot.png\",\"type\":\"image\",\"size\":\"1.2 MB\"},{\"name\":\"technician_screen_recording.mp4\",\"type\":\"video\",\"size\":\"14.8 MB\"}]",
                            CreatedAt = DateTimeOffset.UtcNow.AddHours(-3)
                        },
                        new()
                        {
                            SenderType = "PlatformAdmin",
                            SenderId = "owner",
                            SenderName = "Platform Super Admin",
                            Message = "Thanks for reporting this. We see the device location permissions were revoked on Android 14. I am sending an in-app request for temporary support access to review the branch audit logs.",
                            CreatedAt = DateTimeOffset.UtcNow.AddHours(-2)
                        }
                    }
                };

                var seedTicket2 = new SupportTicket
                {
                    TicketNumber = "TK-107",
                    TenantId = tenant.Id,
                    Subject = "Official BIR 2307 receipt request for annual Pro upgrade",
                    Category = "Billing",
                    Priority = "Low",
                    Status = "Resolved",
                    CreatedAt = DateTimeOffset.UtcNow.AddDays(-1),
                    ResolvedAt = DateTimeOffset.UtcNow.AddHours(-4),
                    Messages = new List<SupportTicketMessage>
                    {
                        new()
                        {
                            SenderType = "TenantOwner",
                            SenderId = "tenant-owner",
                            SenderName = "Tenant Owner",
                            Message = "Please send the official BIR tax receipt for our Pro subscription renewal.",
                            CreatedAt = DateTimeOffset.UtcNow.AddDays(-1)
                        },
                        new()
                        {
                            SenderType = "PlatformAdmin",
                            SenderId = "owner",
                            SenderName = "Platform Super Admin",
                            Message = "Official receipt #PM-INV-202611-094 has been attached to your portal invoice section.",
                            AttachmentsJson = "[{\"name\":\"BIR_Receipt_PM_INV.pdf\",\"type\":\"file\",\"size\":\"320 KB\"}]",
                            CreatedAt = DateTimeOffset.UtcNow.AddHours(-4)
                        }
                    }
                };

                dbContext.SupportTickets.AddRange(seedTicket1, seedTicket2);
                dbContext.PlatformAuditLogs.Add(new PlatformAuditLog
                {
                    ActorType = "System",
                    ActorId = "system",
                    Action = "support_tickets.initialized",
                    EntityName = "SupportTicket",
                    Details = "Demo support tickets seeded with real messages and attachments.",
                    IpAddress = "127.0.0.1"
                });

                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        var tickets = await dbContext.SupportTickets
            .Include(t => t.Tenant)
            .Include(t => t.Messages)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new SupportTicketSummaryResponse(
                t.Id,
                t.TicketNumber,
                t.TenantId,
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

    [HttpGet("support/tickets/{id:guid}")]
    [ProducesResponseType(typeof(SupportTicketDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupportTicketDetailResponse>> GetTicketDetail(
        Guid id,
        CancellationToken cancellationToken)
    {
        var ticket = await dbContext.SupportTickets
            .Include(t => t.Tenant)
            .Include(t => t.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (ticket is null)
        {
            return NotFound();
        }

        return Ok(new SupportTicketDetailResponse(
            ticket.Id,
            ticket.TicketNumber,
            ticket.TenantId,
            ticket.Tenant != null ? ticket.Tenant.Name : "Unknown Tenant",
            ticket.Tenant != null ? ticket.Tenant.Slug : string.Empty,
            ticket.Subject,
            ticket.Category,
            ticket.Priority,
            ticket.Status,
            ticket.CreatedAt,
            ticket.Messages.Select(m => new SupportMessageResponse(
                m.Id,
                m.SenderType,
                m.SenderName,
                m.Message,
                m.AttachmentsJson,
                m.CreatedAt)).ToList()));
    }

    [HttpPost("support/tickets/{id:guid}/messages")]
    [ProducesResponseType(typeof(SupportMessageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupportMessageResponse>> AddTicketMessage(
        Guid id,
        [FromBody] AddSupportMessageRequest request,
        CancellationToken cancellationToken)
    {
        var ticket = await dbContext.SupportTickets.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (ticket is null)
        {
            return NotFound();
        }

        var message = new SupportTicketMessage
        {
            TicketId = ticket.Id,
            SenderType = "PlatformAdmin",
            SenderId = User.FindFirst("sub")?.Value ?? "owner",
            SenderName = User.FindFirst("email")?.Value ?? "Platform Super Admin",
            Message = request.Message,
            AttachmentsJson = request.AttachmentsJson,
            CreatedAt = DateTimeOffset.UtcNow
        };

        dbContext.SupportTicketMessages.Add(message);
        ticket.Status = "Waiting on Tenant";

        dbContext.PlatformAuditLogs.Add(new PlatformAuditLog
        {
            ActorType = "PlatformAdmin",
            ActorId = User.FindFirst("sub")?.Value ?? "owner",
            ActorEmail = User.FindFirst("email")?.Value,
            TenantId = ticket.TenantId,
            Action = "support_ticket.replied",
            EntityName = "SupportTicket",
            EntityId = ticket.Id.ToString(),
            Details = $"Replied to ticket #{ticket.TicketNumber}: {(request.Message.Length > 80 ? request.Message[..80] + "..." : request.Message)}",
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString()
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new SupportMessageResponse(
            message.Id,
            message.SenderType,
            message.SenderName,
            message.Message,
            message.AttachmentsJson,
            message.CreatedAt));
    }

    [HttpPatch("support/tickets/{id:guid}/resolve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResolveTicket(Guid id, CancellationToken cancellationToken)
    {
        var ticket = await dbContext.SupportTickets.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (ticket is null)
        {
            return NotFound();
        }

        ticket.Status = "Resolved";
        ticket.ResolvedAt = DateTimeOffset.UtcNow;

        dbContext.PlatformAuditLogs.Add(new PlatformAuditLog
        {
            ActorType = "PlatformAdmin",
            ActorId = User.FindFirst("sub")?.Value ?? "owner",
            ActorEmail = User.FindFirst("email")?.Value,
            TenantId = ticket.TenantId,
            Action = "support_ticket.resolved",
            EntityName = "SupportTicket",
            EntityId = ticket.Id.ToString(),
            Details = $"Ticket #{ticket.TicketNumber} marked as Resolved",
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString()
        });

        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    [HttpPost("support/handshake")]
    [HttpPost("handshake")]
    [ProducesResponseType(typeof(SupportAccessGrantResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<SupportAccessGrantResponse>> RequestSupportHandshake(
        [FromBody] RequestSupportHandshakeRequest request,
        CancellationToken cancellationToken)
    {
        var grant = new SupportAccessGrant
        {
            TenantId = request.TenantId,
            RequestedByAdminId = User.FindFirst("sub")?.Value ?? "owner",
            Reason = request.Reason,
            DurationMinutes = request.DurationMinutes > 0 ? request.DurationMinutes : 60,
            Status = "Requested",
            CreatedAt = DateTimeOffset.UtcNow
        };

        dbContext.SupportAccessGrants.Add(grant);

        dbContext.PlatformAuditLogs.Add(new PlatformAuditLog
        {
            ActorType = "PlatformAdmin",
            ActorId = User.FindFirst("sub")?.Value ?? "owner",
            ActorEmail = User.FindFirst("email")?.Value,
            TenantId = request.TenantId,
            Action = "support_handshake.requested",
            EntityName = "SupportAccessGrant",
            EntityId = grant.Id.ToString(),
            Details = $"Requested support session ({grant.DurationMinutes}m) for reason: {request.Reason}",
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString()
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new SupportAccessGrantResponse(
            grant.Id,
            grant.TenantId,
            grant.Status,
            grant.Reason,
            grant.DurationMinutes,
            grant.CreatedAt));
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
    Guid TenantId,
    string TenantName,
    string TenantSlug,
    string Subject,
    string Category,
    string Priority,
    string Status,
    DateTimeOffset CreatedAt,
    int MessageCount);

public sealed record SupportMessageResponse(
    Guid Id,
    string SenderType,
    string SenderName,
    string Message,
    string? AttachmentsJson,
    DateTimeOffset CreatedAt);

public sealed record SupportTicketDetailResponse(
    Guid Id,
    string TicketNumber,
    Guid TenantId,
    string TenantName,
    string TenantSlug,
    string Subject,
    string Category,
    string Priority,
    string Status,
    DateTimeOffset CreatedAt,
    List<SupportMessageResponse> Messages);

public sealed record AddSupportMessageRequest(string Message, string? AttachmentsJson);

public sealed record RequestSupportHandshakeRequest(
    Guid TenantId,
    string Reason,
    int DurationMinutes);

public sealed record SupportAccessGrantResponse(
    Guid Id,
    Guid TenantId,
    string Status,
    string Reason,
    int DurationMinutes,
    DateTimeOffset CreatedAt);
