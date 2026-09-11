# Chapter 10: Error and Not-Found Handling

*Part II — React Architecture*

---

## Learning Objectives
- Architect robust runtime error boundaries in Next.js 16 using file-system conventions (`error.tsx`, `global-error.tsx`, `not-found.tsx`).
- Handle 404 resource conditions programmatically using the `notFound()` utility function.
- Implement interactive error recovery using React error boundary `reset()` callbacks.
- Protect production systems by sanitizing error messages to prevent sensitive database or secret leakage to client browsers.
- Integrate server-side telemetry and logging services (Sentry, Datadog, CloudWatch) with App Router error hooks.

---

## Overview & Core Explanation

In a web application, runtime errors and missing resource states are inevitable. Next.js 16 provides built-in, file-system-based error handling conventions built on React Error Boundaries.

### The Error Hierarchy
Next.js structures error boundaries hierarchically within the App Router folder tree:

```
app/
├── global-error.tsx       <-- Catches errors inside root app/layout.tsx
├── layout.tsx
├── error.tsx              <-- Catches errors in child pages/layouts
├── not-found.tsx          <-- Renders 404 UI when notFound() is thrown
└── dashboard/
    ├── error.tsx          <-- Catches errors inside dashboard sub-tree
    ├── not-found.tsx      <-- Custom 404 UI for missing dashboard entities
    └── page.tsx
```

> **Crucial Rule**: An `error.tsx` boundary catches errors in components **below** it in the folder hierarchy. An `error.tsx` file inside `app/dashboard/error.tsx` **cannot** catch an error thrown inside `app/dashboard/layout.tsx`. To catch layout errors, place an `error.tsx` file in the parent directory.

---

## Route Error Boundaries (`error.tsx`)

In Next.js 16, `error.tsx` must always be a Client Component (`"use client"`), because React Error Boundaries rely on client lifecycle methods (`componentDidCatch` or `getDerivedStateFromError`).

### Practical Example: Route Error Boundary with Reset

```typescript
// app/dashboard/projects/error.tsx
"use client";

import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProjectsError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to server telemetry service (e.g., Sentry, Datadog)
    console.error("Dashboard Projects Error:", error.message, "Digest:", error.digest);
  }, [error]);

  return (
    <div className="p-8 max-w-lg mx-auto my-12 border border-destructive/20 bg-destructive/10 rounded-xl text-center space-y-4">
      <h2 className="text-2xl font-bold text-destructive">Failed to load projects</h2>
      <p className="text-sm text-muted-foreground">
        An unhandled error occurred while fetching project telemetry data.
      </p>

      {/* Production-safe error reference code */}
      {error.digest && (
        <p className="text-xs font-mono bg-muted p-2 rounded text-muted-foreground">
          Reference Code: {error.digest}
        </p>
      )}

      <div className="flex justify-center space-x-4 pt-2">
        <button
          onClick={() => reset()} // Re-attempts server component render without reloading page
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
```

---

## Handling 404 Missing States (`notFound()` & `not-found.tsx`)

When a requested resource (such as a database project ID or slug) does not exist, invoke Next.js's `notFound()` function inside an async Server Component. Calling `notFound()` halts component execution and triggers rendering of the nearest `not-found.tsx` file in the route segment tree, setting the HTTP response status to 404.

```typescript
// app/dashboard/projects/[id]/page.tsx (Server Component Page)
import { notFound } from "next/navigation";
import { fetchProjectById } from "@/lib/projects";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  // Next.js 16 requirement: params is an async Promise
  const { id } = await params;
  const project = await fetchProjectById(id);

  if (!project) {
    // Triggers nearest not-found.tsx boundary & sets HTTP status 404
    notFound();
  }

  return (
    <article className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">{project.name}</h1>
      <p className="text-muted-foreground">{project.description}</p>
    </article>
  );
}
```

```typescript
// app/dashboard/projects/[id]/not-found.tsx
import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="p-12 text-center space-y-4">
      <h2 className="text-3xl font-bold">Project Not Found</h2>
      <p className="text-muted-foreground">
        The project identifier you requested does not exist or was deleted.
      </p>
      <Link
        href="/dashboard/projects"
        className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
      >
        Return to Projects List
      </Link>
    </div>
  );
}
```

---

## Root Layout Errors (`global-error.tsx`)

Standard `error.tsx` boundaries do not catch errors thrown inside the root `app/layout.tsx` file, because the boundary itself lives inside the layout.

To catch failures in the root layout, create `app/global-error.tsx`. It must define its own `<html>` and `<body>` tags because it replaces the entire root layout during catastrophic failures.

```typescript
// app/global-error.tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex items-center justify-center min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-3xl font-bold text-red-500">System Fatal Error</h1>
          <p className="text-slate-400 text-sm">
            A critical system error prevented application load.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-semibold"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
```

---

## Error Handling Matrix

| Error Type | Handling Mechanism | HTTP Status | Render Environment |
| :--- | :--- | :--- | :--- |
| **Missing Resource (404)** | `notFound()` function + `not-found.tsx` | 404 | Server Component |
| **Route / Component Runtime Error** | `error.tsx` boundary + `reset()` | 500 | Client Component (`"use client"`) |
| **Root Layout Catastrophic Error** | `global-error.tsx` boundary | 500 | Client Component (Defines `<html>`) |
| **Unauthorized Access (401/403)** | `redirect('/login')` or custom Auth Guard | 307 / 403 | Server Component / Proxy |

---

## Production Security: Preventing Secret Leaks in Errors

In production Next.js builds, Next.js **automatically redacts** raw server exception stack traces in client error objects.

When an exception occurs on the server, Next.js logs the full trace to server console/logs and generates a unique hash code known as `error.digest`. The client `error.tsx` boundary receives only a generic message and the `digest` string.

### Rules for Secure Error Handling
1. **Never pass raw `error.message` to user UI in production**: Display generic user-friendly text alongside `error.digest`.
2. **Use `error.digest` to match client logs with server APM**: Use the digest hash to look up exact stack traces in CloudWatch, Sentry, or Datadog.

---

## Common Mistakes

1. **Forgetting `"use client"` in `error.tsx`**: Placing a React Error Boundary file without `"use client"` causes compile-time errors because error boundaries require client React class methods.
2. **Attempting to Catch Layout Errors in Same Folder `error.tsx`**: Expecting `app/dashboard/error.tsx` to handle an exception thrown in `app/dashboard/layout.tsx`.
   - *Fix*: Move the error boundary file up to `app/error.tsx`.
3. **Omitting `params` Resolution in Next.js 16**: Accessing `params.id` synchronously without `await params`, breaking routing in Next.js 16.

---

## Production Considerations

- **Telemetric Scrubbing**: Ensure logging functions inside `error.tsx` sanitize personal identifiable information (PII) before sending payload digests to analytics providers.
- **Graceful Degradation**: Design error boundaries so that isolated widget failures (e.g., live chat sidebar) fail silently with local error states without crashing main dashboard page views.
- **Cache Busting on Reset**: When invoking `reset()`, ensure backend mutative actions revalidate dynamic path tags (`revalidateTag`) so retried requests fetch fresh data rather than re-triggering cached error states.

---

## Summary

Next.js 16 error handling provides hierarchical error boundaries (`error.tsx`, `global-error.tsx`) and programmatic resource handling (`notFound()`, `not-found.tsx`). By redacting sensitive production traces, logging digests to telemetry services, and providing `reset()` callbacks, developers maintain secure, self-healing applications.

---

## Checklist
- [ ] Created `"use client"` `error.tsx` boundaries for major route segments.
- [ ] Added `global-error.tsx` to handle root layout failures.
- [ ] Invoked `notFound()` programmatically for missing resources and rendered custom `not-found.tsx` UI.
- [ ] Awaited `params` promises in Next.js 16 route pages.
- [ ] Confirmed production error boundaries expose `error.digest` without leaking backend secrets or raw stack traces.
