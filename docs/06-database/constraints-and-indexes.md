# Constraints and Indexes

**Status:** Draft for founder approval

## Integrity constraints

- `tenant_id` is required on every tenant-owned table.
- Foreign keys use restrictive deletion by default for financial and historical
  records.
- Tenant-owned foreign keys must be validated for matching tenant ownership.
- Email values used for authentication have a normalized uniqueness strategy.
- A tenant cannot have duplicate active branch names where business policy
  requires uniqueness.
- Service names and category names have tenant-scoped uniqueness rules.
- Inquiry source, statuses, payment methods, and role scopes use constrained
  values.
- Monetary amounts are non-negative unless an explicitly modeled adjustment
  requires otherwise.
- Quantity and duration values are positive where applicable.
- Invoice totals and line totals are internally consistent.
- Payment amount cannot be negative and cannot be accepted for a voided
  invoice.
- Quotation revision numbers are unique per quotation.
- A quotation approval references exactly one revision.
- Customer-link token hashes are unique and raw tokens are never stored.
- Attachment metadata must include a tenant and resource reference.

## Recommended indexes

- `memberships (tenant_id, user_id)` and active-status variants.
- `branch_memberships (branch_id, membership_id)`.
- `customers (tenant_id, normalized_phone)` and searchable name support.
- `inquiries (tenant_id, status, created_at)`.
- `inquiries (tenant_id, follow_up_due_at)` through follow-up records.
- `bookings (tenant_id, branch_id, starts_at, ends_at)`.
- `job_orders (tenant_id, status, scheduled_start)`.
- `job_assignments (tenant_id, membership_id, starts_at)`.
- `job_status_history (tenant_id, job_order_id, changed_at)`.
- `quotations (tenant_id, status, expires_at)`.
- `invoices (tenant_id, status, issued_at)`.
- `payments (tenant_id, invoice_id, paid_at)`.
- `attachments (tenant_id, resource_type, resource_id)`.
- `customer_links (token_hash)` and expiry lookup.
- `activity_logs (tenant_id, occurred_at, resource_type, resource_id)`.
- `outbox_messages (status, available_at)`.

## Scheduling conflict protection

Application logic must detect overlapping assignments. PostgreSQL exclusion
constraints or an equivalent database-supported strategy should be evaluated
for the final scheduling representation before migrations are authored.
