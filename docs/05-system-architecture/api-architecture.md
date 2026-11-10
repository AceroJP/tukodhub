# API Architecture

**Status:** Draft for founder approval

## API style

- RESTful HTTPS API.
- JSON request and response bodies.
- Versioned public API path, such as `/api/v1`.
- OpenAPI documentation generated from the API contract.
- Consistent problem-details error responses.
- Pagination, filtering, and sorting for collection endpoints.
- Idempotency protection for payment and other retry-sensitive writes.

## API layers

```text
HTTP endpoint
  -> authentication and tenant middleware
  -> request validation
  -> application command/query
  -> authorization policy
  -> domain operation
  -> transaction and persistence
  -> response mapping
```

## Resource groups

- `/auth`
- `/platform/tenants`
- `/business/profile`
- `/branches`
- `/users`
- `/customers`
- `/inquiries`
- `/follow-ups`
- `/services`
- `/bookings`
- `/quotations`
- `/jobs`
- `/technicians`
- `/invoices`
- `/payments`
- `/reports`
- `/notifications`
- `/customer-links`

## API rules

- Tenant and branch scope comes from the authenticated context.
- Request bodies cannot elevate role, tenant, branch, or ownership.
- State-changing endpoints validate allowed transitions.
- Payment writes return the resulting balance and payment status.
- Approved quotations use revision-aware commands.
- File uploads use a controlled upload flow and never expose raw storage
  credentials.
- Authorization failures do not reveal unrelated record existence.

## Response conventions

- Successful single-resource operations return the resource representation or
  an operation result.
- Collection responses include items and pagination metadata.
- Validation failures identify fields without exposing sensitive data.
- Conflicts identify the business conflict, such as a schedule collision.
- Correlation identifiers support troubleshooting without exposing secrets.
