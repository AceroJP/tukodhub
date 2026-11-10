# Tenant Isolation Design

**Status:** Draft for founder approval

## Core rule

Tenant identity is derived from the authenticated server-side context. A
client-submitted tenant ID is never trusted to select data access.

## Defense in depth

1. Authentication binds a user to memberships.
2. Tenant-resolution middleware creates a trusted request context.
3. Application services require that context for tenant-owned operations.
4. Repositories apply tenant predicates by default.
5. Branch predicates apply where the user is branch-scoped.
6. PostgreSQL Row-Level Security provides an additional database boundary.
7. Tenant-aware file paths and object-storage policies prevent cross-tenant
   downloads.
8. Audit records capture sensitive access and authorization decisions.
9. Automated tests attempt cross-tenant and cross-branch access on every
   sensitive resource family.

## Record ownership

Every tenant-owned record includes a tenant identifier. Branch-owned records
also include branch ownership directly or through a constrained relationship.
Shared platform records are explicitly identified and never treated as tenant
records.

## Customer links

Customer links are not general authentication. Each token maps to one intended
resource or narrowly defined view, has an expiry and revocation state, and
cannot be used to enumerate customer or tenant records.

## Failure behavior

Missing, invalid, expired, or unauthorized tenant context produces an explicit
authorization failure. The system must not silently return an empty success
response that could hide an access-control defect.
