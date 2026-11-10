# Authentication and Authorization Design

**Status:** Draft for founder approval

## Authentication

- Business users authenticate through a secure established identity mechanism.
- Passwords, if supported, use a well-established password hashing library.
- Sessions use secure, HttpOnly, SameSite-aware cookies or an equivalent
  approved token strategy.
- Authentication responses do not reveal whether an account exists.
- Login, invitation, password-reset, and session events are rate-limited and
  audited.
- Secrets, signing keys, and provider credentials are environment-managed.

## Authorization layers

1. **Authentication:** Is the principal signed in or using a valid customer
   link?
2. **Tenant policy:** Does the principal belong to the requested tenant?
3. **Branch policy:** Does the principal have access to the requested branch?
4. **Role policy:** Is the operation allowed for the principal's role?
5. **Assignment policy:** Is the technician assigned to this job?
6. **Resource policy:** Is the resource in the permitted scope and state?

Every layer is enforced by the API. Frontend route guards are convenience,
not security.

## Role model

- Platform administrator: platform operations; no automatic tenant-data
  access.
- Business owner: tenant-wide business and financial authority.
- Business administrator: operational tenant access within assigned scope.
- Branch manager: assigned branch management.
- Dispatcher: inquiries, scheduling, assignments, and operational updates.
- Technician: assigned job updates and evidence submission.
- Customer link: read or approve only the explicitly scoped resource.

## Sensitive actions

Require explicit authorization and audit records:

- Tenant support access.
- Role or permission changes.
- Quotation approval or revision.
- Job completion confirmation.
- Invoice creation or adjustment.
- Payment recording or correction.
- Customer-link creation or revocation.
