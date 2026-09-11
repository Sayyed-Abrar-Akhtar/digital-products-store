# Chapter 14: MongoDB and Mongoose

*Part III — Data*

---

## Learning Objectives
- Manage MongoDB connection caching in serverless and Next.js 16 environments using Mongoose.
- Design strictly typed Mongoose schemas, models, and TypeScript interface contracts.
- Optimize query performance using `.lean()` to bypass Mongoose document overhead.
- Convert MongoDB ObjectIds and Date objects into plain serializable JSON structures for React Server Component (RSC) boundary crossing.
- Avoid serverless connection exhaustion and connection leakage patterns.

---

## Overview & Core Explanation

MongoDB is one of the most popular document databases paired with Next.js applications. Mongoose provides a schema-based modeling solution that enforces strict data types, validation, and middleware hooks.

However, using Mongoose inside Next.js 16 App Router requires understanding two critical runtime constraints:

1. **Serverless Connection Lifecycle**: In production serverless deployments (Vercel, AWS Lambda), Next.js handles requests across ephemeral Node.js execution environments. If a database connection is created on every HTTP request without caching, the application will quickly exhaust database connection pools.
2. **React Server Component (RSC) Props Serialization**: Mongoose query results return complex Mongoose `Document` class instances containing internal methods, getters, and prototype chains. Passing raw Mongoose documents across the RSC server-to-client boundary causes React serialization runtime errors.

```
Request ──► Check Global Cached Connection
                  │
        ┌─────────┴─────────┐
        │                   │
   Existing Pool      Create New Pool
   [Reuse Connection] [Save to globalThis]
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
          Mongoose Query (.lean())
                  │
                  ▼
          Serialize ObjectId & Dates -> Plain JSON Object
                  │
                  ▼
          Render React Server Component UI
```

---

## Production MongoDB Connection Caching (`lib/db.ts`)

In Node.js applications, hot-reloading during development and request scaling in production can re-evaluate modules multiple times. We cache the Mongoose connection promise on `globalThis` to preserve the connection pool across invocations.

```typescript
// lib/db.ts
import "server-only";

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global interface augmentation for Node.js global scope
 */
interface MongooseConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseConnectionCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function dbConnect(): Promise<typeof mongoose> {
  // 1. If connection already active, return cached connection
  if (cached.conn) {
    return cached.conn;
  }

  // 2. If connection promise pending, await existing promise
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose command buffering in serverless environments
      maxPoolSize: 10,       // Keep connection pool manageable in serverless containers
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => {
      console.log("MongoDB connection established successfully.");
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
```

---

## Defining Strictly Typed Mongoose Schemas & Models

To maintain strict TypeScript compliance across Next.js 16 codebases, define TypeScript interfaces alongside Mongoose schemas.

```typescript
// lib/db/models/project.ts
import "server-only";

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject {
  tenantId: string;
  name: string;
  key: string;
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProjectDocument extends IProject, Document {}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, trim: true, uppercase: true },
    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED", "COMPLETED"],
      default: "ACTIVE",
    },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for tenant-isolated lookups
ProjectSchema.index({ tenantId: 1, key: 1 }, { unique: true });

// Prevent model re-compilation during Next.js hot-reloading
export const ProjectModel: Model<IProjectDocument> =
  mongoose.models.Project || mongoose.model<IProjectDocument>("Project", ProjectSchema);
```

---

## Fast Querying with `.lean()` & Document Serialization

When querying documents for read-only Server Component rendering, append `.lean()` to Mongoose queries. `.lean()` instructs Mongoose to skip hydrating full Mongoose Document class instances and return high-performance plain JavaScript objects instead.

### Serializing ObjectIds and Dates for RSC Props

Even with `.lean()`, MongoDB returns `_id` as a BSON `ObjectId` instance and `createdAt` as a JavaScript `Date` object. Passing these objects to Client Components causes React serialization warnings.

Create a robust serialization helper in your data utility:

```typescript
// lib/db/serialize.ts
import "server-only";

export interface PlainProject {
  id: string;
  tenantId: string;
  name: string;
  key: string;
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transforms raw Mongoose lean document into plain serializable JSON primitive DTO
 */
export function serializeProject(doc: any): PlainProject {
  return {
    id: doc._id ? doc._id.toString() : String(doc.id),
    tenantId: String(doc.tenantId),
    name: String(doc.name),
    key: String(doc.key),
    status: doc.status,
    createdBy: String(doc.createdBy),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}
```

---

## Practical Example

```typescript
// app/dashboard/projects/page.tsx (Server Component Page)
import { dbConnect } from "@/lib/db";
import { ProjectModel } from "@/lib/db/models/project";
import { serializeProject } from "@/lib/db/serialize";
import { ProjectCard } from "./_components/project-card"; // Client or Server Component

export default async function ProjectsPage() {
  await dbConnect();

  // Lean query: High performance, returns plain objects
  const rawDocs = await ProjectModel.find({ tenantId: "tenant-acme-1" })
    .sort({ createdAt: -1 })
    .lean();

  // Serialization: Converts ObjectIds to strings & Dates to ISO strings
  const projects = rawDocs.map(serializeProject);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Acme Projects Directory</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project) => (
          // Safe boundary crossing: project contains strictly serializable primitives
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </main>
  );
}
```

---

## MongoDB & Mongoose Architecture Matrix

| Requirement | Implementation Pattern | Benefit |
| :--- | :--- | :--- |
| **Serverless Connection Management** | Cache Mongoose connection on `globalThis` in `lib/db.ts` | Reuses connection pool across hot lambdas; prevents DB connection exhaustion. |
| **High-Performance DB Reads** | Append `.lean()` to all Mongoose query chains | Bypasses Mongoose document hydration overhead; reduces CPU and memory usage by 70%. |
| **RSC Props Boundary Safety** | Map `_id.toString()` and `date.toISOString()` in DTO serializer | Eliminates React serialization errors when passing props to Client Components. |
| **Index Enforcements** | Define compound indexes (`tenantId: 1, key: 1`) in schema definition | Enforces tenant isolation and guarantees sub-millisecond query lookups. |

---

## Common Mistakes

1. **Re-compiling Models on Hot Reload**: Calling `mongoose.model('Project', schema)` directly without checking `mongoose.models.Project`, causing `OverwriteModelError`.
   - *Fix*: Use `mongoose.models.Project || mongoose.model('Project', schema)`.
2. **Enabling Mongoose Command Buffering in Serverless**: Leaving `bufferCommands: true` enabled. When connections timeout in serverless, requests hang indefinitely instead of failing fast.
   - *Fix*: Set `bufferCommands: false` in `mongoose.connect()`.
3. **Passing Raw Mongoose Docs across RSC Boundaries**: Passing un-serialized Mongoose document objects as props to Client Components.

---

## Production Considerations

- **MongoDB Atlas Connection Limits**: Set `maxPoolSize: 10` (or lower depending on serverless concurrency limits) to prevent serverless auto-scaling spikes from exceeding Atlas connection ceilings.
- **Index Verification**: Run `ProjectModel.syncIndexes()` during database seed or CI build scripts rather than runtime request handles to avoid query stalls during user traffic.
- **URI Security**: Never hardcode database URIs containing passwords in source code. Load `MONGODB_URI` from private environment variables.

---

## Summary

Integrating MongoDB and Mongoose in Next.js 16 requires caching connection pools on `globalThis`, utilizing `.lean()` for high-performance read queries, and mapping ObjectIds and Dates to plain serializable primitives. Following these patterns guarantees fast, type-safe, and crash-free serverless database access.

---

## Checklist
- [ ] Created `lib/db.ts` connection utility caching Mongoose connections on `globalThis`.
- [ ] Disabled command buffering (`bufferCommands: false`) and tuned pool size (`maxPoolSize`).
- [ ] Appended `.lean()` to all read-only Mongoose queries.
- [ ] Converted MongoDB `_id` ObjectIds to strings and `Date` objects to ISO strings.
- [ ] Guarded model definitions against re-compilation (`mongoose.models.Project || ...`).
