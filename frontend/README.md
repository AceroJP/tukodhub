This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API configuration

Copy `.env.example` to `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Tenant-authenticated API routes are host-scoped. The frontend client supports
host-aware backend routing by allowing a `{host}` placeholder in
`NEXT_PUBLIC_API_BASE_URL`.

Recommended local configuration:

```text
NEXT_PUBLIC_API_BASE_URL=http://{host}:5000
NEXT_PUBLIC_API_PORT=5000
```

Examples:

- Browser host `localhost:3000` -> API `http://localhost:5000`
- Browser host `aceroaircon.localhost:3000` -> API `http://aceroaircon.localhost:5000`

This keeps tenant host resolution aligned with backend authorization checks.
Do not put database credentials or other server secrets in `NEXT_PUBLIC_*`
variables.

The project uses Webpack for local development and production builds because
Turbopack native bindings are unavailable in the current Windows environment.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

