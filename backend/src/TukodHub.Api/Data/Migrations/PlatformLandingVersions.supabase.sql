-- Migration: Add platform_landing_versions table with unique version index
CREATE TABLE IF NOT EXISTS platform_landing_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_number INT NOT NULL,
    published_by VARCHAR(320) NOT NULL,
    change_summary TEXT,
    payload_json TEXT NOT NULL,
    revalidation_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    revalidated_at TIMESTAMPTZ,
    revalidation_attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_landing_versions_version 
ON platform_landing_versions (version_number);

CREATE INDEX IF NOT EXISTS idx_platform_landing_versions_created_at 
ON platform_landing_versions (created_at DESC);
