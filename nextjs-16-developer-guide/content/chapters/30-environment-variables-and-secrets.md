# Chapter 30: Environment Variables and Secrets

*Part VI — Security*

---

## Learning Objectives
- Master environment variable handling in Next.js 16 across server and client execution runtimes.
- Understand the strict security rules governing the `NEXT_PUBLIC_` prefix.
- Implement type-safe environment variable validation using Zod during server startup (`lib/env.ts`).
- Differentiate between build-time static environment variable embedding vs runtime dynamic variable resolution.
- Eliminate secret leakage risks in public repositories and client JavaScript bundles.

---

## Overview & Core Explanation

Environment variables store application configuration settings—such as database connection URIs, API keys, encryption secrets, and feature flags—outside of source code repositories.

In Next.js 16, environment variables are partitioned into two distinct visibility domains:

1. **Private Server-Only Variables (Default)**: Any environment variable defined **without** a `NEXT_PUBLIC_` prefix (e.g., `MONGODB_URI`, `AUTH_SECRET`, `STRIPE_SECRET_KEY`). These variables are accessible **exclusively** within the Server Runtime (Node.js/Edge). They are omitted from client bundles.
2. **Public Client-Exposed Variables (`NEXT_PUBLIC_`)**: Environment variables explicitly prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_ANALYTICS_ID`). At build time, Next.js inline-replaces references to `process.env.NEXT_PUBLIC_*` directly into the compiled JavaScript bundle sent to the browser.

```
                      Environment Variables (.env.local)
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           │                                                     │
Private Variables (NO Prefix)                        Public Variables (NEXT_PUBLIC_*)
e.g. MONGODB_URI, AUTH_SECRET                        e.g. NEXT_PUBLIC_APP_URL
           │                                                     │
           ▼                                                     ▼
SERVER RUNTIME ONLY (Node.js)                         INLINED INTO CLIENT JS BUNDLE
Never shipped to browser bundle                       Publicly visible to anyone inspecting JS
```

---

## The Golden Rule of Secret Management
> **NEVER prefix a database password, private API key, or authentication secret with `NEXT_PUBLIC_`.**

If you prefix a secret with `NEXT_PUBLIC_`, Next.js will inline the raw secret key directly into client JavaScript bundles, exposing your backend infrastructure to public exploitation.

---

## Type-Safe Environment Validation with Zod (`lib/env.ts`)

A common production issue occurs when an application starts up with missing environment variables (such as an un-configured `MONGODB_URI`). Without validation, the application crashes silently during runtime when a user performs a database action.

Create a centralized `lib/env.ts` module that validates environment variables using Zod during server initialization.

```typescript
// lib/env.ts
import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  // Server-only private secrets
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().url({ message: "MONGODB_URI must be a valid MongoDB connection string." }),
  AUTH_SECRET: z.string().min(32, { message: "AUTH_SECRET must be at least 32 characters long." }),

  // Public client-exposed variables
  NEXT_PUBLIC_APP_URL: z.string().url().default("https://acme-app.store.com"),
});

/**
 * Validates environment variables against schema
 * Halts server execution immediately if validation fails
 */
function parseEnv() {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid or missing Environment Variables:");
    console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
    throw new Error("Environment variable validation failed. Server execution halted.");
  }

  return result.data;
}

export const env = parseEnv();
```

Importing `env` from `@/lib/env` in your Data Access Layer provides type-safe, validated environment configuration throughout your server codebase:

```typescript
// Example usage in DAL
import { env } from "@/lib/env";

const connectionString = env.MONGODB_URI; // Strictly typed as string
```

---

## Environment File Precedence Hierarchy

Next.js 16 reads environment variable files in a strict order of priority:

1. **`process.env`**: System environment variables set in host container environments (Vercel, Docker, AWS) take highest precedence.
2. **`.env.production.local` / `.env.development.local`**: Local overrides specific to target environments (git-ignored).
3. **`.env.local`**: Local development overrides (git-ignored).
4. **`.env.production` / `.env.development`**: Environment-specific defaults (committed to repo).
5. **`.env`**: Base default environment variables (committed to repo).

---

## Environment Variable Architecture Matrix

| Variable Type | Prefix Rule | Access Environment | Example |
| :--- | :--- | :--- | :--- |
| **Database Connection String** | No Prefix | Server Runtime Only | `MONGODB_URI=mongodb+srv://...` |
| **Authentication Secret Key** | No Prefix | Server Runtime Only | `AUTH_SECRET=super-secret-key-32-chars` |
| **Public Application URL** | `NEXT_PUBLIC_` | Server + Browser Bundle | `NEXT_PUBLIC_APP_URL=https://acme.com` |
| **Third-Party Public Client Key** | `NEXT_PUBLIC_` | Server + Browser Bundle | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` |

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

1. **Prefixing Private Keys with `NEXT_PUBLIC_`**: Naming a database URI `NEXT_PUBLIC_MONGODB_URI` so it can be accessed anywhere.
   - *Security Catastrophe*: Anyone visiting your website can open browser DevTools, inspect JavaScript source files, extract database credentials, and compromise your database.
2. **Hardcoding Insecure Fallbacks**: Writing `process.env.AUTH_SECRET || 'fallback-secret'`.
   - *Security Risk*: In staging or production builds where `AUTH_SECRET` is accidentally omitted, the application uses the insecure fallback string.
3. **Committing `.env.local` to Git Repositories**: Accidentally pushing local `.env.local` files containing real API secrets to public or private Git repositories.

---

## Production Considerations

- **GitIgnore Rules**: Ensure `.gitignore` explicitly includes `.env*.local` and `.env.production` to prevent accidental credential commits.
- **Runtime Secret Injection in Docker**: When deploying Next.js as a Docker container, pass runtime environment variables at container startup (`docker run -e MONGODB_URI=...`) rather than baking secrets into the Docker image layer during `docker build`.
- **Secret Rotation**: Establish secret rotation procedures for database passwords and JWT signing keys to minimize impact in the event of credential leakage.

---

## Summary

Environment variables manage application configuration across Next.js 16 execution runtimes. By respecting the `NEXT_PUBLIC_` security boundary, validating environment schemas with Zod at server startup (`lib/env.ts`), and keeping secrets out of Git repositories, you preserve backend security.

---

## Checklist
- [ ] Strictly restricted private database credentials and secrets to non-prefixed `process.env` variables.
- [ ] Used `NEXT_PUBLIC_` exclusively for truly public, client-safe configuration variables.
- [ ] Validated all environment variables at server startup using Zod in `lib/env.ts`.
- [ ] Verified that `.env.local` and `.env*.local` files are listed in `.gitignore`.
- [ ] Confirmed zero insecure fallback default strings exist for critical security secrets.
