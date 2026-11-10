# Business Rules

**Status:** Draft for founder approval

- BR-001: A tenant may access only its own tenant-owned records.
- BR-002: Branch-scoped users may access only permitted branch records.
- BR-003: A technician may update only assigned jobs within authorized scope.
- BR-004: Inquiry, booking, quotation, job, invoice, and payment statuses are
  separate concepts.
- BR-005: Status changes must follow defined transitions and be recorded in
  history.
- BR-006: An approved quotation must remain historically accurate; changes
  require a revision or a new quotation.
- BR-007: A job cannot be confirmed complete until an authorized reviewer
  accepts the technician submission.
- BR-008: A technician cannot finalize invoices, record payments, or close
  jobs permanently.
- BR-009: An invoice is fully paid only when recorded payments meet or exceed
  its outstanding balance according to approved business rules.
- BR-010: Payment records must identify method as cash, GCash, or bank transfer
  for the MVP.
- BR-011: Customer links must be scoped to a specific permitted resource and
  expire according to a defined policy.
- BR-012: Customer links must never expose administration functions or other
  customer records.
- BR-013: Financial reports must be derived from verified invoices and payment
  records, not user-entered summary figures.
- BR-014: The public booking page must not block reliable staff-entered inquiry
  capture.
