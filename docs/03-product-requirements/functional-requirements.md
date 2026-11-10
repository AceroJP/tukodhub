# Functional Requirements

**Status:** Draft for founder approval

## Identity, tenancy, and permissions

- FR-001: The system shall create independent tenant workspaces.
- FR-002: Every tenant-owned record shall be associated with a tenant.
- FR-003: The system shall enforce tenant and branch authorization on the
  server.
- FR-004: The system shall support owner, administrator, dispatcher, branch
  manager, technician, and platform administrator roles.
- FR-005: Exceptional platform support access shall be explicitly authorized
  and audited.

## Customers and inquiries

- FR-010: Authorized staff shall create, search, update, and view customers.
- FR-011: Staff shall record inquiry source, requested service, contact details,
  service address, AC details, preferred date, and notes.
- FR-012: The system shall track inquiry status and follow-up activity.
- FR-013: The system shall retain inquiry history and creator information.
- FR-014: Staff shall convert an approved inquiry into a booking and job order
  without duplicating core information.

## Services, bookings, and quotations

- FR-020: A tenant shall manage its service catalog and pricing.
- FR-021: Staff shall create bookings and check technician availability.
- FR-022: The system shall prevent conflicting assignments unless an authorized
  user explicitly resolves the conflict.
- FR-023: Staff shall create standard-price records or quotations.
- FR-024: Quotations shall support labor, materials, discounts, applicable
  taxes, expiry, and revision history.
- FR-025: Customer approval or rejection shall be recorded.
- FR-026: Approved quotations shall not be silently modified.

## Jobs and technicians

- FR-030: Authorized users shall create job orders with branch, schedule,
  customer, service, and assigned technician.
- FR-031: The system shall enforce valid job status transitions.
- FR-032: Technicians shall view only their permitted assignments.
- FR-033: Technicians shall update Assigned, In Progress, and Work Completed.
- FR-034: Technicians shall submit notes, before-and-after photos, materials,
  and additional findings.
- FR-035: Owners or authorized staff shall review, reject for correction, and
  confirm completion.
- FR-036: Technicians shall not finalize invoices, record payments, or
  permanently close jobs without authorization.

## Invoices and payments

- FR-040: Authorized staff shall create invoices from approved work.
- FR-041: Invoices shall support partial payments and outstanding balances.
- FR-042: Authorized staff shall record cash, GCash, and bank transfers.
- FR-043: Payment records shall include amount, method, date, and optional
  reference and proof.
- FR-044: The system shall separately track job, invoice, and payment status.
- FR-045: An invoice shall be fully paid only when recorded payments satisfy its
  outstanding balance.

## Reports and customer links

- FR-050: The system shall provide basic inquiry, job, revenue, customer, and
  outstanding-balance reports.
- FR-051: Financial reports shall use recorded transaction data.
- FR-052: Authorized users shall generate links limited to specific customer
  resources.
- FR-053: Customer links shall use unguessable tokens and expiry.
- FR-054: Customer links shall not expose tenant administration or other
  customer records.

## Deferred and optional capabilities

- FR-060: Public booking pages may be supported after staff entry is reliable.
- FR-061: Online payment processing is excluded from the MVP.
- FR-062: Offline technician synchronization is excluded from the MVP.
- FR-063: Full customer accounts and self-service portals are excluded from the
  MVP.
- FR-064: Advanced inventory, SMS automation, and advanced analytics are
  deferred.
