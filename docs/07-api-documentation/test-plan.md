# Test Plan

**Status:** Draft for founder approval

## Test levels

### Unit tests

- Status-transition rules.
- Quotation revision immutability.
- Invoice and payment calculations.
- Balance and payment-status derivation.
- Validation rules.
- Permission-policy decisions.
- Customer-link expiry and scope.

### Integration tests

- EF Core mappings and constraints.
- Tenant and branch query scoping.
- PostgreSQL RLS policies.
- Transactional inquiry conversion.
- Booking conflict detection.
- Quotation approval and revision persistence.
- Invoice and payment transaction boundaries.
- Outbox creation and retry behavior.

### API tests

- Authentication and session behavior.
- Role and branch authorization.
- CRUD operations for each resource.
- Valid and invalid status transitions.
- Validation and problem-details responses.
- Idempotent payment retries.
- Customer-link access and expiry.
- File-upload authorization and metadata.

### End-to-end tests

- Inquiry through booking and job creation.
- Technician assignment through completion review.
- Confirmed job through invoice and partial/full payment.
- Customer quotation approval using a secure link.
- Two-tenant cross-access attempts.
- Two-branch access boundaries.

### Responsive and usability tests

- Business inquiry capture on desktop and tablet.
- Technician job update on ordinary Android browser.
- Photo upload progress and retry.
- Customer link on a small mobile screen.
- Keyboard, focus, validation, and status accessibility.

## Security test matrix

- Cross-tenant read, write, download, and enumeration attempts.
- Cross-branch access attempts.
- Unassigned technician job updates.
- Expired, revoked, malformed, and replayed customer links.
- Upload content-type spoofing and oversized files.
- Rate-limit behavior for authentication and public links.
- Sensitive data absence from logs and error responses.

## Financial test matrix

- Zero, partial, exact, and excess payment scenarios.
- Duplicate payment request with same idempotency key.
- Concurrent payment recording.
- Voided or cancelled invoice behavior.
- Decimal precision and currency handling.
- Report totals against verified source records.

## Release gate

No implementation module is considered ready when critical authorization,
tenant-isolation, financial-integrity, or data-loss tests fail.
