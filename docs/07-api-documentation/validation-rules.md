# API Validation Rules

**Status:** Draft for founder approval

## General validation

- Reject malformed UUIDs, unsupported enum values, invalid timestamps, and
  unexpected fields where strict contracts are appropriate.
- Normalize email and phone values before uniqueness checks.
- Require UTC-compatible timestamps and reject impossible date ranges.
- Enforce maximum lengths for names, notes, addresses, references, and
  descriptions.
- Return field-level validation errors without exposing sensitive data.

## Inquiry and booking

- Source channel is one of Messenger, phone, SMS, walk-in, or an approved
  future value.
- Customer, service, address, and preferred date are required for a complete
  inquiry.
- Follow-up due time cannot be invalid relative to the inquiry policy.
- Booking end time must follow start time.
- Booking branch must belong to the current tenant.
- Technician assignments must belong to the tenant and permitted branch.
- Overlapping assignments produce a conflict response.

## Quotations

- Quantity and unit prices are non-negative and use approved decimal precision.
- Line totals and summary totals are calculated server-side.
- Discount and tax rules cannot produce an invalid negative payable total.
- An approved revision is immutable.
- Approval must reference the exact revision.
- Expired or revoked quotations cannot be approved.

## Jobs

- Job transitions follow the approved transition matrix.
- A technician can update only an assigned job.
- Work-completed submission requires the required notes and configured evidence
  fields.
- Review actions require an authorized reviewer.
- Invoice creation requires confirmed work.

## Invoices and payments

- Invoice lines and totals are calculated server-side.
- Payment method is cash, GCash, or bank transfer for MVP.
- Payment amount is positive and uses PHP.
- Payment date cannot violate configured business rules.
- A payment cannot target another tenant's invoice.
- Duplicate retries with the same idempotency key return the original result.
- Payment status is recalculated from valid recorded payments.

## Customer links and uploads

- Raw customer-link tokens are never persisted; only secure hashes are stored.
- Links require an expiry and resource scope.
- Expired or revoked tokens fail closed.
- Upload content type, size, extension, and resource ownership are validated.
