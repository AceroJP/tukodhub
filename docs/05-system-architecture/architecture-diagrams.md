# Architecture Diagrams

**Status:** Draft for founder approval

## Deployment view

```text
User browser / Android browser
          |
       HTTPS
          |
   Web hosting / CDN
          |
   Next.js frontend
          |
       HTTPS REST
          |
 ASP.NET Core API
    |       |       |
 PostgreSQL Files  Email
    |
 Background jobs and audit records
```

## Backend module view

```text
Platform  Identity  Business
    \       |       /
     \      |      /
       Shared authorization context
                  |
 Customers -> Requests -> Scheduling
                  |
        Services -> Quotations
                  |
              Jobs
               |
        Billing and Payments
               |
 Reports / Notifications / Audit
```

## Tenant authorization path

```text
Request
  -> Authentication
  -> Tenant context from trusted identity
  -> Branch and role scope
  -> Endpoint policy
  -> Application service authorization
  -> Tenant-scoped query
  -> PostgreSQL RLS / constraints
  -> Response
```

## Asynchronous notification path

```text
Business event
  -> Transactional outbox record
  -> Background worker
  -> Email/in-app notification adapter
  -> Delivery result and audit record
```
