# Wireframes

**Status:** Draft for founder approval  
**Format:** Structural wireframes; visual styling is defined separately

## Business overview

```text
+--------------------------------------------------------------+
| TukodHub | Business name                 [Search] [Profile]  |
+----------------------+---------------------------------------+
| Overview             | Today                                |
| Inquiries            | [New inquiries] [Follow-ups due]    |
| Customers            | [Today's bookings] [Jobs in review] |
| Calendar             |                                       |
| Quotations           | Inquiry follow-up queue              |
| Job orders           | [Customer] [Service] [Due] [Action] |
| Technicians          |                                       |
| Invoices             | Today's schedule                     |
| Payments             | [Time] [Customer] [Tech] [Status]   |
| Reports              |                                       |
| Settings             | [ + Record inquiry ]                 |
+----------------------+---------------------------------------+
```

## Record inquiry

```text
Record inquiry

Source: [Messenger v]  Customer: [Search or create]
Service: [AC cleaning v]  Preferred date: [Date] [Time]
Phone: [                 ]  Address: [                       ]
AC details: [                                              ]
Notes: [                                                    ]

[Save inquiry] [Save and schedule follow-up] [Cancel]
```

Required fields should be visually clear. Optional details should not block
fast inquiry capture.

## Job detail for office

```text
Job # | Customer | Service | Date | Technician | Job status

[Timeline: inquiry -> quoted -> scheduled -> assigned -> in progress
            -> work completed -> office review -> confirmed]

Customer and location | Work instructions | Photos
Materials and findings | Technician submission

[Request correction] [Confirm completion] [Create invoice]
```

## Technician mobile job

```text
+------------------------------+
| < My jobs             Profile |
| Today: AC cleaning           |
| Customer and address         |
| [Open map] [Call customer]   |
| Instructions                 |
| Status: Assigned             |
| [Start work]                 |
|                              |
| Work notes                   |
| [                         ]  |
| Photos [Before] [After]     |
| Materials used               |
| Additional findings         |
| [Submit work completed]      |
+------------------------------+
```

The primary action must remain visible without requiring complex navigation.

## Customer secure link

```text
Business logo and name
Hello, customer

Quotation / appointment / invoice / completion summary
Relevant details only

[Approve quotation] or [Acknowledge]
Contact business through existing channel
This link expires on: [date/time]
```

## Visual interaction rules

- Use one primary action per screen.
- Keep status and next action visible.
- Use confirmation dialogs for irreversible actions.
- Show validation beside the affected field.
- Use plain language suitable for non-technical staff.
