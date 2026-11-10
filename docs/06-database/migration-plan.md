# Migration Plan

**Status:** Draft for founder approval  
**Important:** No migration files have been created.

## Sequence

1. Establish migration conventions and a development database.
2. Create platform and identity tables.
3. Create tenant, branch, membership, and authorization structures.
4. Create customer, service, inquiry, follow-up, and booking tables.
5. Create quotation and approval-history tables.
6. Create job, assignment, status-history, material, and attachment metadata
   tables.
7. Create invoice, invoice-item, payment, and balance-supporting structures.
8. Create customer-link, notification, outbox, and audit tables.
9. Add foreign keys, tenant-consistency constraints, check constraints, and
   indexes.
10. Add PostgreSQL Row-Level Security policies and controlled database-context
    handling.
11. Seed only approved platform reference data, such as roles and permissions.
12. Run migration tests against a clean database and a representative
    multi-tenant dataset.

## Safety rules

- Every migration is reviewed before application.
- Production backups are verified before schema changes.
- Migrations are forward-compatible where practical.
- Destructive changes require explicit review and a data-preservation plan.
- Production databases are never reset or deleted to resolve migration
  problems.
- Rollback strategy is documented for each risky change.

## Validation before implementation

The founder must approve the entity model, ownership model, status
representation, financial precision, and RLS approach before any EF Core
migration is created.
