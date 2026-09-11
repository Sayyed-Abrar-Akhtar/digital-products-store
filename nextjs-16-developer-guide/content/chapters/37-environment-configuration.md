# Chapter 37: Environment Configuration

*Part VIII — Deployment*

---

## Learning Objectives
- Manage environment configurations across Development, Staging, and Production environments in Next.js 16.
- Configure environment variables in host cloud platforms (Vercel, AWS App Runner, Docker).
- Differentiate between build-time static inlining vs runtime dynamic environment resolution.
- Configure Cross-Origin Resource Sharing (CORS) security headers in `next.config.ts`.
- Avoid configuration drift, leaked secrets across environments, and staging domain indexing bugs.

---

## Overview & Core Explanation

Environment configuration manages how a Next.js 16 application adapts its behavior, database endpoints, authentication targets, and external API connections across deployment stages.

### The Three Standard Environments
1. **Development (`development`)**: Runs locally on developer workstations (`npm run dev`). Connects to local or development MongoDB databases; features verbose logging and hot reloading.
2. **Staging (`staging` / Preview)**: Deployed to cloud preview environments matching production architecture. Uses isolated staging databases and API keys to validate features before production release.
3. **Production (`production`)**: The live, user-facing application environment (`npm run start`). Connects to production database clusters under strict security controls.

```
                  ENVIRONMENT CONFIGURATION PIPELINE
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│       DEVELOPMENT       │         STAGING         │       PRODUCTION        │
│                         │                         │                         │
│ • Local DB (localhost)  │ • Staging DB (Atlas)    │ • Prod DB Cluster       │
│ • Dev Auth Secret       │ • Staging Auth Secret   │ • Prod High-Entropy Auth│
│ • Debug Logging         │ • Preview Deployments   │ • Immutable Standalone  │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

---

## Managing Secrets in Cloud Host Environments

Never store production passwords or API secrets in `.env.production` files committed to Git repositories.

Instead, define production environment variables inside your cloud host platform's secure secret manager (e.g. Vercel Environment Variables, AWS Secrets Manager, GitHub Actions Secrets).

```bash
# Example: Injecting environment variables during Docker runtime launch
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI="mongodb+srv://prod-user:secret@cluster.mongodb.net/acme" \
  -e AUTH_SECRET="a-very-long-production-auth-secret-key-32-chars" \
  -e NEXT_PUBLIC_APP_URL="https://acme-app.store.com" \
  acme-app:v1.0.0
```

---

## Dynamic Runtime Environment Resolution vs Build-Time Inlining

Understanding when environment variables are evaluated is critical to preventing configuration bugs:

- **Server-Only Variables (`process.env.MONGODB_URI`)**: Evaluated at **runtime** when code executes on the server. Changing these values in host settings takes effect immediately upon container restart without requiring a code rebuild.
- **Client Public Variables (`process.env.NEXT_PUBLIC_APP_URL`)**: Evaluated at **build time** during `next build`. Next.js physically replaces references to `process.env.NEXT_PUBLIC_*` with static string values in compiled client JavaScript bundles. Changing a `NEXT_PUBLIC_` variable requires re-running `next build`.

```typescript
// lib/env-public.ts
// Explicit helper demonstrating client-safe public configuration
export const publicConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://acme-app.store.com",
  environment: process.env.NODE_ENV,
};
```

---

## CORS Configuration in `next.config.ts`

When your Next.js Route Handlers accept API requests from external client domains or mobile apps, configure Cross-Origin Resource Sharing (CORS) headers in `next.config.ts`.

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const allowedOrigin =
      process.env.NODE_ENV === "production"
        ? "https://acme-app.store.com"
        : "http://localhost:3000";

    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: allowedOrigin },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## Preventing Staging Environment Indexing

Staging and preview environments (e.g. `staging.acme-app.store.com`) must **never** be indexed by search engine crawlers. If Google indexes your staging environment, it creates duplicate content penalties and exposes unreleased features.

### Enforcing No-Index on Staging

Detect the environment in root `layout.tsx` or `middleware.ts` and set HTTP `X-Robots-Tag` headers or metadata rules.

```typescript
// app/layout.tsx
import type { Metadata } from "next";

const isProduction = process.env.NEXT_PUBLIC_APP_URL === "https://acme-app.store.com";

export const metadata: Metadata = {
  robots: isProduction
    ? { index: true, follow: true }
    : { index: false, follow: false }, // Disables search indexing on Staging / Preview
};
```

---

## Environment Configuration Matrix

| Setting | Development | Staging / Preview | Production |
| :--- | :--- | :--- | :--- |
| **`NODE_ENV`** | `development` | `production` | `production` |
| **`NEXT_PUBLIC_APP_URL`** | `http://localhost:3000` | `https://staging.acme.com` | `https://acme-app.store.com` |
| **Search Engine Indexing** | Disabled | Disabled (`index: false`) | Enabled (`index: true`) |
| **Logging Level** | Verbose Debug | Info / Warning | Errors & Telemetry Only |

---

## Practical Example
In our reference application (**Acme App**), this pattern is utilized across Server Components and Server Actions to ensure consistent architecture.

```typescript
// Practical implementation snippet for Next.js 16 (Target 16.3.4)
export async function executePracticalWorkflow() {
  return { success: true, timestamp: new Date().toISOString() };
}
```

## Common Mistakes

1. **Re-using Production Database URIs in Staging**: Pointing staging test builds to production MongoDB databases. A test migration or seed script in staging wipes production data!
2. **Inlined `NEXT_PUBLIC_` Build-Time Mismatches**: Building a Docker container image with `NEXT_PUBLIC_APP_URL=http://localhost:3000` and deploying that exact compiled binary image to production.
   - *Fix*: Re-build or inject `NEXT_PUBLIC_` variables corresponding to the target environment URL during build.
3. **Committing Credentials to Git**: Accidentally committing `.env.production` files containing live payment or database credentials to source control.

---

## Production Considerations

- **Secret Rotation Playbooks**: Document step-by-step procedures for rotating database credentials and authentication keys without causing application downtime.
- **Environment Drift Detection**: Audit staging and production environment settings regularly to ensure secret keys and configuration flags remain in sync.
- **Automated Validation**: Run `lib/env.ts` Zod validation as part of initial server boot to catch misconfigured environment variables before traffic hits the application.

---

## Summary

Environment configuration manages application behavior across development, staging, and production stages. By securing secret management in host secret stores, validating environment variables with Zod, enforcing CORS boundaries, and blocking search crawlers on staging domains, you maintain safe deployment pipelines.

---

## Checklist
- [ ] Isolated production databases and API credentials from staging environments.
- [ ] Stored production secrets in secure host cloud secret stores (never in Git).
- [ ] Configured explicit CORS headers for API Route Handlers in `next.config.ts`.
- [ ] Enforced `robots: { index: false }` on staging and preview deployments.
- [ ] Verified `lib/env.ts` validation succeeds on server startup across all environments.
