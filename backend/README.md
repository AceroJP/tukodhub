# TukodHub backend

The backend is an ASP.NET Core modular monolith targeting .NET 10.

## Run locally

From the repository root:

```powershell
dotnet run --project backend\src\TukodHub.Api
```

The initial health endpoint is available at:

```text
GET /api/v1/health
```

## Database configuration

The API uses Entity Framework Core with the PostgreSQL provider, which is
compatible with Supabase PostgreSQL. For local development, store the
connection string with .NET User Secrets:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "PASTE_YOUR_SUPABASE_CONNECTION_STRING_HERE" --project backend\src\TukodHub.Api
```

Replace only the placeholder with the connection string from Supabase. User
Secrets are stored outside the repository and are not committed to Git. In
deployment, use the `ConnectionStrings__DefaultConnection` environment
variable instead.

The local frontend origin is configured as `http://localhost:3000`. Set
`FrontendUrl` through deployment configuration when the frontend is hosted
elsewhere.

## Host model

The platform owner uses the configured `PlatformHost`, while tenant workspaces
use a subdomain of `TenantBaseDomain`:

```text
app.tukodhub.com       platform owner
aceroaircon.tukodhub.com  tenant workspace
```

For local development, tenant hosts use the `.localhost` pattern:

```text
localhost:3001             platform pages
aceroaircon.localhost:3001 tenant pages
```

Host resolution identifies the requested scope only. Authentication,
membership, and tenant authorization must still succeed before tenant data is
read or changed.

## SaaS owner authentication

The platform owner signs in through Supabase Auth at `/owner/login`. Configure
the Supabase project URL and the owner Auth user ID in User Secrets:

```powershell
dotnet user-secrets set "SupabaseUrl" "https://your-project.supabase.co" --project backend\src\TukodHub.Api
dotnet user-secrets set "PlatformOwnerUserId" "SUPABASE_AUTH_USER_ID" --project backend\src\TukodHub.Api
```

Only the configured Auth user ID can access `/api/v1/platform/*`. Tenant
accounts continue using the separate tenant registration and membership flow.

The initial migration contains only the approved identity and tenant
foundation. Operational domain tables will be added in later migrations after
their models are reviewed.

The initial identity migration is now available. Apply it only after setting a
valid Supabase connection string:

```powershell
dotnet ef database update --project backend\src\TukodHub.Api\TukodHub.Api.csproj
```

If the identity migration was applied through Supabase SQL Editor, apply
authentication fields there as well:

```text
backend\src\TukodHub.Api\Data\Migrations\AddAuthenticationFields.supabase.sql
```
