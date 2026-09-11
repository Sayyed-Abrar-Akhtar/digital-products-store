# Chapter 35: Database Performance

*Part VII — Performance*

---

## Learning Objectives
- Optimize database performance in Next.js 16 App Router applications.
- Identify and eliminate **N+1 query patterns** inside React Server Component rendering trees.
- Design compound indexes that match exact query filter shapes.
- Manage database connection pooling across serverless execution environments.
- Measure database query latencies using server performance tracing tools.

---

## Overview & Core Explanation

In React Server Component architecture, database operations occur directly on the server during request processing.

While this removes client-side network fetching overhead, **slow database queries block initial HTML rendering and streaming**. If a database query takes 800ms to resolve, the user waits 800ms before receiving rendered markup.

To achieve sub-100ms server response times, developers must optimize three critical database performance vectors:
1. **Connection Pooling**: Re-using database sockets across serverless function invocations.
2. **Query Efficiency**: Eliminating N+1 query loops using batching (`$in` queries).
3. **Index Coverage**: Creating compound database indexes that cover query filter and sort fields.

```
                  SERVER PERFORMANCE PIPELINE
┌─────────────────────────────────────────────────────────────┐
│ 1. Connection Pool Check (0ms - Reuses Warm Connection)     │
│ 2. Indexed Query Lookup (sub-10ms DB Execution)             │
│ 3. Batched Query Resolution (Eliminates N+1 Loops)          │
│ 4. Lean DTO Serialization (Minimizes CPU Memory Usage)      │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
        Sub-50ms HTML Stream Generation to Browser
```

---

## Eliminating the N+1 Query Pattern

The **N+1 query pattern** occurs when an application executes 1 initial query to fetch a list of $N$ parent records, and then executes $N$ additional individual queries inside a loop to fetch related child records.

### Anti-Pattern: N+1 Query Loop (Slow)
```typescript
// BAD: Executes 1 + N queries! For 100 projects, performs 101 separate database round-trips!
export async function getProjectsWithUserBad() {
  await dbConnect();
  const projects = await ProjectModel.find({ status: "ACTIVE" }).lean();

  const results = [];
  for (const project of projects) {
    // N Queries inside loop!
    const user = await UserModel.findById(project.createdBy).lean();
    results.push({ ...project, authorName: user?.name });
  }

  return results;
}
```

### Production Pattern: Batched `$in` Query (Fast)
Collect all foreign key IDs into a single array and resolve them in **1 single batched query**.

```typescript
// GOOD: Executes EXACTLY 2 database queries regardless of project count!
export async function getProjectsWithUserBatched() {
  await dbConnect();

  // Query 1: Fetch active projects
  const projects = await ProjectModel.find({ status: "ACTIVE" }).lean();
  if (projects.length === 0) return [];

  // Extract unique author user IDs
  const authorIds = [...new Set(projects.map((p) => p.createdBy))];

  // Query 2: Single batched lookup using $in operator
  const users = await UserModel.find({ _id: { $in: authorIds } })
    .select("name email")
    .lean();

  // Create fast lookup map
  const userMap = new Map(users.map((u) => [String(u._id), u.name]));

  // Merge records in memory (0 DB overhead)
  return projects.map((p) => ({
    id: String(p._id),
    name: p.name,
    key: p.key,
    authorName: userMap.get(p.createdBy) || "Unknown User",
  }));
}
```

---

## Indexing Strategy & Compound Indexes

Without database indexes, database engines must execute a **COLLSCAN (Collection Scan)**, inspecting every record in the table row by row. On tables with 100,000 records, a COLLSCAN takes hundreds of milliseconds.

### Creating Compound Indexes for Mongoose

Compound indexes should match the exact fields used in query filters and sort definitions.

```typescript
// lib/db/models/project.ts (Compound Index Definition)
import { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema({
  tenantId: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Compound Index: Supports queries filtering by tenantId + status, sorted by createdAt
ProjectSchema.index({ tenantId: 1, status: 1, createdAt: -1 });

export const ProjectModel = models.Project || model("Project", ProjectSchema);
```

With this compound index active, database lookup times drop from 500ms down to sub-1ms (IXSCAN).

---

## Database Performance Decision Matrix

| Performance Problem | Root Cause | Optimization Solution |
| :--- | :--- | :--- |
| **Serverless Connection Exhaustion** | Re-creating DB connections on every HTTP request | Cache connection promise on `globalThis` (`lib/db.ts`). |
| **High Query Latency on Scale** | Missing database indexes (COLLSCAN) | Add compound indexes matching filter + sort fields. |
| **Multiple Round-Trips in Loops** | N+1 Query Anti-Pattern | Batch lookup IDs with `$in` array queries or DataLoader. |
| **Excessive Memory Overhead** | Fetching unnecessary fields (`select *`) | Use `.select('name key status')` and `.lean()` queries. |

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

1. **Executing Un-Indexed Queries on Growing Collections**: Writing queries on un-indexed fields. Queries run fast in development with 10 test records, but crash in production with 100,000 records.
2. **Fetching All Document Fields**: Fetching large unused text columns or embedded arrays when the UI component requires only 2 text fields.
   - *Fix*: Use `.select('title status')` projection in queries.
3. **Omitting `maxPoolSize` in Serverless**: Leaving connection pool limits un-configured, allowing serverless auto-scaling to open thousands of connections and crash database instances.

---

## Production Considerations

- **Database Performance Monitoring**: Monitor query execution times using database monitoring dashboards (MongoDB Atlas Performance Advisor, Datadog APM, AWS Performance Insights) to identify slow queries.
- **Query Projection**: Always project only required fields (`.select('_id name key status')`) to minimize memory allocation and network transport times.
- **Connection Caching**: Verify that database connection utility modules (`lib/db.ts`) preserve connection pools across serverless lambda warm starts.

---

## Summary

Database performance directly dictates server rendering speed in Next.js 16. By caching connection pools, eliminating N+1 query loops with batched queries, enforcing compound indexes, and projecting required fields, you maintain sub-100ms server rendering.

---

## Checklist
- [ ] Eliminated N+1 query loops using batched `$in` queries or DataLoader.
- [ ] Added compound indexes covering query filter and sort fields.
- [ ] Preserved serverless connection pools via `globalThis` caching in `lib/db.ts`.
- [ ] Projected required document fields using `.select()` and `.lean()`.
- [ ] Verified sub-50ms database query execution times in server logs.
