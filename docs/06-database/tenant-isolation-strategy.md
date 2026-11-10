# Database Tenant Isolation Strategy

**Status:** Draft for founder approval

## Ownership model

Tenant-owned records include `tenant_id` and are never queried without a
trusted tenant context. Branch-owned records include `branch_id` and validate
that the branch belongs to the same tenant.

Platform reference records, such as subscription plans, roles, and permissions,
are explicitly platform-scoped and must not be confused with tenant data.

## Row-Level Security

PostgreSQL Row-Level Security is an additional protection layer, not a
replacement for application authorization. The API connection strategy must
set a transaction-scoped trusted tenant context after authenticating the
request. RLS policies then restrict tenant-owned table rows to that context.

The final implementation must resolve:

- Connection-pooling behavior.
- Transaction-scoped context reset.
- Migration and administrative bypass procedures.
- RLS behavior for background jobs.
- RLS test coverage for missing or invalid context.

## Query and foreign-key rules

- Repositories require tenant scope as an input.
- Client-provided tenant IDs cannot establish scope.
- Cross-tenant references are rejected.
- Branch membership is checked before branch-owned access.
- Customer links use hashed tokens and resource-specific authorization.
- File metadata and storage keys include tenant ownership.

## Test matrix

At minimum, database and API tests must cover:

1. Tenant A cannot select Tenant B customers.
2. Tenant A cannot update Tenant B jobs.
3. Tenant A cannot download Tenant B attachments.
4. A branch user cannot access another branch's records.
5. A technician cannot update an unassigned job.
6. A missing tenant context fails closed.
7. A background job cannot process another tenant's outbox item.
8. A customer link cannot access another customer or resource type.
9. Platform support access is explicit and audited.
