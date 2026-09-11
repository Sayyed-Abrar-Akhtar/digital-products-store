# Chapter 11: Data Fetching

*Part III — Data*

---

## Learning Objectives
- Master modern Next.js 16 data fetching patterns inside async React Server Components.
- Eliminate network waterfalls by implementing parallel data fetching with `Promise.all`.
- Leverage React 19 `cache()` request deduplication to prevent redundant data calls across component trees.
- Integrate strict TypeScript interfaces for API payload deserialization.
- Decide when to use native `fetch()` vs direct database drivers vs Route Handlers.

---

## Overview & Core Explanation

In Next.js 16 App Router architecture, **data fetching happens on the server by default** inside async React Server Components.

This represents a major shift from legacy React Single-Page Applications (where components fetched data in client-side `useEffect` hooks) and Pages Router conventions (where fetching was isolated in `getServerSideProps` or `getStaticProps`).

### Why Server Component Data Fetching is Superior
1. **Direct Backend Access**: Server Components can execute queries directly against database engines (MongoDB, PostgreSQL, Redis) without exposing API endpoints or credentials to the client.
2. **Zero Client JS Overhead**: Fetching logic, heavy API clients, and parsing libraries execute entirely on the server and are omitted from client bundles.
3. **Colocation with UI**: Data dependencies live in the exact component that renders the data, improving maintainability.

```
CLIENT BUNDLE (0 Bytes Fetch Logic)
   │
   ├─► Async Server Component Page
   │      │
   │      ├─► Direct DB Query or Native fetch() [Server Runtime]
   │      │
   │      └─► Renders HTML + RSC Payload Stream
   │
   └─► Browser receives pre-rendered markup
```

---

## Parallel Data Fetching (Eliminating Waterfalls)

An architectural anti-pattern in server rendering is creating **sequential waterfalls**, where component execution pauses sequentially for every `await` statement.

### Anti-Pattern: Sequential Waterfall (Slow)
```typescript
// BAD: Takes 300ms + 200ms = 500ms total server latency!
export default async function ProjectsPage() {
  const projects = await fetchProjects(); // 300ms
  const userStats = await fetchUserStats(); // 200ms (Waits for projects to finish!)

  return <DashboardLayout projects={projects} stats={userStats} />;
}
```

### Production Pattern: Parallel Execution with `Promise.all` (Fast)
To execute independent data requests concurrently, initiate promises simultaneously and resolve them with `Promise.all`.

```typescript
// GOOD: Executes concurrently; total server latency = 300ms!
export default async function ProjectsPage() {
  // Initiate requests in parallel
  const projectsPromise = fetchProjects();
  const userStatsPromise = fetchUserStats();

  // Await concurrent completion
  const [projects, userStats] = await Promise.all([projectsPromise, userStatsPromise]);

  return <DashboardLayout projects={projects} stats={userStats} />;
}
```

---

## Request Deduplication (`React.cache`)

When multiple Server Components in a single request tree require the same data (e.g., both the navigation header and the page main content need the current logged-in user profile), calling the fetch function multiple times could result in duplicate database or API queries.

Next.js 16 automatically deduplicates native `fetch()` requests during a single render pass. For custom database calls (Mongoose, Prisma, ORMs) where `fetch()` is not used, wrap the data access function with React 19's `cache()` function.

### Practical Example: `React.cache()` Deduplication

```typescript
// lib/data/user.ts
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/lib/db/models";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

// React.cache memoizes function calls for the duration of a single HTTP request pass
export const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");

  if (!userId) return null;

  await dbConnect();
  const userDoc = await UserModel.findById(userId).lean();

  if (!userDoc) return null;

  return {
    id: String(userDoc._id),
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
  };
});
```

Now, whether `getCurrentUser()` is called 1 time or 10 times across different layout and page components during a single request render, the database query executes **exactly once**.

---

## Practical Example

When fetching from third-party APIs using native `fetch()`, pass explicit TypeScript interfaces and configure error bounds.

```typescript
// lib/api/telemetry.ts
import "server-only";

export interface SystemMetric {
  id: string;
  label: string;
  value: string;
  status: "healthy" | "degraded" | "critical";
}

export async function fetchSystemTelemetry(): Promise<SystemMetric[]> {
  const apiKey = process.env.TELEMETRY_API_KEY;
  if (!apiKey) {
    throw new Error("TELEMETRY_API_KEY is not configured.");
  }

  const response = await fetch("https://api.acme.internal/v1/telemetry", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    // Next.js fetch extension: opt into dynamic or cached handling
    next: { tags: ["telemetry-metrics"] },
  });

  if (!response.ok) {
    throw new Error(`Telemetry API error: HTTP ${response.status}`);
  }

  const payload: { metrics: SystemMetric[] } = await response.json();
  return payload.metrics;
}
```

```typescript
// app/dashboard/telemetry/page.tsx (Async Server Component)
import { fetchSystemTelemetry } from "@/lib/api/telemetry";

export default async function TelemetryPage() {
  const metrics = await fetchSystemTelemetry();

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">System Telemetry</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.id} className="p-4 border rounded-lg bg-card">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="text-2xl font-bold">{m.value}</p>
            <span
              className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full font-medium ${
                m.status === "healthy"
                  ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
              }`}
            >
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
```

---

## Data Fetching Decision Matrix

| Data Access Need | Preferred Pattern | Rationale |
| :--- | :--- | :--- |
| **Reading from internal Database / ORM** | Direct query inside Data Access Layer (DAL) wrapped with `React.cache()` | Highest performance; zero network API overhead; safe credential storage. |
| **Fetching external Microservice / API** | Native `fetch()` in async Server Component | Leverages built-in Next.js request deduplication and tagging. |
| **Multiple independent data calls in one page** | Parallel promises via `Promise.all([p1, p2])` | Prevents sequential network waterfalls and reduces total request latency. |
| **Data required by Client Components** | Pass initial data from Server Component as props | Eliminates client layout flash and keeps API secrets on server. |

---

## Common Mistakes

1. **Creating Waterfalls with Nested `await` Statements**: Awaiting sequential promises when data calls have no interdependencies.
   - *Fix*: Use `Promise.all` or isolate queries into separate, parallel Suspense-wrapped Server Components.
2. **Fetching Internal Route Handlers from Server Components**: Calling `await fetch('http://localhost:3000/api/projects')` inside a Server Component to fetch internal data.
   - *Fix*: Call the database logic directly inside a server function or DAL helper rather than routing an internal HTTP loop.
3. **Forgetting `React.cache` on Custom ORM / Database Queries**: Executing duplicate database queries across layout and page components because ORM calls bypass `fetch()`.
   - *Fix*: Wrap ORM functions with `React.cache()`.

---

## Production Considerations

- **Server Timeout Controls**: Attach `AbortController` timeouts to external `fetch()` calls to prevent stalled backend microservices from hanging Next.js request rendering.
- **Strict Type Validation**: Use runtime validation tools like Zod (`z.object({...}).parse(json)`) when deserializing payloads from third-party APIs to prevent unexpected runtime type crashes.
- **Security Boundaries**: Ensure all server data access functions reside in `lib/` modules marked with `import "server-only"`.

---

## Summary

Data fetching in Next.js 16 is centered on asynchronous React Server Components. By leveraging `Promise.all` for parallel fetching, `React.cache` for request deduplication, and direct database access within Server Data Access Layers, you eliminate client-side fetching overhead and achieve ultra-low page latencies.

---

## Checklist
- [ ] Fetched data inside async Server Components by default.
- [ ] Combined independent asynchronous data promises using `Promise.all`.
- [ ] Wrapped custom ORM and database access functions with `React.cache()` for single-request deduplication.
- [ ] Avoided internal HTTP fetch calls to own Route Handlers.
- [ ] Guarded data access modules with `import "server-only"`.
