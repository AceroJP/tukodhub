# Product Requirements Document

**Product:** TukodHub  
**Phase:** Phase 2 - Product Requirements Document  
**Status:** Draft for founder approval  
**Date:** 2026-11-10

## 1. Product summary

TukodHub is a multi-tenant SaaS operations workspace for small, independent
air-conditioning service businesses in Malaybalay City and nearby Bukidnon.
The first workflow focuses on capturing AC-cleaning inquiries received through
existing channels, coordinating bookings and technicians, documenting work,
and recording invoices and payments.

The product should reduce forgotten inquiries and scheduling confusion without
requiring businesses or customers to abandon Messenger, phone calls, SMS, or
walk-ins.

## 2. Product goal

Help a participating business reduce missed or forgotten inquiries by at least
50% during a 30-day pilot compared with its baseline. This is a success
hypothesis requiring measurement, not a guaranteed product result.

## 3. Target users

### Business owner

Owns the tenant, manages settings and staff, reviews operations, confirms
completed work, and oversees invoices and payment records.

### Dispatcher or business administrator

Records inquiries, maintains customer information, schedules work, assigns
technicians, monitors progress, and prepares quotations or invoices.

### Technician

Uses an ordinary Android phone to view assigned jobs, update progress, add
notes, upload service photos, record materials, and report additional work.

### Customer

Does not need a TukodHub account in the MVP. The customer communicates through
existing channels and may receive a secure, time-limited link for a specific
quotation, appointment, job status, invoice, or completion summary.

### Platform administrator

Manages tenants, plans, subscriptions, platform settings, and support access.
Tenant data access must be explicitly authorized and audited.

## 4. MVP user journey

1. Staff receives an inquiry through Messenger, phone, SMS, or walk-in.
2. Staff creates or finds the customer record.
3. Staff records the service request, address, AC details, preferred date, and
   notes.
4. Staff either uses a standard cleaning price or prepares a quotation when
   the request requires assessment.
5. Customer approval is recorded.
6. Staff confirms a booking and creates a job order.
7. Staff assigns a technician and schedule.
8. Technician updates the job from a mobile interface.
9. Technician submits work notes, photos, materials, and additional findings.
10. Owner or dispatcher reviews and confirms completion.
11. Authorized staff creates an invoice and records cash, GCash, or bank
    transfer payments.
12. The system shows unpaid, partially paid, or fully paid status and retains
    the service history.

## 5. Product principles

- Staff-entry-first; do not require customers to change communication channels.
- AC-cleaning-first; avoid generic complexity in the first workflow.
- Mobile-friendly for ordinary Android smartphones.
- Server-side authorization and strict tenant isolation.
- Payment recording before payment processing.
- Clear status transitions and reliable business records.
- Simple onboarding and minimal data-entry steps.

## 6. Open validation items

- Exact AC-cleaning price variation factors.
- Actual inquiry volume and missed-inquiry baseline.
- Customer willingness to pay ₱499/month.
- Whether businesses will use a public booking page.
- Connectivity conditions and photo-upload reliability in the target area.
- Retention and deletion expectations for customer and payment proof data.
