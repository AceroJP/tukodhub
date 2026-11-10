# Backend Structure

**Status:** Draft for founder approval

## Recommended project layers

```text
src/backend/
  TukodHub.Api/
    Endpoints/
    Middleware/
    Filters/
    OpenApi/
  TukodHub.Application/
    Abstractions/
    Identity/
    Platform/
    Business/
    Customers/
    Requests/
    Services/
    Scheduling/
    Quotations/
    Jobs/
    Billing/
    Reporting/
    Notifications/
  TukodHub.Domain/
    Common/
    Identity/
    Platform/
    Business/
    Customers/
    Requests/
    Services/
    Scheduling/
    Quotations/
    Jobs/
    Billing/
  TukodHub.Infrastructure/
    Persistence/
    Authentication/
    Authorization/
    Files/
    Messaging/
    Monitoring/
    BackgroundJobs/
```

## Layer responsibilities

- **Api:** HTTP concerns, authentication middleware, request binding, response
  contracts, API versioning, and OpenAPI.
- **Application:** use cases, commands, queries, validation, authorization
  orchestration, and transaction boundaries.
- **Domain:** business entities, value rules, status transitions, and domain
  events without infrastructure dependencies.
- **Infrastructure:** EF Core, PostgreSQL, external providers, file storage,
  background jobs, and monitoring.

## Module rules

- Each module owns its application contracts and domain rules.
- Cross-module interactions use explicit application interfaces or events.
- Controllers or endpoints must not contain financial or authorization rules.
- Persistence queries must receive a trusted tenant and branch scope.
- Domain objects must not accept client-supplied tenant identifiers as
  authority.
