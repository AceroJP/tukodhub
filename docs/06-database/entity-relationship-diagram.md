# Entity Relationship Diagram

**Phase:** Phase 5 - Database Architecture  
**Status:** Draft for founder approval  
**Date:** 2026-11-10

The following conceptual ERD describes the MVP data model. It is not a
migration or executable schema.

```mermaid
erDiagram
    TENANTS ||--o{ BRANCHES : owns
    TENANTS ||--o{ MEMBERSHIPS : has
    USERS ||--o{ MEMBERSHIPS : joins
    ROLES ||--o{ MEMBERSHIPS : grants
    BRANCHES ||--o{ BRANCH_MEMBERSHIPS : scopes
    MEMBERSHIPS ||--o{ BRANCH_MEMBERSHIPS : receives

    TENANTS ||--o{ CUSTOMERS : owns
    CUSTOMERS ||--o{ CUSTOMER_ADDRESSES : has
    TENANTS ||--o{ SERVICE_CATEGORIES : owns
    SERVICE_CATEGORIES ||--o{ SERVICES : groups
    TENANTS ||--o{ SERVICES : owns

    CUSTOMERS ||--o{ INQUIRIES : submits
    TENANTS ||--o{ INQUIRIES : owns
    INQUIRIES ||--o{ INQUIRY_FOLLOW_UPS : tracks
    INQUIRIES ||--o| BOOKINGS : converts_to
    BOOKINGS ||--o{ BOOKING_SERVICES : contains
    SERVICES ||--o{ BOOKING_SERVICES : selected
    BRANCHES ||--o{ BOOKINGS : hosts

    INQUIRIES ||--o{ QUOTATIONS : produces
    QUOTATIONS ||--o{ QUOTATION_REVISIONS : versions
    QUOTATION_REVISIONS ||--o{ QUOTATION_ITEMS : contains
    SERVICES ||--o{ QUOTATION_ITEMS : references

    BOOKINGS ||--o| JOB_ORDERS : creates
    CUSTOMERS ||--o{ JOB_ORDERS : receives
    BRANCHES ||--o{ JOB_ORDERS : owns
    JOB_ORDERS ||--o{ JOB_ASSIGNMENTS : assigns
    MEMBERSHIPS ||--o{ JOB_ASSIGNMENTS : performs
    JOB_ORDERS ||--o{ JOB_STATUS_HISTORY : records
    JOB_ORDERS ||--o{ JOB_MATERIALS : uses
    MATERIALS ||--o{ JOB_MATERIALS : catalogues
    JOB_ORDERS ||--o{ ATTACHMENTS : documents

    JOB_ORDERS ||--o| INVOICES : bills
    INVOICES ||--o{ INVOICE_ITEMS : contains
    INVOICES ||--o{ PAYMENTS : receives
    CUSTOMERS ||--o{ PAYMENTS : makes

    TENANTS ||--o{ CUSTOMER_LINKS : issues
    CUSTOMER_LINKS }o--|| CUSTOMERS : identifies
    CUSTOMER_LINKS }o--o| QUOTATIONS : exposes
    CUSTOMER_LINKS }o--o| BOOKINGS : exposes
    CUSTOMER_LINKS }o--o| JOB_ORDERS : exposes
    CUSTOMER_LINKS }o--o| INVOICES : exposes

    TENANTS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ NOTIFICATIONS : targets
    TENANTS ||--o{ ACTIVITY_LOGS : records
    USERS ||--o{ ACTIVITY_LOGS : performs

    TENANTS {
        uuid id PK
        string name
        string status
    }
    USERS {
        uuid id PK
        string email UK
        string display_name
    }
    MEMBERSHIPS {
        uuid id PK
        uuid tenant_id FK
        uuid user_id FK
        uuid role_id FK
    }
    BRANCHES {
        uuid id PK
        uuid tenant_id FK
        string name
    }
    CUSTOMERS {
        uuid id PK
        uuid tenant_id FK
        string name
        string phone
    }
    INQUIRIES {
        uuid id PK
        uuid tenant_id FK
        uuid customer_id FK
        string status
        string source_channel
    }
    BOOKINGS {
        uuid id PK
        uuid tenant_id FK
        uuid branch_id FK
        uuid inquiry_id FK
        datetime starts_at
    }
    QUOTATIONS {
        uuid id PK
        uuid tenant_id FK
        uuid inquiry_id FK
        string status
    }
    JOB_ORDERS {
        uuid id PK
        uuid tenant_id FK
        uuid branch_id FK
        uuid booking_id FK
        string status
    }
    INVOICES {
        uuid id PK
        uuid tenant_id FK
        uuid job_order_id FK
        decimal total
        string status
    }
    PAYMENTS {
        uuid id PK
        uuid tenant_id FK
        uuid invoice_id FK
        decimal amount
        string method
    }
```

## Modeling notes

- `MEMBERSHIPS` represents tenant membership; `BRANCH_MEMBERSHIPS` represents
  branch scope and avoids assuming all users have tenant-wide access.
- `QUOTATION_REVISIONS` preserves approved quotation history.
- `JOB_STATUS_HISTORY` preserves operational state changes.
- Payment status is derived from invoice totals and verified payments, not
  treated as a substitute for job status.
- Attachments store metadata and reference tenant-aware external object storage.
