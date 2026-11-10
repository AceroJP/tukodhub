# Initial Market Hypothesis

**Phase:** Phase 0 - Product Discovery  
**Status:** Hypothesis requiring validation through customer interviews  
**Last updated:** 2026-11-10

## Initial customer segment

TukodHub will initially focus on small, independent air-conditioning installation
and repair businesses in Malaybalay City and nearby areas in Bukidnon,
Philippines.

The initial target customer profile is:

- Owner-operated AC service businesses.
- Businesses with approximately 1-10 technicians.
- Teams that currently manage bookings, customer records, quotations, and job
  schedules manually or through Facebook Messenger, phone calls, spreadsheets,
  or notebooks.
- Businesses that want to organize daily operations without investing in
  expensive enterprise software.

## Initial service scope

The businesses may provide:

- Air-conditioning installation.
- Air-conditioning cleaning.
- Preventive maintenance.
- Troubleshooting.
- Repair services.

## Expansion boundary

CCTV installation and other home or commercial service businesses are possible
future segments, but they are outside the initial target segment.

## Validation status

This is the founder's initial market hypothesis. It must be validated through
interviews with actual business owners before the product scope and MVP are
finalized.

## Primary problem hypothesis

Small AC service businesses may struggle to manage customer requests, bookings,
and technician schedules in one organized system. Requests can arrive through
Facebook Messenger, phone calls, and text messages, while customer details and
appointments may be tracked in notebooks or spreadsheets.

Potential consequences include:

- Missed or forgotten customer inquiries.
- Double bookings and scheduling conflicts.
- Delayed customer responses.
- Difficulty tracking pending and completed jobs.
- Lost follow-ups and potential sales.
- Time wasted coordinating technicians and appointments.

These consequences are expected to affect customer retention, productivity, and
revenue, but their frequency and financial impact have not yet been measured.
They must be validated through interviews and observation with actual AC
business owners.

## Provisional current-state workflow

The founder's proposed example workflow is:

1. A customer contacts the business through Facebook Messenger, phone, or text.
2. The owner or receptionist collects contact, address, AC-unit, and schedule
   information.
3. The owner or dispatcher checks technician availability and requests further
   details or photos when necessary.
4. The business prepares and communicates an estimated quotation.
5. The customer approves the price and schedule.
6. The owner or dispatcher assigns an available technician or team.
7. The technician performs the work and records the service and any additional
   materials or repairs.
8. The technician reports completion and shares proof with the business and
   customer.
9. The customer pays through cash, GCash, or bank transfer.
10. The business records the payment, marks the job accordingly, and retains the
    customer information for future service.

The expected participants are the customer, business owner or dispatcher,
technician, and optional receptionist or administrator. Expected current tools
include Messenger, phone calls, SMS, notebooks, spreadsheets, GCash, and bank
transfers.

This workflow is a discovery hypothesis and must be compared with actual
business practices before it is treated as a product requirement.

## Initial validation plan

There are currently no confirmed customer relationships or interviewees. The
founder expects to identify and contact approximately 5-10 small AC
installation and repair businesses in Malaybalay City and nearby areas through
personal referrals, Facebook business pages and local groups, direct outreach,
and visits to local providers.

The initial target is at least five customer discovery interviews within the
next 2-3 weeks, subject to owner availability and the founder's academic
schedule. These are outreach targets, not confirmed contacts or completed
interviews.

## Value outcome hypothesis

The proposed paid outcome is an increase in successfully completed and paid
service jobs by reducing missed inquiries, delayed follow-ups, and poorly
managed bookings.

An initial measurable hypothesis is that a business receiving about 40
inquiries per month could recover 3-5 additional paid jobs per month through
better inquiry tracking, booking management, and follow-up. The value would
depend on the revenue and profit from those jobs exceeding the subscription
cost.

This is not a guaranteed result. The number of recoverable jobs, the revenue
per job, and the relationship to TukodHub usage require validation through
customer interviews and pilot testing.

## Initial pricing hypothesis

The proposed introductory price is **₱499 per business per month**, with no
per-job charge. The plan would include up to four users, one branch, customer
management and service history, inquiry and booking management, quotations,
job orders, technician assignment, job status tracking, basic invoicing and
payment recording, and basic dashboard reports.

Additional branches and users, advanced inventory, SMS notifications, and
advanced reporting may be reserved for later plans.

This price and packaging are hypotheses. Interviews and pilot testing must
validate affordability, willingness to pay, perceived value, and the cost of
supporting each customer.

## MVP inquiry-entry hypothesis

The MVP is expected to support both:

- Staff recording inquiries received through existing channels such as
  Messenger, phone, and SMS.
- Customers submitting requests through a public booking page.

The launch priority between these two entry paths remains unresolved. It should
be validated against actual customer behavior and the effort required for
businesses to adopt a public booking page.

The launch-critical path is now defined as staff-entered inquiries. Business
owners or staff must be able to record requests received through Messenger,
phone calls, SMS, or walk-ins; create or find customer records; select the
requested service; capture contact and address details; set a preferred date;
track inquiry status; and convert an approved inquiry into a booking and job
order. The public booking page is secondary and must not delay the initial MVP.

## Technician operating model

Technicians are expected to update assigned jobs directly from ordinary
Android smartphones through a simple mobile interface. They should be able to
view assignments and schedules, set job status to Assigned, In Progress, or
Work Completed, add work notes, upload before-and-after photos, record
materials or parts used, and report additional problems or recommended repairs.

The owner or dispatcher should monitor progress, review submitted details and
photos, request corrections, verify the work, confirm completion, and proceed
with invoicing and payment recording. Technicians must not finalize invoices,
record business payments, or permanently close jobs without authorization.

The MVP should prioritize reliable online updates. Offline synchronization is
deferred for a later phase.

## MVP payment scope

TukodHub will initially record and monitor payments received through cash,
GCash, and bank transfer rather than process payments online. Authorized users
should be able to record the amount, method, date, transaction reference when
applicable, and payment proof or receipts when necessary.

The system should track unpaid, partially paid, and fully paid invoices and
show payment history for each customer and job order. Online payment gateway
integration is deferred until the core business-management features are stable
and validated.

## Primary adoption-risk hypothesis

The largest expected adoption risk is learning effort and resistance to
changing established routines. Owners and staff may reject or abandon the
product if encoding inquiries, updating job status, and maintaining records
feels more time-consuming or complicated than using Messenger, phone calls, SMS,
notebooks, or spreadsheets.

The MVP should therefore emphasize simple navigation, minimal steps for
inquiries and bookings, mobile-friendly technician screens, easy record
management, short onboarding, and practical user guidance. This risk must be
tested through interviews and pilot usage.

## Initial pilot success hypothesis

The primary 30-day pilot criterion is a reduction of at least 50% in missed or
forgotten customer inquiries compared with the participating business's
pre-pilot baseline.

To measure this, the business should establish its baseline, record every
incoming inquiry during the pilot regardless of channel, track inquiry status
and follow-up activity, and compare the results at the end of 30 days. For
example, a baseline of 10 missed inquiries out of 40 per month would need to
fall to 5 or fewer.

The 50% target is an initial success hypothesis, not a guaranteed result.

## MVP customer access

Customers will not need full TukodHub accounts during the initial MVP. The
business will primarily communicate through Messenger, SMS, and phone calls.
When appropriate, the business may provide secure, time-limited links for
customers to view or approve quotations, review appointment details, check
basic job status, view invoices and payment instructions, and access service
completion summaries.

Links must be unguessable, expire when appropriate, and expose only the
specific customer's authorized information. Full customer accounts and a
self-service portal are deferred until the core workflow is validated.

## First service-type priority

The MVP should optimize first for AC cleaning. Preventive maintenance,
repair/troubleshooting, and installation remain intended service types but may
require separate validation because their pricing, duration, materials, skills,
and completion evidence can differ.

## AC cleaning pricing-flow hypothesis

The pricing flow for AC cleaning depends on the request. The MVP may need to
support both a standard-price path for straightforward services and an
assessment or quotation path when the price depends on unit, location, or
service conditions. The factors that determine the path remain to be
validated.
