# UI Design System

**Status:** Draft for founder approval

## Design direction

Professional, calm, practical, and mobile-first. The interface should feel
like an operational tool rather than an accounting system or social network.

## Color roles

Use semantic roles rather than hard-coding colors per screen:

- Primary: trusted action and navigation emphasis.
- Neutral: page background, surfaces, borders, and text.
- Success: confirmed work and fully paid.
- Warning: follow-up due, pending review, or partially paid.
- Danger: validation failure, cancellation, or rejected action.
- Informational: assigned, scheduled, or explanatory status.

Color must not be the only indication of status; pair it with text and icons.

## Typography and spacing

- Use a highly readable sans-serif font.
- Establish a consistent 4/8 spacing scale.
- Use clear page titles, section headings, labels, and helper text.
- Avoid dense tables on small screens; use stacked cards where needed.

## Component inventory

- App shell and responsive navigation.
- Buttons with primary, secondary, destructive, and quiet variants.
- Text, phone, date, time, currency, and multiline inputs.
- Searchable customer and technician selectors.
- Service and status selectors.
- Cards, tables, lists, and mobile job cards.
- Status badges with text labels.
- Dialogs for confirmation and correction requests.
- Toast or inline feedback for successful operations.
- Empty states with a clear next action.
- Loading, error, and retry states.
- Photo upload and preview.
- Pagination and filters.
- Timeline for inquiry, booking, job, invoice, and payment history.

## Form behavior

- Preserve entered data after recoverable validation errors.
- Identify required fields before submission.
- Prevent duplicate submission while saving.
- Explain destructive or irreversible actions.
- Use localized Philippine peso formatting where money is displayed.

## Accessibility

- Keyboard-accessible controls where applicable.
- Visible focus states.
- Labels associated with inputs.
- Adequate touch targets on mobile.
- Sufficient text/background contrast.
- Status communicated through text, not color alone.
