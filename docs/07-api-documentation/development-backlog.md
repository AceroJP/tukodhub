# Development Backlog

**Status:** Draft for founder approval  
**Planning unit:** Vertical slices that can be implemented and tested

## Foundation

- BL-001: Create frontend and backend solution structure.
- BL-002: Configure environments and secret handling.
- BL-003: Establish API error, validation, logging, and correlation conventions.
- BL-004: Establish PostgreSQL connection and EF Core persistence foundation.
- BL-005: Establish migration and seed-data conventions.

## Identity and tenancy

- BL-010: Implement registration, login, logout, and session management.
- BL-011: Implement tenant and business-profile creation.
- BL-012: Implement memberships, roles, permissions, and invitations.
- BL-013: Implement branch scope resolution.
- BL-014: Implement tenant isolation and RLS verification tests.

## Core operations

- BL-020: Implement customers and addresses.
- BL-021: Implement service categories and service catalog.
- BL-022: Implement staff-entered inquiries.
- BL-023: Implement follow-up queue and activity.
- BL-024: Implement bookings and availability conflict detection.
- BL-025: Implement quotation revisions and approval.
- BL-026: Implement job orders, assignments, and status history.

## Technician and evidence

- BL-030: Implement technician job list and mobile job detail.
- BL-031: Implement status updates and completion submission.
- BL-032: Implement tenant-aware photo and attachment upload.
- BL-033: Implement office review and correction workflow.

## Billing and reporting

- BL-040: Implement invoice creation and line calculations.
- BL-041: Implement payment recording with idempotency.
- BL-042: Implement balance and payment-status calculation.
- BL-043: Implement basic operational reports.
- BL-044: Implement basic financial reports from verified transactions.

## Customer access and notifications

- BL-050: Implement scoped expiring customer links.
- BL-051: Implement quotation approval through customer links.
- BL-052: Implement in-app notification records and delivery.
- BL-053: Implement transactional email adapter after provider approval.

## Hardening

- BL-060: Complete authorization and tenant-isolation test matrix.
- BL-061: Complete file-upload security tests.
- BL-062: Complete financial calculation and concurrency tests.
- BL-063: Complete responsive workflow verification.
- BL-064: Prepare staging deployment and recovery verification.
