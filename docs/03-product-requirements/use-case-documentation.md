# Use Case Documentation

**Status:** Draft for founder approval

## UC-01: Record an inquiry

**Actor:** Owner, dispatcher, or administrator  
**Trigger:** A customer contacts the business through an existing channel.

1. User searches for an existing customer or creates one.
2. User records the source channel.
3. User selects the requested service.
4. User records address, AC details, preferred date, and notes.
5. System creates the inquiry in an initial status and records its creator.
6. User schedules a follow-up or proceeds to assessment.

**Exceptions:** Required information is missing; a duplicate customer requires
confirmation; the requested date conflicts with availability.

## UC-02: Approve and schedule work

**Actor:** Owner, dispatcher, or administrator  
**Trigger:** The customer accepts the proposed price and schedule.

1. User records customer approval.
2. User confirms the appointment.
3. User creates or updates the job order.
4. User assigns a branch and technician.
5. System records the schedule and assignment.

## UC-03: Perform and submit a job

**Actor:** Technician  
**Trigger:** Technician receives an assignment.

1. Technician views the job and instructions.
2. Technician starts the job and sets In Progress.
3. Technician records notes, photos, materials, and additional findings.
4. Technician sets Work Completed and submits the report.
5. System records the submission and notifies the authorized reviewer.

## UC-04: Review completion

**Actor:** Owner or dispatcher  
**Trigger:** Technician submits completion details.

1. Reviewer checks status, notes, photos, materials, and findings.
2. Reviewer requests correction or confirms completion.
3. Confirmed work becomes eligible for invoicing.

## UC-05: Record payment

**Actor:** Owner or authorized staff  
**Trigger:** Customer pays through cash, GCash, or bank transfer.

1. User selects the invoice and enters amount, date, method, and reference.
2. User attaches proof when required.
3. System calculates the remaining balance.
4. System sets unpaid, partially paid, or fully paid status.

## UC-06: Share customer information

**Actor:** Authorized business user  
**Trigger:** Customer needs a quotation, appointment, invoice, or completion
summary.

1. User requests a secure link for a specific permitted resource.
2. System creates an unguessable, expiring token.
3. Customer views only the authorized information.
4. System records link creation and relevant access activity.
