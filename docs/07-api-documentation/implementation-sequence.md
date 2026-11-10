# Module Implementation Sequence

**Status:** Draft for founder approval

Each stage must meet its tests and acceptance criteria before the next
dependent stage begins.

1. Development environment and repository structure.
2. Backend foundation, API conventions, and health checks.
3. Database connection, persistence conventions, and initial migrations.
4. Authentication and secure session handling.
5. Tenant registration, business profile, and tenant context.
6. Tenant isolation, RLS, and authorization test foundation.
7. Branches, memberships, roles, and permissions.
8. Customers and service addresses.
9. Service catalog.
10. Staff-entered inquiries and follow-up queue.
11. Bookings, availability, and conflict detection.
12. Quotations, revisions, and customer approval.
13. Job orders, assignments, and status history.
14. Technician mobile workflow and completion submissions.
15. Attachments and photo evidence.
16. Office completion review.
17. Invoices and financial calculations.
18. Payment recording and balances.
19. Operational and financial reports.
20. Secure customer links.
21. In-app notifications and approved transactional email.
22. Public booking page only after the core staff workflow is validated.

## Stop conditions

Do not continue when:

- Critical authorization or tenant-isolation tests fail.
- Financial totals or balance calculations fail.
- A migration cannot be safely applied and reviewed.
- A core workflow silently loses data.
- The mobile technician workflow is unusable on the target device class.
