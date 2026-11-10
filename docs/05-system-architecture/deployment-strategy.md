# Deployment Strategy

**Status:** Draft for founder approval

## Environments

- Development: isolated local resources and disposable test data.
- Staging: production-like configuration with synthetic or approved test data.
- Production: restricted credentials, backups, monitoring, and controlled
  releases.

## Deployment shape

- Deploy the Next.js frontend separately from the ASP.NET Core API.
- Run PostgreSQL as a managed or securely operated service.
- Use a private network path where available between API and database.
- Use HTTPS for every public connection.
- Store secrets in an environment-specific secret manager.
- Keep file storage separate from application local disk.

## Release controls

- Build and test changes before deployment.
- Apply database migrations through a reviewed release process.
- Back up production data before schema changes.
- Never reset or delete production databases to resolve migration problems.
- Use health checks and a rollback plan.
- Verify authentication, tenant isolation, core workflows, and payment
  calculations after deployment.

## Deferred infrastructure choices

The exact cloud provider, object-storage provider, email provider, monitoring
provider, and background-job technology require a later implementation-plan
decision. Selecting them now would be premature configuration, not architecture
approval.
