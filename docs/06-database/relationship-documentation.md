# Relationship Documentation

**Status:** Draft for founder approval

## Platform and tenant relationships

- One tenant has one business profile and many branches.
- One tenant may have one active subscription at a time, while subscription
  history is retained.
- A user may belong to multiple tenants through memberships.
- A membership has one primary tenant role and may be scoped to many branches.
- Roles and permissions are shared definitions; memberships grant their use.

## Customer and operational relationships

- A tenant has many customers.
- A customer may have multiple service addresses.
- An inquiry belongs to one tenant and one customer.
- An inquiry may have many requested services and follow-ups.
- An inquiry may produce at most one confirmed booking in the initial model;
  revisions or rescheduling update the booking history rather than creating
  ambiguous duplicates.
- A booking belongs to one branch and customer and may contain many services.
- A booking may create at most one job order for the initial workflow.

## Quotation relationships

- An inquiry may have multiple quotations, for example after rejection or
  revised scope.
- A quotation has many revisions.
- A revision has many items and is never mutated after approval.
- Approval references the exact quotation revision that the customer accepted.
- A quotation may be eligible to create a job only after valid approval.

## Job relationships

- A job belongs to one tenant, branch, customer, and normally one booking.
- A job may have multiple assignments over time, but only valid active
  assignments can direct technician access.
- A job has append-only status history and may have multiple completion
  submissions when corrections are requested.
- A job may contain many materials and attachments.

## Billing relationships

- A confirmed job may produce an invoice.
- An invoice has immutable line-item snapshots for financial traceability.
- An invoice may have many payments.
- A payment belongs to one invoice and customer within the same tenant.
- Invoice payment status is calculated from invoice total and valid payment
  records; it is not the job status.

## Ownership invariants

- Every relationship between tenant-owned records must be tenant-consistent.
- Cross-tenant foreign-key combinations must be rejected.
- Branch-owned records must reference a branch belonging to the same tenant.
- A technician membership used in an assignment must belong to the same tenant
  and permitted branch scope.
- Customer links, attachments, and notifications carry tenant ownership.
