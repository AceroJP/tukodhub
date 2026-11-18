namespace TukodHub.Api.Data;

public sealed class PlatformSetting
{
    public required string Key { get; set; }
    public required string ValueJson { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string? UpdatedBy { get; set; }
}

public sealed class PlatformAuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
    public required string ActorType { get; set; } // "PlatformAdmin", "TenantOwner", "System"
    public required string ActorId { get; set; }
    public string? ActorEmail { get; set; }
    public Guid? TenantId { get; set; }
    public required string Action { get; set; }
    public string? EntityName { get; set; }
    public string? EntityId { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Details { get; set; }
}

public sealed class SupportTicket
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string TicketNumber { get; set; } // e.g. "TK-108"
    public Guid TenantId { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public required string Subject { get; set; }
    public required string Category { get; set; } // "Billing", "TechnicalBug", "SupportAccess", "Configuration"
    public string Priority { get; set; } = "Medium"; // "Low", "Medium", "High", "Urgent"
    public string Status { get; set; } = "Open"; // "Open", "InProgress", "WaitingOnTenant", "Resolved"
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ResolvedAt { get; set; }

    public Tenant? Tenant { get; set; }
    public ICollection<SupportTicketMessage> Messages { get; set; } = [];
}

public sealed class SupportTicketMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TicketId { get; set; }
    public required string SenderType { get; set; } // "PlatformAdmin", "TenantOwner"
    public required string SenderId { get; set; }
    public required string SenderName { get; set; }
    public required string Message { get; set; }
    public string? AttachmentsJson { get; set; } // JSON array of Attachment items
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public SupportTicket? Ticket { get; set; }
}

public sealed class SupportAccessGrant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public required string RequestedByAdminId { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    public required string Reason { get; set; }
    public string Status { get; set; } = "Requested"; // "Requested", "Approved", "Rejected", "Expired", "Revoked"
    public int DurationMinutes { get; set; } = 60;
    public DateTimeOffset? ExpiresAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Tenant? Tenant { get; set; }
}

public sealed class PlatformLandingVersion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int VersionNumber { get; set; }
    public required string PublishedBy { get; set; }
    public string? ChangeSummary { get; set; }
    public required string PayloadJson { get; set; }
    public string RevalidationStatus { get; set; } = "Pending"; // "Success", "Pending", "Failed"
    public DateTimeOffset? RevalidatedAt { get; set; }
    public int RevalidationAttempts { get; set; } = 0;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
