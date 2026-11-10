# API Documentation

**Phase:** Phase 6 - API and Implementation Planning  
**Status:** Draft for founder approval  
**Date:** 2026-11-10

## Contract conventions

- Base path: `/api/v1`.
- JSON request and response bodies.
- UUID resource identifiers.
- Authenticated tenant and branch scope comes from server-side context.
- Collection responses use `{ items, page, pageSize, totalCount }`.
- Errors use a consistent problem-details shape with a correlation ID.
- State-changing retry-sensitive requests support an idempotency key.
- Dates and timestamps use ISO 8601 with UTC timestamps at the API boundary.
- Money responses include amount and currency, with `PHP` for MVP records.

## Authentication

### `POST /api/v1/auth/register`

Creates a tenant and initial owner account.

**Request:** business name, owner name, email, phone, password.  
**Response:** tenant summary and authenticated session metadata.  
**Rules:** validate unique normalized email, password policy, and required
business data.

### `POST /api/v1/auth/login`

Authenticates a business user and creates a secure session.

### `POST /api/v1/auth/logout`

Revokes the current session.

### `GET /api/v1/auth/me`

Returns the current user, tenant membership, roles, and permitted branch scope.

## Business and team

### `GET/PATCH /api/v1/business/profile`

Reads or updates the current tenant business profile.

### `GET/POST/PATCH /api/v1/branches`

Lists, creates, or updates branches within the current tenant.

### `GET/POST/PATCH /api/v1/users`

Lists, invites, updates, or deactivates tenant users. Role and branch scope
changes require owner or authorized administrator permission.

## Customers and inquiries

### `GET/POST /api/v1/customers`

Searches or creates customers. Search supports normalized phone and name
without exposing records outside tenant and branch policy.

### `GET/PATCH /api/v1/customers/{customerId}`

Reads or updates a customer and permitted contact information.

### `GET/POST /api/v1/inquiries`

Creates or lists inquiries. Create accepts source channel, customer,
service/address details, preferred schedule, notes, and follow-up data.

### `GET/PATCH /api/v1/inquiries/{inquiryId}`

Reads or updates permitted inquiry data and status.

### `GET/POST /api/v1/inquiries/{inquiryId}/follow-ups`

Lists or records follow-up activity.

### `POST /api/v1/inquiries/{inquiryId}/convert`

Converts an approved inquiry into a booking and job order within one
transactional operation.

## Services, bookings, and quotations

### `GET/POST/PATCH /api/v1/services`

Manages the tenant service catalog.

### `GET /api/v1/availability`

Returns permitted technician and branch availability for a requested time
range.

### `GET/POST/PATCH /api/v1/bookings`

Creates, lists, and updates bookings while checking assignment conflicts.

### `GET/POST /api/v1/quotations`

Creates or lists quotations and their current revision.

### `POST /api/v1/quotations/{quotationId}/revisions`

Creates a new quotation revision without modifying historical revisions.

### `POST /api/v1/quotations/{quotationId}/send-link`

Creates a scoped customer link for quotation review.

### `POST /api/v1/quotations/{quotationId}/approve`

Records approval for a specified revision. Customer-link approval uses a
narrowly scoped public operation rather than a business-user session.

## Jobs and technician operations

### `GET/POST/PATCH /api/v1/jobs`

Lists, creates, and updates job orders according to role and status rules.

### `GET /api/v1/technician/jobs`

Returns assignments visible to the authenticated technician.

### `POST /api/v1/jobs/{jobId}/status`

Applies a valid status transition and records status history.

### `POST /api/v1/jobs/{jobId}/submission`

Submits technician notes, photos, materials, and findings for review.

### `POST /api/v1/jobs/{jobId}/review`

Allows an authorized reviewer to accept or return a submission for correction.

## Billing and payments

### `GET/POST /api/v1/invoices`

Lists or creates invoices from confirmed work.

### `GET /api/v1/invoices/{invoiceId}`

Returns invoice lines, totals, balance, and payment status.

### `POST /api/v1/invoices/{invoiceId}/payments`

Records a cash, GCash, or bank-transfer payment. Requires an idempotency key
and returns the updated balance and payment status.

### `GET /api/v1/invoices/{invoiceId}/payments`

Returns authorized payment history.

## Customer links

### `GET /api/v1/customer-links/{token}`

Returns the specific non-administrative resource authorized by a valid,
unexpired token.

### `POST /api/v1/customer-links/{token}/approve`

Records customer approval only when the token is scoped to an approvable
quotation revision.

## Reports and notifications

### `GET /api/v1/reports/operations`

Returns inquiry, booking, job, technician, and follow-up summaries.

### `GET /api/v1/reports/financial`

Returns verified invoice, payment, and outstanding-balance summaries.

### `GET /api/v1/notifications`

Returns in-app notifications for the authenticated user.

## Standard error categories

- `400`: malformed request or validation failure.
- `401`: missing or invalid authentication.
- `403`: authenticated but unauthorized scope or action.
- `404`: permitted resource not found; avoid unrelated-record disclosure.
- `409`: state conflict, duplicate, or schedule collision.
- `422`: semantically invalid business operation.
- `429`: rate limit exceeded.
- `500`: unexpected server error with correlation ID.
