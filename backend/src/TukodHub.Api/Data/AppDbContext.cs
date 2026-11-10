using Microsoft.EntityFrameworkCore;

namespace TukodHub.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<BusinessProfile> BusinessProfiles => Set<BusinessProfile>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Membership> Memberships => Set<Membership>();
    public DbSet<Session> Sessions => Set<Session>();

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
            entity.HasOne(item => item.User).WithMany(item => item.Sessions)
                .HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(item => item.Tenant).WithMany(item => item.Sessions)
                .HasForeignKey(item => item.TenantId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
