using Microsoft.EntityFrameworkCore;
using TukodHub.Api.Infrastructure;

namespace TukodHub.Api.Data;

public interface ITenantOwnedEntity
{
    Guid TenantId { get; }
}

public sealed class AppDbContext(
    DbContextOptions<AppDbContext> options,
    ITenantContextAccessor? tenantContextAccessor = null) : DbContext(options)
{
    private readonly ITenantContextAccessor tenantContextAccessor = tenantContextAccessor ?? new TenantContextAccessor();

    private Guid? CurrentTenantId =>
        this.tenantContextAccessor.Current.Scope == HostScope.Tenant
            ? this.tenantContextAccessor.Current.TenantId
            : null;

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<BusinessProfile> BusinessProfiles => Set<BusinessProfile>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Membership> Memberships => Set<Membership>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<PlatformSetting> PlatformSettings => Set<PlatformSetting>();
    public DbSet<PlatformAuditLog> PlatformAuditLogs => Set<PlatformAuditLog>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
    public DbSet<SupportTicketMessage> SupportTicketMessages => Set<SupportTicketMessage>();
    public DbSet<SupportAccessGrant> SupportAccessGrants => Set<SupportAccessGrant>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("public");
        modelBuilder.UseIdentityColumns();

        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.ToTable("tenants");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(item => item.Name).HasMaxLength(200).IsRequired();
            entity.Property(item => item.Slug).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(item => item.CreatedAt).HasDefaultValueSql("now()");
            entity.HasIndex(item => item.Slug).IsUnique();
            entity.HasQueryFilter(item => CurrentTenantId == null || item.Id == CurrentTenantId);
            entity.HasOne(item => item.BusinessProfile)
                .WithOne(item => item.Tenant)
                .HasForeignKey<BusinessProfile>(item => item.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BusinessProfile>(entity =>
        {
            entity.ToTable("business_profiles");
            entity.HasKey(item => item.TenantId);
            entity.Property(item => item.LegalName).HasMaxLength(200).IsRequired();
            entity.Property(item => item.DisplayName).HasMaxLength(200).IsRequired();
            entity.Property(item => item.Phone).HasMaxLength(40);
            entity.Property(item => item.Address).HasMaxLength(500);
            entity.Property(item => item.Timezone).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Currency).HasMaxLength(3).IsRequired();
            entity.Property(item => item.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(item => item.UpdatedAt).HasDefaultValueSql("now()");
            entity.HasQueryFilter(item => CurrentTenantId == null || item.TenantId == CurrentTenantId);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(item => item.Email).HasMaxLength(320).IsRequired();
            entity.Property(item => item.NormalizedEmail).HasMaxLength(320).IsRequired();
            entity.Property(item => item.PasswordHash).HasMaxLength(256).IsRequired();
            entity.Property(item => item.DisplayName).HasMaxLength(200).IsRequired();
            entity.Property(item => item.Phone).HasMaxLength(40);
            entity.Property(item => item.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(item => item.CreatedAt).HasDefaultValueSql("now()");
            entity.HasIndex(item => item.NormalizedEmail).IsUnique();
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(item => item.Name).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Scope).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(item => new { item.Scope, item.Name }).IsUnique();
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("permissions");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(item => item.Code).HasMaxLength(150).IsRequired();
            entity.Property(item => item.Description).HasMaxLength(500).IsRequired();
            entity.HasIndex(item => item.Code).IsUnique();
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.ToTable("role_permissions");
            entity.HasKey(item => new { item.RoleId, item.PermissionId });
            entity.HasOne(item => item.Role).WithMany(item => item.RolePermissions)
                .HasForeignKey(item => item.RoleId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(item => item.Permission).WithMany(item => item.RolePermissions)
                .HasForeignKey(item => item.PermissionId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Membership>(entity =>
        {
            entity.ToTable("memberships");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(item => item.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(item => item.CreatedAt).HasDefaultValueSql("now()");
            entity.HasIndex(item => new { item.TenantId, item.UserId }).IsUnique();
            entity.HasQueryFilter(item => CurrentTenantId == null || item.TenantId == CurrentTenantId);
            entity.HasOne(item => item.Tenant).WithMany(item => item.Memberships)
                .HasForeignKey(item => item.TenantId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(item => item.User).WithMany(item => item.Memberships)
                .HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(item => item.Role).WithMany(item => item.Memberships)
                .HasForeignKey(item => item.RoleId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.ToTable("sessions");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(item => item.TokenHash).HasMaxLength(128).IsRequired();
            entity.Property(item => item.CreatedAt).HasDefaultValueSql("now()");
            entity.HasIndex(item => item.TokenHash).IsUnique();
            entity.HasIndex(item => new { item.TenantId, item.ExpiresAt });
            entity.HasQueryFilter(item => CurrentTenantId == null || item.TenantId == CurrentTenantId);
            entity.HasOne(item => item.User).WithMany(item => item.Sessions)
                .HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(item => item.Tenant).WithMany(item => item.Sessions)
                .HasForeignKey(item => item.TenantId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PlatformSetting>(entity =>
        {
            entity.ToTable("platform_settings");
            entity.HasKey(item => item.Key);
            entity.Property(item => item.Key).HasMaxLength(150);
            entity.Property(item => item.ValueJson).IsRequired();
            entity.Property(item => item.UpdatedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<PlatformAuditLog>(entity =>
        {
            entity.ToTable("platform_audit_logs");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(item => item.ActorType).HasMaxLength(50).IsRequired();
            entity.Property(item => item.ActorId).HasMaxLength(150).IsRequired();
            entity.Property(item => item.ActorEmail).HasMaxLength(320);
            entity.Property(item => item.Action).HasMaxLength(150).IsRequired();
            entity.Property(item => item.Timestamp).HasDefaultValueSql("now()");
            entity.HasIndex(item => item.Timestamp);
            entity.HasIndex(item => item.TenantId);
        });

        modelBuilder.Entity<SupportTicket>(entity =>
        {
            entity.ToTable("support_tickets");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(item => item.TicketNumber).HasMaxLength(50).IsRequired();
            entity.Property(item => item.Subject).HasMaxLength(250).IsRequired();
            entity.Property(item => item.Category).HasMaxLength(50).IsRequired();
            entity.Property(item => item.Priority).HasMaxLength(20).IsRequired();
            entity.Property(item => item.Status).HasMaxLength(30).IsRequired();
            entity.Property(item => item.CreatedAt).HasDefaultValueSql("now()");
            entity.HasIndex(item => item.TicketNumber).IsUnique();
            entity.HasIndex(item => item.TenantId);
            entity.HasOne(item => item.Tenant).WithMany()
                .HasForeignKey(item => item.TenantId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SupportTicketMessage>(entity =>
        {
            entity.ToTable("support_ticket_messages");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(item => item.SenderType).HasMaxLength(50).IsRequired();
            entity.Property(item => item.SenderId).HasMaxLength(150).IsRequired();
            entity.Property(item => item.SenderName).HasMaxLength(200).IsRequired();
            entity.Property(item => item.Message).IsRequired();
            entity.Property(item => item.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(item => item.Ticket).WithMany(item => item.Messages)
                .HasForeignKey(item => item.TicketId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SupportAccessGrant>(entity =>
        {
            entity.ToTable("support_access_grants");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(item => item.RequestedByAdminId).HasMaxLength(150).IsRequired();
            entity.Property(item => item.Reason).HasMaxLength(500).IsRequired();
            entity.Property(item => item.Status).HasMaxLength(30).IsRequired();
            entity.Property(item => item.CreatedAt).HasDefaultValueSql("now()");
            entity.HasIndex(item => item.TenantId);
            entity.HasOne(item => item.Tenant).WithMany()
                .HasForeignKey(item => item.TenantId).OnDelete(DeleteBehavior.Restrict);
        });
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ValidateTenantOwnership();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        ValidateTenantOwnership();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void ValidateTenantOwnership()
    {
        if (CurrentTenantId is not { } tenantId)
        {
            return;
        }

        foreach (var entry in ChangeTracker.Entries<ITenantOwnedEntity>())
        {
            if (entry.State is not (EntityState.Added or EntityState.Modified or EntityState.Deleted))
            {
                continue;
            }

            if (entry.Entity.TenantId != tenantId)
            {
                throw new UnauthorizedAccessException("The request attempted to access data outside the active tenant scope.");
            }

            if (entry.State == EntityState.Modified && entry.Property(nameof(ITenantOwnedEntity.TenantId)).IsModified)
            {
                throw new UnauthorizedAccessException("Tenant reassignment is not allowed.");
            }
        }

        foreach (var entry in ChangeTracker.Entries<Tenant>())
        {
            if (entry.State is not (EntityState.Added or EntityState.Modified or EntityState.Deleted))
            {
                continue;
            }

            if (entry.Entity.Id != tenantId)
            {
                throw new UnauthorizedAccessException("Cross-tenant updates are not allowed.");
            }
        }
    }
}
