# Storage, Background Work, and Monitoring

**Status:** Draft for founder approval

## File storage

- Store service photos and payment proof outside the relational database, with
  metadata in PostgreSQL.
- Use tenant and resource-scoped object keys.
- Do not expose public buckets or permanent raw object URLs.
- Issue short-lived authorized download URLs or stream through an authorized
  API.
- Validate file size, content type, extension, and image safety.
- Scan uploads where the selected provider supports it.
- Record uploader, tenant, resource, timestamp, and deletion state.

## Background work

Use background jobs for work that should not block an HTTP request:

- Transactional email.
- In-app notification fan-out.
- Secure-link expiry cleanup.
- Report generation when it becomes expensive.
- Upload processing or image metadata extraction.

Business writes should create durable outbox records in the same transaction
when a later notification must not be lost. Workers must be tenant-aware,
retry safely, and record failures visibly.

## Logging and monitoring

- Structured logs with correlation IDs.
- Never log passwords, tokens, payment proof, or unnecessary customer data.
- Capture authentication, authorization failures, status changes, approvals,
  payments, file access, and support access in audit records.
- Monitor API errors, latency, background-job failures, database health,
  storage failures, and unusual authorization failures.
- Use error monitoring after provider selection.

## Alerts

Alert on sustained API failures, database unavailability, failed payment
record writes, background queue growth, storage failures, and possible
cross-tenant access attempts.
