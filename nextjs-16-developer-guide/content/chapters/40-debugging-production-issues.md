# Chapter 40: Debugging Production Issues

*Part VIII — Deployment*

---

## Learning Objectives
- Diagnose and resolve production runtime exceptions, memory leaks, and performance bottlenecks in Next.js 16.
- Correlate client error reference codes (`error.digest`) with server-side error log traces.
- Integrate Application Performance Monitoring (APM) and exception tracking tools (Sentry, Datadog) into App Router architectures.
- Debug serverless function timeouts, memory allocation spikes, and unhandled promise rejections.
- Isolate infinite re-render loops and hydration failure states.

---

## Overview & Core Explanation

When runtime errors occur in production, Next.js **redacts** raw error message strings and stack traces on the client to protect backend secrets. Instead, Next.js logs the complete exception stack trace on the server and passes a unique hash code—the `error.digest`—to the client error boundary.

To debug production issues efficiently, developers must establish a reliable **Error Correlation Pipeline** that maps client error digests directly to server log traces and APM telemetry.

```
Client Error Occurs in Production
   │
   ├─► Client Error Boundary displays: "An error occurred. Reference: 3128491823"
   │
   └─► Developer looks up digest ("3128491823") in Server APM / Log Stream
          │
          ▼
   Reveals Exact Server Stack Trace:
   "MongoServerError: E11000 duplicate key error collection: acme.projects index: tenantId_1_key_1"
```

---

## Integrating APM Telemetry (Sentry / Datadog)

Integrate exception tracking into Next.js 16 App Router using the global error boundary hooks and instrumentation configuration (`instrumentation.ts`).

### 1. Instrumentation Setup (`instrumentation.ts`)

Next.js 16 invokes `instrumentation.ts` when the server starts, making it the ideal location to initialize APM monitoring agents.

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Node.js APM agent (e.g. Sentry / Datadog)
    console.log("Initializing production server telemetry instrumentation...");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Initialize Edge APM agent
    console.log("Initializing production edge telemetry instrumentation...");
  }
}
```

### 2. Capturing Unhandled Exceptions in Error Boundaries

Capture and log error digests inside your route error boundaries (`error.tsx`).

```typescript
// app/dashboard/projects/error.tsx
"use client";

import { useEffect } from "react";

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Send error object and digest reference to client APM service
    console.error("Production Error Caught by Boundary:", {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="p-8 max-w-lg mx-auto border rounded-xl text-center space-y-4">
      <h2 className="text-xl font-bold text-destructive">Dashboard Unavailable</h2>
      <p className="text-xs text-muted-foreground">
        We encountered an error loading this dashboard view.
      </p>

      {error.digest && (
        <p className="text-xs font-mono bg-muted p-2 rounded">
          Error Reference Code: {error.digest}
        </p>
      )}

      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md"
      >
        Retry Request
      </button>
    </div>
  );
}
```

---

## Common Production Issues and Diagnostic Steps

### Issue 1: Serverless Execution Timeouts (504 Gateway Timeout)
- **Symptom**: User receives HTTP 504 Gateway Timeout errors on specific dynamic routes.
- **Root Cause**: An async Server Component or DAL function is executing un-indexed database queries or awaiting an external third-party API that hangs indefinitely.
- **Diagnostic Steps**:
  1. Inspect APM transaction waterfall traces to find the exact line awaiting a promise.
  2. Attach `AbortController` timeouts (e.g., 5-second timeout) to external `fetch()` calls.
  3. Ensure all MongoDB database queries feature compound indexes.

---

### Issue 2: Memory Leaks & Out of Memory (OOM) Crashes
- **Symptom**: Node process memory continuously increases until container crashes with `JavaScript heap out of memory`.
- **Root Cause**: Un-bounded global array caching, un-cleaned event listeners, or holding references to large database document arrays in memory.
- **Diagnostic Steps**:
  1. Run Node.js with heap inspection (`NODE_OPTIONS="--max-old-space-size=4096"`).
  2. Ensure `React.cache()` and Mongoose connection pools are used rather than custom global array caches.
  3. Stream large database datasets using cursors instead of `find().lean()` when processing thousands of records.

---

### Issue 3: Infinite Re-Render Loops in Client Components
- **Symptom**: Browser tab freezes, CPU spikes to 100%, and console floods with `Too many re-renders. React limits the number of renders to prevent an infinite loop`.
- **Root Cause**: Updating state inside component body or inside `useEffect` without including proper dependency arrays.
- **Diagnostic Steps**:
  1. Audit `useEffect` dependency arrays.
  2. Ensure state setter functions (`setQuery(...)`) execute strictly inside event handlers or conditional guards.

---

## Diagnostic Matrix

| Production Issue | Primary Root Cause | Diagnostic & Fix Tool |
| :--- | :--- | :--- |
| **Client Error Digest String** | Redacted production exception trace | Search digest hash (`error.digest`) in server log aggregator. |
| **504 Gateway Timeout** | Slow un-indexed database query or API stall | Add database compound indexes + attach `AbortController` timeouts. |
| **Node.js Heap Memory Leak** | Retaining large objects in global memory | Audit global arrays; stream database queries with cursors. |
| **Hydration Mismatch Warning** | Server vs Client HTML output mismatch | Guard dynamic dates/storage calls with mount-state checks (`mounted`). |

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

1. **Attempting to Read Stack Traces on Client in Production**: Expecting raw server error messages to display in client browser DevTools in production builds.
   - *Fix*: Match `error.digest` with server logs.
2. **Ignoring Unhandled Promise Rejections**: Omitting `try/catch` blocks inside Server Actions or background tasks, causing unhandled promise rejections to crash Node execution threads.
3. **Omitting Structured JSON Logs**: Printing plain un-structured string logs (`console.log("error happened")`), making searching and filtering in Datadog or CloudWatch difficult.

---

## Production Considerations

- **Structured JSON Server Logging**: Format server logs as structured JSON (`{"level": "error", "digest": "...", "message": "..."}`) to enable instant log searching in cloud log aggregators.
- **Source Map Security**: Upload production server source maps privately to Sentry or Datadog without exposing source maps publicly in client browser bundles.
- **Health & Alert Metrics**: Configure automated alerts (PagerDuty, Slack notifications) when HTTP 500 error rates exceed 1% of total request volume.

---

## Summary

Debugging production issues in Next.js 16 requires correlating redacted client `error.digest` references with server-side structured logs and APM telemetry. By isolating database query stalls, memory leaks, and hydration mismatches, you maintain stable, self-healing production applications.

---

## Checklist
- [ ] Configured APM instrumentation in `instrumentation.ts` and route error boundaries.
- [ ] Established log aggregation workflows matching client `error.digest` hashes with server stack traces.
- [ ] Attached `AbortController` timeouts to external HTTP `fetch()` requests.
- [ ] Audited client components for infinite re-render loops and un-cleaned event listeners.
- [ ] Uploaded server source maps privately to APM tools for readable stack traces.
