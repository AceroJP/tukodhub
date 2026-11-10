# Decision 0010: MVP Payment Scope

**Date:** 2026-11-10  
**Phase:** Phase 0 - Product Discovery  
**Status:** Founder decision; pending workflow validation

## Decision

The MVP will record payments received through cash, GCash, and bank transfer.
It will not process online payments through an integrated gateway.

## Required payment records

Authorized users should be able to record:

- Amount paid.
- Payment method.
- Payment date.
- Transaction reference when applicable.
- Payment proof or receipts when necessary.

The system should track unpaid, partially paid, and fully paid invoices and
provide payment history for each customer and job order.

## Rationale and boundary

Accurate payment records are a higher initial priority than payment collection.
Gateway integration, including its fees, reconciliation, and compliance
requirements, is deferred until the core business-management features are
stable and validated.
