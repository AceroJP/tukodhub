# User Flow Diagrams

**Status:** Draft for founder approval

## Staff inquiry to paid job

```text
Incoming Messenger/phone/SMS/walk-in request
  -> Find or create customer
  -> Record inquiry and service details
  -> Follow-up required?
       Yes -> Follow-up queue -> Contact customer -> Continue
       No  -> Continue
  -> Standard price or quotation?
       Standard -> Confirm price
       Quote    -> Create quote -> Send via existing channel or secure link
                    -> Customer approval?
                         No -> Rejected/expired -> Follow-up or close
                         Yes -> Continue
  -> Confirm date and availability
  -> Create booking and job order
  -> Assign technician
  -> Technician completes mobile updates
  -> Office reviews submission
       Correction needed -> Return to technician
       Accepted          -> Confirm completion
  -> Create invoice
  -> Record payment
  -> Unpaid / Partially paid / Fully paid
```

## Technician job flow

```text
My jobs -> Job detail -> Review instructions
  -> Assigned
  -> Start work -> In Progress
  -> Add notes/photos/materials/findings
  -> Submit Work Completed
  -> Await office review
       Returned -> Correct details -> Resubmit
       Accepted -> Job completion confirmed
```

## Customer secure-link flow

```text
Authorized staff creates link
  -> System generates unguessable expiring token
  -> Business shares link through existing channel
  -> Customer opens link
  -> View only the permitted resource
  -> Approve quotation if applicable
  -> Link expires or is revoked
```

## Navigation rule

Every workflow should preserve context and avoid forcing staff to re-enter
customer, service, or job information when moving between records.
