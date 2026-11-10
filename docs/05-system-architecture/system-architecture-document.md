# System Architecture Document

**Product:** TukodHub  
**Phase:** Phase 4 - System Architecture  
**Status:** Draft for founder approval  
**Date:** 2026-11-10

## 1. Architecture decision

TukodHub will use a modular monolith with two separately deployable
applications:

- A Next.js and TypeScript frontend.
- An ASP.NET Core Web API backend.

The backend remains one deployable application with clear module boundaries.
PostgreSQL is the system of record, accessed through Entity Framework Core.

Microservices are explicitly deferred.

## 2. Logical architecture

```text
Browser / Android browser
          |
          v
Next.js frontend
          |
          | HTTPS REST API
          v
ASP.NET Core API
  +-----------------------------+
  | Identity and access         |
  | Tenant and business         |
  | Customers and inquiries     |
  | Services and bookings       |
  | Quotations                  |
  | Jobs and technicians        |
  | Invoices and payments       |
  | Reports and notifications   |
  | Audit and platform admin   |
  +-----------------------------+
          |
          v
Application services
          |
          v
Domain rules and module policies
          |
          v
Infrastructure adapters
  | PostgreSQL / EF Core
  | File storage
  | Email provider
  | Background job scheduler
  | Monitoring and audit sinks
```

## 3. Request flow

1. The client sends an HTTPS request to the frontend or API.
2. The API authenticates the user or validates a narrowly scoped customer-link
   token.
3. Middleware resolves the authenticated tenant and permitted branch scope.
4. The endpoint invokes an application service for the relevant module.
5. The application service validates the command and invokes domain rules.
6. Repositories or data services apply tenant and branch predicates.
7. PostgreSQL constraints and row-level security provide additional protection.
8. The API returns a documented response and records relevant audit activity.

## 4. Module boundaries

- **Platform:** tenants, plans, subscriptions, platform configuration, system
  health, and audited support access.
- **Identity:** users, credentials, sessions, roles, permissions, and
  invitations.
- **Business:** business profiles, branches, settings, branding, and operating
  hours.
- **Customers:** customer records, addresses, notes, and service history.
- **Requests:** inquiries, follow-ups, booking requests, and source channels.
- **Services:** service categories, catalog entries, pricing, duration, and
  availability.
- **Scheduling:** bookings, availability, technician assignments, and
  conflicts.
- **Quotations:** quotation versions, items, approvals, expiry, and revisions.
- **Jobs:** job orders, status history, technician submissions, photos,
  materials, and completion review.
- **Billing:** invoices, invoice items, payments, balances, and receipts.
- **Reporting:** read-oriented operational and financial projections based on
  verified records.
- **Notifications:** in-app and transactional email notifications.
- **Audit:** immutable-style activity records and access events.

Modules may call application contracts, but should not directly access another
module's private persistence implementation.

## 5. Data and transaction strategy

- PostgreSQL is the source of truth.
- EF Core is used for persistence and migrations in a later approved phase.
- Financial writes use explicit transactions.
- Status transitions and approvals append history rather than silently
  overwriting important events.
- Reports read verified invoice and payment records.
- UUID identifiers are used for externally addressable records.
- Monetary values use decimal/numeric storage, never binary floating point.

## 6. External services

External integrations are adapters behind interfaces and are not required for
the first core workflow:

- Transactional email provider.
- Tenant-aware object/file storage.
- Error monitoring.
- Optional payment gateway, deferred from MVP.
- Optional SMS provider, deferred from MVP.

## 7. Environments

- **Development:** local development and test data only.
- **Staging:** production-like verification and acceptance testing.
- **Production:** restricted access, backups, monitoring, and controlled
  deployment.

Secrets and connection strings are environment-managed and never committed.

## 8. Architecture constraints

- No frontend-only authorization.
- No client-selected tenant context trusted as authority.
- No direct cross-module database shortcuts.
- No microservices during the initial release.
- No production database reset to solve migration issues.
