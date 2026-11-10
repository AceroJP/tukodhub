# Decision 0013: MVP Customer Access

**Date:** 2026-11-10  
**Phase:** Phase 0 - Product Discovery  
**Status:** Founder decision; pending security and workflow validation

## Decision

Customers will not be required to create TukodHub accounts during the MVP.
Businesses will primarily communicate with customers through Messenger, SMS,
and phone calls.

When appropriate, businesses may issue secure, time-limited links that allow a
customer to:

- View and approve a quotation.
- Review appointment details.
- Check basic job status.
- View invoices and payment instructions.
- Access a service completion summary.

## Access boundary

Links must use unguessable tokens, expire when appropriate, and expose only the
specific customer's authorized information. Customers must not be able to
access other customer records or the business administration dashboard.

## Deferred scope

Full customer accounts and a self-service portal are deferred until the core
business workflow has been validated.
