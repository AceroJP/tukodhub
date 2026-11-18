using System.Net.Http.Json;
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
public sealed class PlatformController(
    AppDbContext dbContext,
    IConfiguration configuration,
    IHttpClientFactory httpClientFactory,
    IWebHostEnvironment environment,
    IServiceScopeFactory scopeFactory) : ControllerBase
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

    // ── Landing Page Builder Endpoints (Draft, Publish, Versioning & Media) ─────

    [HttpGet("landing-page")]
    [HttpGet("landing-page/draft")]
    [ProducesResponseType(typeof(PlatformSettingResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PlatformSettingResponse>> GetLandingPageDraft(CancellationToken cancellationToken)
    {
        // 1. Try to load active draft
        var draft = await dbContext.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "landing_page_draft", cancellationToken);
        if (draft is not null && !string.IsNullOrWhiteSpace(draft.ValueJson))
        {
            return Ok(new PlatformSettingResponse(draft.Key, draft.ValueJson, draft.UpdatedAt));
        }

        // 2. Fall back to current published version
        var published = await dbContext.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "landing_page_published", cancellationToken);
        if (published is not null && !string.IsNullOrWhiteSpace(published.ValueJson))
        {
            return Ok(new PlatformSettingResponse(published.Key, published.ValueJson, published.UpdatedAt));
        }

        // 3. Fall back to legacy config
        var legacy = await dbContext.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "landing_page_config", cancellationToken);
        if (legacy is not null && !string.IsNullOrWhiteSpace(legacy.ValueJson))
        {
            return Ok(new PlatformSettingResponse(legacy.Key, legacy.ValueJson, legacy.UpdatedAt));
        }

        return Ok(new PlatformSettingResponse("landing_page_draft", null, null));
    }

    [HttpPut("landing-page")]
    [HttpPut("landing-page/draft")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> SaveLandingPageDraft(
        [FromBody] SaveLandingPageConfigRequest request,
        CancellationToken cancellationToken)
    {
        var draft = await dbContext.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "landing_page_draft", cancellationToken);
        if (draft is null)
        {
            draft = new PlatformSetting
            {
                Key = "landing_page_draft",
                ValueJson = request.ConfigJson,
                UpdatedAt = DateTimeOffset.UtcNow,
                UpdatedBy = User.FindFirst("email")?.Value ?? "owner"
            };
            dbContext.PlatformSettings.Add(draft);
        }
        else
        {
            draft.ValueJson = request.ConfigJson;
            draft.UpdatedAt = DateTimeOffset.UtcNow;
            draft.UpdatedBy = User.FindFirst("email")?.Value ?? "owner";
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("landing-page/publish")]
    [ProducesResponseType(typeof(PublishLandingPageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<PublishLandingPageResponse>> PublishLandingPage(
        [FromBody] PublishLandingPageRequest request,
        CancellationToken cancellationToken)
    {
        var adminEmail = User.FindFirst("email")?.Value ?? "owner";

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // Calculate next sequential version number
            var latestVersion = await dbContext.PlatformLandingVersions
                .MaxAsync(v => (int?)v.VersionNumber, cancellationToken) ?? 0;
            var nextVersion = latestVersion + 1;

            // 1. Immutable version snapshot
            var versionRecord = new PlatformLandingVersion
            {
                VersionNumber = nextVersion,
                PublishedBy = adminEmail,
                ChangeSummary = string.IsNullOrWhiteSpace(request.ChangeSummary) ? "Published live website release" : request.ChangeSummary.Trim(),
                PayloadJson = request.DocumentJson,
                RevalidationStatus = "Pending",
                CreatedAt = DateTimeOffset.UtcNow
            };
            dbContext.PlatformLandingVersions.Add(versionRecord);

            // 2. Active published setting in platform_settings
            var setting = await dbContext.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "landing_page_published", cancellationToken);
            if (setting is null)
            {
                setting = new PlatformSetting
                {
                    Key = "landing_page_published",
                    ValueJson = request.DocumentJson,
                    UpdatedAt = DateTimeOffset.UtcNow,
                    UpdatedBy = adminEmail
                };
                dbContext.PlatformSettings.Add(setting);
            }
            else
            {
                setting.ValueJson = request.DocumentJson;
                setting.UpdatedAt = DateTimeOffset.UtcNow;
                setting.UpdatedBy = adminEmail;
            }

            // 3. Keep legacy key in sync for backward compatibility
            var legacy = await dbContext.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "landing_page_config", cancellationToken);
            if (legacy is null)
            {
                legacy = new PlatformSetting
                {
                    Key = "landing_page_config",
                    ValueJson = request.DocumentJson,
                    UpdatedAt = DateTimeOffset.UtcNow,
                    UpdatedBy = adminEmail
                };
                dbContext.PlatformSettings.Add(legacy);
            }
            else
            {
                legacy.ValueJson = request.DocumentJson;
                legacy.UpdatedAt = DateTimeOffset.UtcNow;
                legacy.UpdatedBy = adminEmail;
            }

            // 4. Audit Log
            dbContext.PlatformAuditLogs.Add(new PlatformAuditLog
            {
                ActorType = "PlatformAdmin",
                ActorId = User.FindFirst("sub")?.Value ?? "owner",
                ActorEmail = adminEmail,
                Action = "landing_page.published",
                EntityName = "PlatformLandingVersion",
                EntityId = nextVersion.ToString(),
                Details = $"Published Version #{nextVersion}: {versionRecord.ChangeSummary}",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = Request.Headers.UserAgent.ToString()
            });

            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            // Trigger asynchronous Vercel / Next.js cache revalidation with retries
            _ = Task.Run(async () =>
            {
                await TriggerCacheRevalidationAsync(nextVersion, versionRecord.Id);
            });

            return Ok(new PublishLandingPageResponse(nextVersion, versionRecord.CreatedAt, versionRecord.RevalidationStatus));
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("version_number") == true || ex.Message.Contains("idx_platform_landing_versions_version"))
        {
            await transaction.RollbackAsync(cancellationToken);
            return Conflict(new ProblemDetails
            {
                Title = "Concurrent publish conflict",
                Detail = "Another administrator published a version simultaneously. Please reload your draft to ensure you are editing the latest version.",
                Status = StatusCodes.Status409Conflict
            });
        }
    }

    [HttpGet("landing-page/versions")]
    [ProducesResponseType(typeof(List<PlatformLandingVersionSummary>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PlatformLandingVersionSummary>>> GetLandingPageVersions(CancellationToken cancellationToken)
    {
        var versions = await dbContext.PlatformLandingVersions
            .OrderByDescending(v => v.VersionNumber)
            .Take(30)
            .Select(v => new PlatformLandingVersionSummary(
                v.Id,
                v.VersionNumber,
                v.PublishedBy,
                v.ChangeSummary,
                v.RevalidationStatus,
                v.CreatedAt))
            .ToListAsync(cancellationToken);

        return Ok(versions);
    }

    [HttpPost("landing-page/versions/{versionNumber:int}/restore")]
    [ProducesResponseType(typeof(PublishLandingPageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PublishLandingPageResponse>> RestoreLandingPageVersion(
        int versionNumber,
        CancellationToken cancellationToken)
    {
        var targetSnapshot = await dbContext.PlatformLandingVersions
            .FirstOrDefaultAsync(v => v.VersionNumber == versionNumber, cancellationToken);

        if (targetSnapshot is null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Version snapshot not found",
                Detail = $"Version #{versionNumber} does not exist in history.",
                Status = StatusCodes.Status404NotFound
            });
        }

        // Delegate to atomic publish to create a clean new forward version
        return await PublishLandingPage(
            new PublishLandingPageRequest(targetSnapshot.PayloadJson, $"Restored from historical Version #{versionNumber}"),
            cancellationToken);
    }

    [HttpGet("landing-page/public")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PlatformSettingResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PlatformSettingResponse>> GetPublicLandingPageConfig(CancellationToken cancellationToken)
    {
        // 1. Prioritize active published version
        var setting = await dbContext.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "landing_page_published", cancellationToken);
        if (setting is not null && !string.IsNullOrWhiteSpace(setting.ValueJson))
        {
            return Ok(new PlatformSettingResponse(setting.Key, setting.ValueJson, setting.UpdatedAt));
        }

        // 2. Fall back to legacy config
        var legacy = await dbContext.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "landing_page_config", cancellationToken);
        if (legacy is not null && !string.IsNullOrWhiteSpace(legacy.ValueJson))
        {
            return Ok(new PlatformSettingResponse(legacy.Key, legacy.ValueJson, legacy.UpdatedAt));
        }

        return Ok(new PlatformSettingResponse("landing_page_published", null, null));
    }

    [HttpPost("media/upload")]
    [ProducesResponseType(typeof(MediaUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(15 * 1024 * 1024)] // 15MB max
    public async Task<ActionResult<MediaUploadResponse>> UploadMedia(
        IFormFile? file,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new ProblemDetails { Title = "Invalid upload", Detail = "No file was provided.", Status = StatusCodes.Status400BadRequest });
        }

        if (file.Length > 15 * 1024 * 1024)
        {
            return BadRequest(new ProblemDetails { Title = "File too large", Detail = "File exceeds the 15 MB limit.", Status = StatusCodes.Status400BadRequest });
        }

        // Binary signature & security validation
        if (!ValidateImageSignature(file, out var detectedMime, out var validationError))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Security verification failed",
                Detail = validationError ?? "File rejected by media security validation.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var webRoot = environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadDir = Path.Combine(webRoot, "media", "landing");
        Directory.CreateDirectory(uploadDir);

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = detectedMime switch
            {
                "image/png" => ".png",
                "image/jpeg" => ".jpg",
                "image/webp" => ".webp",
                "image/svg+xml" => ".svg",
                _ => ".bin"
            };
        }

        var uniqueFileName = $"{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}_{Guid.NewGuid():N}{extension}";
        var destinationPath = Path.Combine(uploadDir, uniqueFileName);

        await using (var fileStream = new FileStream(destinationPath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await file.CopyToAsync(fileStream, cancellationToken);
        }

        var assetId = Guid.NewGuid();
        var publicUrl = $"/media/landing/{uniqueFileName}";

        return Ok(new MediaUploadResponse(assetId, publicUrl, file.FileName, file.Length));
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

    private async Task TriggerCacheRevalidationAsync(int versionNumber, Guid versionId)
    {
        var frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:3000";
        var secret = configuration["InternalRevalidationSecret"] ?? "tukodhub-internal-secret-2026";
        var targetUri = $"{frontendUrl.TrimEnd('/')}/api/revalidate-landing";

        var client = httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(5);

        for (var attempt = 1; attempt <= 3; attempt++)
        {
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, targetUri);
                request.Headers.Add("x-revalidate-secret", secret);
                request.Content = JsonContent.Create(new { version = versionNumber });

                var response = await client.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    using var scope = scopeFactory.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var v = await db.PlatformLandingVersions.FindAsync(versionId);
                    if (v is not null)
                    {
                        v.RevalidationStatus = "Success";
                        v.RevalidatedAt = DateTimeOffset.UtcNow;
                        v.RevalidationAttempts = attempt;
                        await db.SaveChangesAsync();
                    }
                    return;
                }
            }
            catch
            {
                if (attempt < 3)
                {
                    await Task.Delay(attempt * 250);
                }
            }
        }

        // If all 3 attempts failed, record status
        try
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var v = await db.PlatformLandingVersions.FindAsync(versionId);
            if (v is not null)
            {
                v.RevalidationStatus = "Failed";
                v.RevalidationAttempts = 3;
                await db.SaveChangesAsync();
            }
        }
        catch
        {
            // Background logging fallback
        }
    }

    private static bool ValidateImageSignature(IFormFile file, out string detectedMime, out string? errorMessage)
    {
        errorMessage = null;
        detectedMime = string.Empty;

        using var stream = file.OpenReadStream();
        var header = new byte[16];
        var bytesRead = stream.Read(header, 0, header.Length);
        if (bytesRead < 4)
        {
            errorMessage = "File is empty or truncated.";
            return false;
        }

        // PNG: 89 50 4E 47
        if (header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47)
        {
            detectedMime = "image/png";
            return true;
        }

        // JPEG: FF D8 FF
        if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
        {
            detectedMime = "image/jpeg";
            return true;
        }

        // WebP: RIFF ... WEBP (52 49 46 46 .... 57 45 42 50)
        if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 &&
            bytesRead >= 12 && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50)
        {
            detectedMime = "image/webp";
            return true;
        }

        // SVG: XML format check & strict XSS sanitization
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension == ".svg")
        {
            stream.Position = 0;
            using var reader = new StreamReader(stream);
            var content = reader.ReadToEnd();

            var lower = content.ToLowerInvariant();
            if (lower.Contains("<script") ||
                lower.Contains("javascript:") ||
                lower.Contains("<foreignobject") ||
                lower.Contains("onload=") ||
                lower.Contains("onerror=") ||
                lower.Contains("onclick="))
            {
                errorMessage = "Malicious or insecure executable content detected in SVG file.";
                return false;
            }

            if (!lower.Contains("<svg"))
            {
                errorMessage = "File does not contain valid SVG markup.";
                return false;
            }

            detectedMime = "image/svg+xml";
            return true;
        }

        errorMessage = "Unsupported file format. Only PNG, JPEG, WebP, and sanitized SVG are permitted.";
        return false;
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

public sealed record PublishLandingPageRequest(string DocumentJson, string? ChangeSummary);

public sealed record PublishLandingPageResponse(
    int VersionNumber,
    DateTimeOffset PublishedAt,
    string RevalidationStatus);

public sealed record PlatformLandingVersionSummary(
    Guid Id,
    int VersionNumber,
    string PublishedBy,
    string? ChangeSummary,
    string RevalidationStatus,
    DateTimeOffset CreatedAt);

public sealed record MediaUploadResponse(
    Guid AssetId,
    string Url,
    string FileName,
    long Size);
