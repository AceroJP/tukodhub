# Frontend Structure

**Status:** Draft for founder approval

## Recommended structure

```text
src/frontend/
  app/
    (public)/
    (auth)/
    (business)/
    (technician)/
    customer-link/
  components/
    layout/
    forms/
    data-display/
    feedback/
    media/
  features/
    auth/
    inquiries/
    customers/
    bookings/
    quotations/
    jobs/
    billing/
    reports/
  lib/
    api/
    auth/
    formatting/
    validation/
    permissions/
  styles/
```

## Frontend responsibilities

- Render approved UI flows and responsive layouts.
- Provide client-side validation for usability only.
- Call the REST API through typed service contracts.
- Display server authorization and validation failures clearly.
- Never decide tenant authorization based only on route or hidden fields.
- Never embed secrets or privileged credentials.

## Surface rules

- Business screens prioritize queues, follow-ups, schedules, and review actions.
- Technician screens prioritize assigned work and evidence capture.
- Customer-link screens expose only the server-authorized resource.
- Platform screens avoid implicit tenant-record access.

## State and error handling

- Server state must have explicit loading, success, empty, error, and retry
  states.
- Mutations must prevent accidental duplicate submission.
- Uploads must show progress and confirmed completion.
- Navigation must preserve unsaved form data where safe.
