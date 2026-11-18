DROP TABLE IF EXISTS public.platform_landing_versions CASCADE;

CREATE TABLE public."platform_landing_versions" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "VersionNumber" INT NOT NULL,
    "PublishedBy" VARCHAR(320) NOT NULL,
    "ChangeSummary" TEXT,
    "PayloadJson" TEXT NOT NULL,
    "RevalidationStatus" VARCHAR(50) NOT NULL DEFAULT 'Pending',
    "RevalidatedAt" TIMESTAMPTZ,
    "RevalidationAttempts" INT NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "idx_platform_landing_versions_version" 
ON public."platform_landing_versions" ("VersionNumber");

CREATE INDEX "idx_platform_landing_versions_created_at" 
ON public."platform_landing_versions" ("CreatedAt" DESC);
