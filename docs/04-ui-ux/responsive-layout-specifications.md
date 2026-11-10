# Responsive Layout Specifications

**Status:** Draft for founder approval

## Breakpoint behavior

### Mobile: approximately 320-767px

- Technician experience is the priority.
- Use a single-column layout.
- Use bottom navigation or a compact menu for primary technician areas.
- Keep primary actions near the thumb zone.
- Convert tables into cards or horizontally scrollable, labeled sections.
- Use native-feeling date, time, phone, and photo controls.
- Avoid requiring side-by-side comparison.

### Tablet: approximately 768-1023px

- Use a collapsible business navigation rail.
- Use two-column dashboard cards where space allows.
- Keep forms single-column unless fields are closely related.
- Maintain mobile-sized touch targets.

### Desktop: 1024px and above

- Use persistent business navigation.
- Use two-column forms for related fields.
- Use tables for operational queues with filters and pagination.
- Keep detail panels readable rather than filling the full width.

## Responsive rules by surface

- Inquiry capture: one-column first; group contact and appointment details.
- Calendar: agenda/list view on mobile; calendar grid on larger screens.
- Job detail: summary and next action first; evidence sections follow.
- Technician photos: capture and upload with clear progress and retry states.
- Payments: show balance and payment status before transaction history.
- Customer links: readable on mobile and limited to the requested resource.

## Connectivity and failure behavior

The MVP assumes online operation. Every save and upload must show progress,
success, failure, and retry states. The interface must not imply that a job,
payment, or photo was saved when the server has not confirmed it.

## Content and localization

- Use Philippine peso formatting.
- Use plain English initially; design labels so future localization is
  possible.
- Avoid overly technical terms such as "entity" or "tenant" in customer-facing
  screens.
- Make address and phone fields suitable for local business usage.
