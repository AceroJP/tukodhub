# API Endpoint Matrix

**Status:** Draft for founder approval

| Area | Endpoint | Primary roles | Tenant/branch scope | Main rule |
|---|---|---|---|---|
| Auth | `POST /auth/register` | Public | Creates tenant | Creates initial owner |
| Auth | `POST /auth/login` | Public | Resolved after auth | Rate limited |
| Auth | `GET /auth/me` | Authenticated | Current membership | Returns permitted scope |
| Business | `PATCH /business/profile` | Owner, admin | Tenant | Cannot change tenant identity arbitrarily |
| Branches | `POST /branches` | Owner, admin | Tenant | Branch belongs to tenant |
| Users | `PATCH /users/{id}` | Owner, admin | Tenant | Role changes audited |
| Customers | `GET/POST /customers` | Owner, admin, dispatcher, manager | Tenant/branch policy | No cross-tenant access |
| Inquiries | `GET/POST /inquiries` | Owner, admin, dispatcher, manager | Tenant/branch policy | Source and required data validated |
| Follow-ups | `POST /inquiries/{id}/follow-ups` | Owner, admin, dispatcher | Inquiry scope | Due activity is auditable |
| Convert | `POST /inquiries/{id}/convert` | Owner, admin, dispatcher | Inquiry scope | Approved inquiry only |
| Services | `POST /services` | Owner, admin | Tenant | Tenant-custom catalog |
| Availability | `GET /availability` | Owner, admin, dispatcher, manager | Branch | Detect conflicts |
| Bookings | `POST /bookings` | Owner, admin, dispatcher, manager | Branch | Valid schedule required |
| Quotations | `POST /quotations` | Owner, admin, dispatcher | Tenant/branch | Revisioned after approval |
| Quote approval | `POST /customer-links/{token}/approve` | Customer link | Token resource | Token scoped and expiring |
| Jobs | `POST /jobs` | Owner, admin, dispatcher, manager | Branch | Assignment policy applies |
| Technician jobs | `GET /technician/jobs` | Technician | Assigned jobs | Assignment required |
| Job status | `POST /jobs/{id}/status` | Technician/reviewer | Assignment or branch | Transition matrix enforced |
| Submission | `POST /jobs/{id}/submission` | Technician | Assigned job | Evidence submitted for review |
| Review | `POST /jobs/{id}/review` | Owner, admin, manager | Branch/tenant | Accept or return |
| Invoices | `POST /invoices` | Owner, admin, dispatcher | Tenant/branch | Confirmed work required |
| Payments | `POST /invoices/{id}/payments` | Owner, admin, authorized staff | Invoice scope | Idempotent and recorded |
| Reports | `GET /reports/operations` | Owner, admin, manager | Tenant/branch | Operational data only |
| Reports | `GET /reports/financial` | Owner, admin | Tenant/branch | Verified transactions only |
| Links | `GET /customer-links/{token}` | Customer link | Token resource | No enumeration |
