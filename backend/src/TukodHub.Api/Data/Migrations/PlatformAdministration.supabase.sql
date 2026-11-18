BEGIN;

CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public."platform_settings" (
    "Key" character varying(150) NOT NULL,
    "ValueJson" text NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "UpdatedBy" character varying(320),
    CONSTRAINT "PK_platform_settings" PRIMARY KEY ("Key")
);

CREATE TABLE IF NOT EXISTS public."platform_audit_logs" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "Timestamp" timestamp with time zone NOT NULL DEFAULT now(),
    "ActorType" character varying(50) NOT NULL,
    "ActorId" character varying(150) NOT NULL,
    "ActorEmail" character varying(320),
    "TenantId" uuid,
    "Action" character varying(150) NOT NULL,
    "EntityName" character varying(150),
    "EntityId" character varying(150),
    "IpAddress" character varying(100),
    "UserAgent" text,
    "Details" text,
    CONSTRAINT "PK_platform_audit_logs" PRIMARY KEY ("Id")
);

CREATE INDEX IF NOT EXISTS "IX_platform_audit_logs_Timestamp" ON public."platform_audit_logs" ("Timestamp");
CREATE INDEX IF NOT EXISTS "IX_platform_audit_logs_TenantId" ON public."platform_audit_logs" ("TenantId");

CREATE TABLE IF NOT EXISTS public."support_tickets" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "TicketNumber" character varying(50) NOT NULL,
    "TenantId" uuid NOT NULL,
    "CreatedByUserId" uuid,
    "Subject" character varying(250) NOT NULL,
    "Category" character varying(50) NOT NULL,
    "Priority" character varying(20) NOT NULL DEFAULT 'Medium',
    "Status" character varying(30) NOT NULL DEFAULT 'Open',
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "ResolvedAt" timestamp with time zone,
    CONSTRAINT "PK_support_tickets" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_support_tickets_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public."tenants" ("Id") ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_support_tickets_TicketNumber" ON public."support_tickets" ("TicketNumber");
CREATE INDEX IF NOT EXISTS "IX_support_tickets_TenantId" ON public."support_tickets" ("TenantId");

CREATE TABLE IF NOT EXISTS public."support_ticket_messages" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "TicketId" uuid NOT NULL,
    "SenderType" character varying(50) NOT NULL,
    "SenderId" character varying(150) NOT NULL,
    "SenderName" character varying(200) NOT NULL,
    "Message" text NOT NULL,
    "AttachmentsJson" text,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "PK_support_ticket_messages" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_support_ticket_messages_support_tickets_TicketId" FOREIGN KEY ("TicketId") REFERENCES public."support_tickets" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_support_ticket_messages_TicketId" ON public."support_ticket_messages" ("TicketId");

CREATE TABLE IF NOT EXISTS public."support_access_grants" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "TenantId" uuid NOT NULL,
    "RequestedByAdminId" character varying(150) NOT NULL,
    "ApprovedByUserId" uuid,
    "Reason" character varying(500) NOT NULL,
    "Status" character varying(30) NOT NULL DEFAULT 'Requested',
    "DurationMinutes" integer NOT NULL DEFAULT 60,
    "ExpiresAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "PK_support_access_grants" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_support_access_grants_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public."tenants" ("Id") ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "IX_support_access_grants_TenantId" ON public."support_access_grants" ("TenantId");

COMMIT;
