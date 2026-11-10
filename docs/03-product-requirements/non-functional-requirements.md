# Non-Functional Requirements

**Status:** Draft for founder approval

- NFR-001 Security: Tenant and branch isolation must be enforced server-side;
  frontend filtering is insufficient.
- NFR-002 Privacy: Customer data and payment proof must be exposed only to
  authorized users or specifically authorized customer links.
- NFR-003 Authentication: Passwords must use established secure hashing and
  session handling; secrets must not be exposed in frontend code.
- NFR-004 Authorization: Every sensitive operation must verify role, tenant,
  branch, and assignment scope.
- NFR-005 Auditability: Sensitive access, approval, status changes, payment
  records, and exceptional support access must be traceable.
- NFR-006 Usability: Core inquiry creation should require minimal steps and
  clear validation.
- NFR-007 Mobile usability: Technician workflows must be usable on ordinary
  Android smartphones.
- NFR-008 Reliability: Core inquiry, booking, job, and payment records must
  not be silently lost or overwritten.
- NFR-009 Financial integrity: Monetary values must use appropriate decimal
  precision and transactional updates.
- NFR-010 Performance: Normal staff screens and technician job updates should
  respond promptly under the expected small-business workload.
- NFR-011 File safety: Uploaded photos and payment proof must be validated,
  access-controlled, tenant-aware, and protected from unsafe file handling.
- NFR-012 Availability: The MVP assumes reliable online operation; offline
  synchronization is not required.
- NFR-013 Maintainability: The implementation must follow the approved
  modular-monolith architecture and preserve clear module boundaries.
- NFR-014 Localization: Currency and payment-recording flows must support
  Philippine pesos and local payment methods.
- NFR-015 Accessibility: Forms, status indicators, navigation, and mobile
  controls should be understandable and usable with accessible interaction
  patterns.
