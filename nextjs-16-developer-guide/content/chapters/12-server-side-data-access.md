# Chapter 12: Server-Side Data Access

*Part III — Data*

---

## Learning Objectives
- Architect a formal **Data Access Layer (DAL)** pattern in Next.js 16 to enforce data security, reuse, and type safety.
- Guard database modules against accidental client bundle exposure using `server-only`.
- Integrate tenant isolation, user session verification, and authorization checks directly inside the DAL.
- Differentiate between presentation UI components and backend data query logic.
- Prevent security flaws such as IDOR (Insecure Direct Object Reference) and database connection leaks.

---

## Overview & Core Explanation

In small projects or tutorials, developers often write database queries directly inside page components. As applications scale, scattering raw database calls across dozens of `page.tsx` and `action.ts` files leads to duplicated code, missing authorization checks, and security vulnerabilities.

The recommended architecture for production Next.js 16 applications is the **Data Access Layer (DAL)**.

### What is the Data Access Layer?
The DAL is a dedicated set of server-only modules (typically placed in `lib/dal/` or `lib/db/`) that serve as the sole interface for reading and mutating database entities.

```
App Router Components (Pages, Actions, Route Handlers)
                      │
                      ▼
            Data Access Layer (DAL)
    ├── 1. Verifies User Session / Auth
    ├── 2. Applies Authorization Guards & Tenant Filters
    ├── 3. Executes DB Query / Connection Pooling
    └── 4. Sanitizes Payload & Returns Plain Objects
                      │
                      ▼
            Database (MongoDB / PostgreSQL)
```

---

## The Four Guiding Principles of the DAL

1. **`server-only` Enforcement**: Every file in the DAL must import `"server-only"` at the top line. If a Client Component attempts to import a DAL file, the Next.js compiler halts the build immediately.
2. **Built-In Authorization Checks**: Never assume the caller checked permissions. Every DAL function must inspect the current session context (via cookies, headers, or token verification) before querying or updating data.
3. **Data Pruning & Sanitization**: DAL functions return only the exact fields required by UI components, stripping internal security fields (`passwordHash`, `resetToken`, `stripeCustomerId`).
4. **Request Memoization**: DAL read operations are wrapped with `React.cache()` so that multiple calls within the same request lifecycle re-use the memoized promise.

---

## Practical Example

Let's inspect a production DAL module for project management in **Acme App**.

```typescript
// lib/dal/projects.ts
import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { dbConnect } from "@/lib/db";
import { ProjectModel } from "@/lib/db/models";

export interface ProjectDTO {
  id: string;
  name: string;
  key: string;
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
  createdAt: string;
}

/**
 * Internal Auth Context Helper
 */
async function getAuthSession() {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  const tenantId = headerList.get("x-tenant-id");

  if (!userId || !tenantId) {
    return null;
  }

  return { userId, tenantId };
}

/**
 * DAL Query: Fetch Projects for Current Tenant (Tenant-Isolated)
 */
export const getProjectsForTenant = cache(async (): Promise<ProjectDTO[]> => {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("Unauthorized: Session required for project access.");
  }

  await dbConnect();

  // Tenant Isolation: Query ALWAYS filters by session.tenantId to prevent IDOR attacks
  const docs = await ProjectModel.find({ tenantId: session.tenantId })
    .sort({ createdAt: -1 })
    .lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    key: doc.key,
    status: doc.status,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  }));
});

/**
 * DAL Query: Fetch Single Project by ID with Authorization Check
 */
export const getProjectById = cache(async (projectId: string): Promise<ProjectDTO | null> => {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("Unauthorized: Session required.");
  }

  await dbConnect();

  // Strict check: Query requires both _id AND tenantId matching the session
  const doc = await ProjectModel.findOne({
    _id: projectId,
    tenantId: session.tenantId,
  }).lean();

  if (!doc) return null;

  return {
    id: String(doc._id),
    name: doc.name,
    key: doc.key,
    status: doc.status,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
});
```

---

## Consuming the DAL inside Server Components

Because authorization, tenant filtering, and connection management are handled inside `lib/dal/projects.ts`, consuming data in Server Components is clean, secure, and concise.

```typescript
// app/dashboard/projects/page.tsx (Server Component Page)
import { getProjectsForTenant } from "@/lib/dal/projects";

export default async function ProjectsDashboardPage() {
  // DAL automatically inspects session headers, connects to DB, and filters by tenant
  const projects = await getProjectsForTenant();

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects Directory</h1>
        <span className="text-xs font-medium px-2.5 py-1 bg-muted rounded-full">
          Total: {projects.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="p-4 border rounded-xl bg-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-secondary rounded">
                {project.key}
              </span>
              <span className="text-xs text-muted-foreground">{project.status}</span>
            </div>
            <h3 className="font-semibold text-lg">{project.name}</h3>
            <p className="text-xs text-muted-foreground">Created: {project.createdAt.slice(0, 10)}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
```

---

## DAL Security & Architecture Matrix

| Architectural Problem | Without DAL | With DAL (`lib/dal/`) |
| :--- | :--- | :--- |
| **Accidental Secret Exposure** | DB drivers imported into client components leak secrets in JS bundle. | `import "server-only"` triggers compile-time build errors if imported into client. |
| **Insecure Direct Object Reference (IDOR)** | Developer forgets `tenantId` check in page query; user views another tenant's project. | Session inspection and tenant filters are hardcoded inside the central DAL query. |
| **Duplicate DB Queries** | Multiple layout/page widgets execute redundant SQL/Mongo queries. | `React.cache()` memoizes queries per request automatically. |
| **Type Leaks & Class Instances** | Raw Mongoose models passed as props cause serialization crashes. | DAL transforms docs into plain, serializable DTO objects. |

---

## Common Mistakes

1. **Performing Auth Checks Only in Middleware**: Assuming Middleware authorization is sufficient. Middleware runs on route matching but cannot pass rich domain permission objects to deep components.
   - *Fix*: Perform domain and tenant authorization checks inside the DAL at the exact point of data query.
2. **Leaking Unsanitized Model Instances**: Returning raw database ORM class instances directly from DAL functions.
   - *Fix*: Map database documents to plain JavaScript objects (DTOs) with string primitives before returning.
3. **Bypassing the DAL in Server Actions**: Writing inline raw database queries inside `action.ts` files instead of calling DAL mutation helpers.

---

## Production Considerations

- **Connection Pool Pooling**: In serverless environment deployments (Vercel, AWS Lambda), ensure your DB client (e.g. Mongoose, Prisma, PgPool) caches its connection promise across hot lambdas to prevent exhausting database connection limits.
- **Audit Logging**: Embed audit log emission inside DAL mutation methods (`createProject`, `deleteProject`) to ensure every data mutation records the performing user ID and timestamp.
- **Environment Isolation**: Separate test, staging, and production database URIs inside strict environment variable configurations.

---

## Summary

A formal Data Access Layer (DAL) provides a secure, maintainable foundation for server-side data access in Next.js 16. By pairing `import "server-only"` with `React.cache()`, internal session verification, and DTO transformation, you protect backend data boundaries and prevent common web security vulnerabilities.

---

## Checklist
- [ ] Created dedicated DAL files under `lib/dal/` or `lib/db/`.
- [ ] Added `import "server-only"` to every DAL file.
- [ ] Enforced session authentication and tenant isolation inside DAL query functions.
- [ ] Wrapped DAL read functions with `React.cache()` for request deduplication.
- [ ] Converted ORM documents to plain serializable DTOs before returning them to UI layers.
