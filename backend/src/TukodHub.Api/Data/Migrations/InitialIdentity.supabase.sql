BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public."permissions" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "Code" character varying(150) NOT NULL,
    "Description" character varying(500) NOT NULL,
    CONSTRAINT "PK_permissions" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS public."roles" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "Name" character varying(100) NOT NULL,
    "Scope" character varying(20) NOT NULL,
    "IsActive" boolean NOT NULL,
    CONSTRAINT "PK_roles" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS public."tenants" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "Name" character varying(200) NOT NULL,
    "Slug" character varying(100) NOT NULL,
    "Status" character varying(20) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "PK_tenants" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS public."users" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "Email" character varying(320) NOT NULL,
    "NormalizedEmail" character varying(320) NOT NULL,
    "DisplayName" character varying(200) NOT NULL,
    "Phone" character varying(40),
    "Status" character varying(20) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "PK_users" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS public."role_permissions" (
    "RoleId" uuid NOT NULL,
    "PermissionId" uuid NOT NULL,
    CONSTRAINT "PK_role_permissions" PRIMARY KEY ("RoleId", "PermissionId"),
    CONSTRAINT "FK_role_permissions_permissions_PermissionId"
        FOREIGN KEY ("PermissionId") REFERENCES public."permissions" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_role_permissions_roles_RoleId"
        FOREIGN KEY ("RoleId") REFERENCES public."roles" ("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public."business_profiles" (
    "TenantId" uuid NOT NULL,
    "LegalName" character varying(200) NOT NULL,
    "DisplayName" character varying(200) NOT NULL,
    "Phone" character varying(40),
    "Address" character varying(500),
    "Timezone" character varying(100) NOT NULL,
    "Currency" character varying(3) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "PK_business_profiles" PRIMARY KEY ("TenantId"),
    CONSTRAINT "FK_business_profiles_tenants_TenantId"
        FOREIGN KEY ("TenantId") REFERENCES public."tenants" ("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public."memberships" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "TenantId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "RoleId" uuid NOT NULL,
    "Status" character varying(20) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "PK_memberships" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_memberships_roles_RoleId"
        FOREIGN KEY ("RoleId") REFERENCES public."roles" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_memberships_tenants_TenantId"
        FOREIGN KEY ("TenantId") REFERENCES public."tenants" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_memberships_users_UserId"
        FOREIGN KEY ("UserId") REFERENCES public."users" ("Id") ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public."sessions" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "UserId" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "TokenHash" character varying(128) NOT NULL,
    "ExpiresAt" timestamp with time zone NOT NULL,
    "RevokedAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "PK_sessions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_sessions_tenants_TenantId"
        FOREIGN KEY ("TenantId") REFERENCES public."tenants" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_sessions_users_UserId"
        FOREIGN KEY ("UserId") REFERENCES public."users" ("Id") ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_memberships_TenantId_UserId"
    ON public."memberships" ("TenantId", "UserId");
CREATE INDEX IF NOT EXISTS "IX_memberships_RoleId"
    ON public."memberships" ("RoleId");
CREATE INDEX IF NOT EXISTS "IX_memberships_UserId"
    ON public."memberships" ("UserId");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_permissions_Code"
    ON public."permissions" ("Code");
CREATE INDEX IF NOT EXISTS "IX_role_permissions_PermissionId"
    ON public."role_permissions" ("PermissionId");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_roles_Scope_Name"
    ON public."roles" ("Scope", "Name");
CREATE INDEX IF NOT EXISTS "IX_sessions_TenantId_ExpiresAt"
    ON public."sessions" ("TenantId", "ExpiresAt");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_sessions_TokenHash"
    ON public."sessions" ("TokenHash");
CREATE INDEX IF NOT EXISTS "IX_sessions_UserId"
    ON public."sessions" ("UserId");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_tenants_Slug"
    ON public."tenants" ("Slug");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_users_NormalizedEmail"
    ON public."users" ("NormalizedEmail");

CREATE TABLE IF NOT EXISTS public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

INSERT INTO public."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20261110154206_InitialIdentity', '10.0.14')
ON CONFLICT ("MigrationId") DO NOTHING;

COMMIT;
