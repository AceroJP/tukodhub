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
