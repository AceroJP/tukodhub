BEGIN;

ALTER TABLE public."users"
    ADD COLUMN IF NOT EXISTS "PasswordHash" character varying(256);

ALTER TABLE public."users"
    ALTER COLUMN "PasswordHash" SET NOT NULL;

COMMIT;
