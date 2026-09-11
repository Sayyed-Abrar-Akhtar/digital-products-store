# Practical Next.js 16 Developer Guide — Free Sample Edition

*Building Production-Ready Applications with Next.js 16, React 19, and the App Router*

**Author**: Sayyed Abrar Akhtar
**Version**: 1.0.0 (Sample Preview)
**Website**: https://store.sayyedabrarakhtar.com.np

> *This free sample edition includes the complete Table of Contents, Chapter 6 (Server Components), Appendix E (Security Checklist), and Appendix F (Performance Checklist).*

---

# Table of Contents

## Part I — Modern Next.js
1. [What Next.js 16 Is](chapters/01-what-nextjs-16-is.md)
2. [Creating a Next.js 16 Project](chapters/02-creating-a-nextjs-16-project.md)
3. [Understanding the App Router](chapters/03-understanding-the-app-router.md)
4. [Project Structure](chapters/04-project-structure.md)
5. [Routing and Layouts](chapters/05-routing-and-layouts.md)

## Part II — React Architecture
6. [Server Components](chapters/06-server-components.md)
7. [Client Components](chapters/07-client-components.md)
8. [Composition Patterns](chapters/08-composition-patterns.md)
9. [Loading, Streaming and Suspense](chapters/09-loading-streaming-and-suspense.md)
10. [Error and Not-Found Handling](chapters/10-error-and-not-found-handling.md)

## Part III — Data
11. [Data Fetching](chapters/11-data-fetching.md)
12. [Server-Side Data Access](chapters/12-server-side-data-access.md)
13. [Mutations](chapters/13-mutations.md)
14. [MongoDB and Mongoose](chapters/14-mongodb-and-mongoose.md)
15. [Caching and Revalidation](chapters/15-caching-and-revalidation.md)

## Part IV — Production UI
16. [Styling with Tailwind CSS](chapters/16-styling-with-tailwind-css.md)
17. [Forms and Validation](chapters/17-forms-and-validation.md)
18. [Accessibility](chapters/18-accessibility.md)
19. [Images and Fonts](chapters/19-images-and-fonts.md)
20. [Responsive Design](chapters/20-responsive-design.md)

## Part V — SEO
21. [Metadata](chapters/21-metadata.md)
22. [Canonical URLs](chapters/22-canonical-urls.md)
23. [Sitemap and robots.txt](chapters/23-sitemap-and-robots-txt.md)
24. [Open Graph](chapters/24-open-graph.md)
25. [Structured Data](chapters/25-structured-data.md)
26. [Internal Linking](chapters/26-internal-linking.md)

## Part VI — Security
27. [Authentication Architecture](chapters/27-authentication-architecture.md)
28. [Authorization](chapters/28-authorization.md)
29. [Protecting Server Operations](chapters/29-protecting-server-operations.md)
30. [Environment Variables and Secrets](chapters/30-environment-variables-and-secrets.md)
31. [Common Security Mistakes](chapters/31-common-security-mistakes.md)

## Part VII — Performance
32. [Server vs Client Performance](chapters/32-server-vs-client-performance.md)
33. [JavaScript and Hydration](chapters/33-javascript-and-hydration.md)
34. [Images and Assets](chapters/34-images-and-assets.md)
35. [Database Performance](chapters/35-database-performance.md)
36. [Production Optimization](chapters/36-production-optimization.md)

## Part VIII — Deployment
37. [Environment Configuration](chapters/37-environment-configuration.md)
38. [Production Builds](chapters/38-production-builds.md)
39. [Deployment](chapters/39-deployment.md)
40. [Debugging Production Issues](chapters/40-debugging-production-issues.md)
41. [Production Checklist](chapters/41-production-checklist.md)

## Appendix
- [Appendix A: Recommended Project Structure](chapters/appendix-a-recommended-project-structure.md)
- [Appendix B: Useful Commands](chapters/appendix-b-useful-commands.md)
- [Appendix C: Deployment Checklist](chapters/appendix-c-deployment-checklist.md)
- [Appendix D: SEO Checklist](chapters/appendix-d-seo-checklist.md)
- [Appendix E: Security Checklist](chapters/appendix-e-security-checklist.md)
- [Appendix F: Performance Checklist](chapters/appendix-f-performance-checklist.md)


---



# Chapter 6: Server Components

*Part I — Modern Next.js*

---

## Learning Objectives
- Master the React 19 Server Component (RSC) execution model in Next.js 16 (target 16.3.4).
- Understand why the App Router uses Server Components by default and how server rendering optimizes client JavaScript bundles.
- Establish clean execution boundaries between Server Components and Client Components using `"use client"`.
- Apply composition patterns (passing Server Components as `children` into Client Components) to preserve server-side data fetching.
- Ensure props passed across the server-client boundary meet React 19 serialization requirements.
- Protect secrets, database keys, and backend services on the server using `server-only`.
- Identify when a Client Component is genuinely required vs. when it is added unnecessarily.

---

## Overview & Core Explanation

React Server Components (RSC) represent a fundamental evolution in full-stack React application architecture. In Next.js 16, **every component inside the `app/` directory is a Server Component by default**.

To master modern Next.js development, developers must build a clear mental model of where code executes, what is transmitted across the network, and how the server and browser runtimes interact.

### The Mental Model: Dual Runtimes

Traditional Single Page Applications (SPAs) and legacy SSR frameworks required sending all React component code to the browser bundle so that client-side React could hydrate the entire DOM tree.

In Next.js 16, application code is partitioned across two runtimes:

1. **Server Runtime (Node.js or Edge Network)**: Executes Server Components, database queries, ORM calls, and secret operations. Server Component code and backend dependencies (such as `mongoose`, `aws-sdk`, `pg`, or heavy markdown parsers) **never ship to the browser**.
2. **Client Runtime (Browser Engine)**: Executes Client Components (`"use client"`), handles user interactions, manages local React hooks (`useState`, `useReducer`, `useEffect`), and attaches browser event listeners.

```
+-----------------------------------------------------------------------------------+
|                                  SERVER RUNTIME                                   |
|                                                                                   |
|  Async Server Component Page                                                      |
|  ├── Reads environment secrets                                                    |
|  ├── Queries MongoDB / PostgreSQL directly                                        |
|  ├── Formats data via server helpers                                              |
|  └── Generates React Server Component (RSC) Binary Payload Stream                 |
|                                                                                   |
|  Dependencies (server-only, mongoose, database drivers) -> 0 Bytes sent to browser|
+-----------------------------------------------------------------------------------+
                                          |
                                          | [RSC Payload Streamed via HTTP]
                                          v
+-----------------------------------------------------------------------------------+
|                                  CLIENT RUNTIME                                   |
|                                                                                   |
|  Browser receives HTML + RSC Payload Stream                                       |
|  ├── Reconciles DOM structure without losing state                                |
|  └── Hydrates ONLY leaf Client Components ('use client')                          |
|                                                                                   |
|  Client JS Bundle contains ONLY 'use client' components + React runtime           |
+-----------------------------------------------------------------------------------+
```

---

## The React Server Component (RSC) Stream & Binary Payload

When a client requests an App Router page, Next.js executes Server Components on the server and generates two outputs:
1. **HTML Document**: For initial page load, providing immediate first paint and search engine indexing.
2. **RSC Binary Payload**: A light, serialized stream representing rendered React elements, component props, and placeholders for Client Component islands.

During client-side navigation (e.g., clicking a `<Link>`), Next.js fetches only the RSC payload for the new route segment. The client React runtime reads this payload and updates the browser DOM without refreshing the page or re-executing server logic on the client.

### Component Execution Matrix

| Characteristic | Server Component (Default) | Client Component (`"use client"`) |
| :--- | :--- | :--- |
| **Execution Environment** | Server Runtime (Build time or HTTP Request) | Server (pre-rendered initial HTML) + Client (hydration & events) |
| **Shipped to Browser Bundle?** | **No** (Component JS omitted; only output rendered) | **Yes** (Component JS and client imports included in bundle) |
| **Direct Database Access?** | **Yes** (Safe; code remains backend-bound) | **No** (Must fetch via API Route or Server Action) |
| **Access to Secrets (`process.env`)?**| **Yes** (Private environment variables remain safe) | **No** (Only `NEXT_PUBLIC_` variables exposed) |
| **React Hooks (`useState`, `useEffect`)** | **No** (Hooks not allowed in async Server Components)| **Yes** (Full access to React 19 interactive hooks) |
| **Browser DOM Event Handlers (`onClick`)**| **No** (Event functions cannot be serialized) | **Yes** (Event handlers bound during client hydration) |

---

## Server Component Boundaries & `"use client"`

The `"use client"` directive is an explicit boundary marker placed at the very top of a file. It informs the compiler that the component and its imported module dependencies belong to the Client Runtime.

### The Boundary Rule
Once a file is marked with `"use client"`, that component and **all files imported into it** become part of the client bundle.

```
Server Page (Server Component)
 ├── Reads Database (Server)
 ├── Formats Currency (Server)
 └── Imports Client Component ('use client')
      ├── Imports Client Button ('use client' implied via boundary)
      └── Imports Date Formatting Utility (Downloaded to client bundle!)
```

> **Key Rule**: `"use client"` does not mean a component is rendered *only* on the client. Client Components are still pre-rendered to HTML on the server during initial page load, and then hydrated on the browser.

---

## Practical Example

In our reference application (**Acme App**), we interleave dynamic server-rendered component output inside an interactive Client Component drawer using the React `children` composition pattern.

```typescript
// app/dashboard/_components/client-drawer.tsx (Client Component Leaf)
"use client";

import { useState, ReactNode } from "react";

export function ClientDrawer({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} className="px-3 py-1 border rounded">
        {isOpen ? "Close Telemetry Drawer" : "Open Telemetry Drawer"}
      </button>

      {isOpen && (
        <div className="p-4 border mt-2 bg-muted rounded-md">
          {children}
        </div>
      )}
    </div>
  );
}
```

---

## Composition Patterns: Interleaving Server and Client Components

A common architectural challenge is rendering a Server Component *inside* a Client Component tree (for example, placing a dynamic server-fetched data stream inside an interactive sliding drawer or tab container).

### Unsafe Anti-Pattern: Importing Server Components directly into Client Components
If you import a Server Component directly into a file marked with `"use client"`, Next.js converts that component into a Client Component, executing it on the client and breaking server-only imports.

```typescript
// BAD: app/dashboard/_components/client-drawer.tsx
"use client";

import { ServerDataFeed } from "./server-data-feed"; // FAILS if ServerDataFeed imports 'server-only' or DB client!

export function ClientDrawer() {
  return (
    <div>
      <ServerDataFeed />
    </div>
  );
}
```

### Safe Recommended Pattern: Passing Server Components as `children`
To interleave Server Components inside Client Components without pulling the Server Component into the client bundle, pass the Server Component as a React `children` prop (or slot).

```typescript
// GOOD: app/dashboard/_components/client-drawer.tsx
"use client";

import { useState, ReactNode } from "react";

export function ClientDrawer({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} className="px-3 py-1 border rounded">
        {isOpen ? "Close Drawer" : "Open Drawer"}
      </button>

      {isOpen && (
        <div className="p-4 border mt-2 bg-muted rounded-md">
          {/* Server Component rendered on server, passed as serialized children */}
          {children}
        </div>
      )}
    </div>
  );
}
```

```typescript
// GOOD: app/dashboard/page.tsx (Server Component Page)
import { fetchSystemMetrics } from "@/lib/projects";
import { ClientDrawer } from "./_components/client-drawer";

export default async function DashboardPage() {
  const metrics = await fetchSystemMetrics();

  return (
    <section>
      <h1>Executive Dashboard</h1>

      {/* Composition: Server Component passes server output into Client Component slot */}
      <ClientDrawer>
        <div className="space-y-2">
          <h2>Server Telemetry Stream</h2>
          {metrics.map((m) => (
            <p key={m.id}>{m.label}: {m.value}</p>
          ))}
        </div>
      </ClientDrawer>
    </section>
  );
}
```

---

## Props Serialization Across the Boundary

When passing props from a Server Component to a Client Component, all props must be **serializable by React**.

### Serializable Values (Allowed)
- Primitives (`string`, `number`, `boolean`, `null`, `undefined`)
- Plain JavaScript objects and Arrays
- `BigInt` (serialized as string or number)
- TypedArrays (`Uint8Array`, etc.)
- Promises (handled via React 19 `use()` hook)
- JSX Elements (`children` slots)

### Non-Serializable Values (Forbidden across Boundary)
- Functions or Event Handlers (`onClick={() => ...}`)
- Classes or Class Instances (`new Date()` instances must be converted to ISO strings or timestamps; custom database model instances like Mongoose documents must be converted to plain objects via `.lean()` or JSON serialization)
- Symbols

```typescript
// GOOD: Plain serializable object passed from Server Page to Client Component
const plainProject = {
  id: String(dbDoc._id),
  name: dbDoc.name,
  createdAt: dbDoc.createdAt.toISOString() // Converted Date object to ISO string
};

<ClientProjectCard project={plainProject} />
```

---

## Server-Only Code & Secret Protection (`server-only`)

To guarantee that private server logic, database credentials, or secret API tokens are never leaked to client bundles, use the `server-only` package.

```bash
npm install server-only
```

At the top of any server data access module:

```typescript
import "server-only";

// If any file with 'use client' attempts to import this file,
// the Next.js compiler will fail the build with an explicit error.
export async function queryDatabaseSecrets() {
  const secretKey = process.env.DATABASE_SECRET_KEY;
  // Database logic...
}
```

---

## When is a Client Component Actually Required?

Developers should default to Server Components and introduce `"use client"` only when specific client functionality is required.

### Use Client Components ONLY when you need:
1. **Interactive State & Lifecycle Hooks**: `useState`, `useReducer`, `useEffect`, `useCallback`, `useMemo`, `useImperativeHandle`.
2. **DOM Event Listeners**: `onClick`, `onChange`, `onSubmit`, `onKeyDown`, `onScroll`.
3. **Browser Web APIs**: `window`, `document`, `navigator.geolocation`, `localStorage`, `sessionStorage`, `IndexedDB`.
4. **Custom Client Hooks**: Hooks that depend on state or browser APIs (`useMediaQuery`, `useWindowSize`).
5. **Third-Party Interactive Libraries**: Libraries that rely on React class components or client hooks (e.g., interactive chart libraries, rich text editors).

### Do NOT use Client Components for:
- Fetching data from databases or backend APIs (use async Server Components).
- Formatting dates, numbers, or text strings (format on the server).
- Rendering static HTML markup, headers, footers, or article text.
- Accessing environment variables or secret keys.

---

## Common Mistakes

1. **Adding `"use client"` at the Top of Every Page**: Habitually adding `"use client"` to root page files out of habit from SPA frameworks. This turns the entire route tree into Client Components, inflating client JavaScript bundles and preventing direct database access.
   - *Fix*: Keep page components as Server Components by default. Push `"use client"` down to small interactive leaf components (e.g., a button, a search input, or a modal).
2. **Importing Server Modules into Client Components**: Attempting to import database clients or server data utilities into `"use client"` components, triggering build errors or leaking server code.
   - *Fix*: Guard server utilities with `import 'server-only'`. Pass server data to Client Components via serializable props or use React 19 Server Actions.
3. **Passing Non-Serializable Props across Boundaries**: Passing raw Mongoose database documents, class instances, or functions as props to Client Components, resulting in React serialization warnings.
   - *Fix*: Serialize database objects to plain JSON or string primitives (`createdAt.toISOString()`) before passing them across the server-client boundary.
4. **Making Misleading Claims About Bundle Overhead**: Claiming that Server Components run only in the browser or that Client Components never render on the server.
   - *Fix*: Be precise: Server Components run exclusively on the server and ship 0 bytes of component JS to the browser. Client Components pre-render initial HTML on the server and hydrate interactivity in the browser.

---

## Production Considerations

- **Client Bundle Auditing**: Use `@next/bundle-analyzer` periodically during development to verify that heavy dependencies (e.g., `moment.js`, `lodash`, or markdown renderers) remain restricted to Server Components.
- **Data Prunes Before Boundary Crossing**: When querying database collections that store sensitive columns (e.g., password hashes, internal telemetry), sanitize and prune the object fields inside your server data layer before passing the payload to Client Components.
- **Granular React Suspense Streaming**: Combine async Server Components with React 19 Suspense to stream dynamic UI chunks to the browser as soon as each database call resolves.

---

## Summary

The React Server Component architecture in Next.js 16 separates server-side data fetching and secret handling from client-side interactivity. By keeping pages and layouts as Server Components by default, guarding server modules with `server-only`, passing serializable props, and pushing `"use client"` down to interactive leaf nodes, developers build ultra-fast, secure web applications.

---

## Checklist
- [ ] Confirmed components in `app/` omit `"use client"` by default.
- [ ] Added `import 'server-only'` to all database access modules and private server utilities.
- [ ] Verified all props passed across server-to-client boundaries are fully serializable.
- [ ] Leveraged composition (passing Server Components as `children` props) when interleaving server content inside Client Component shells.
- [ ] Pushed `"use client"` down strictly to interactive leaf components.


---



# Appendix E: Security Checklist

*Appendix*

---

## Learning Objectives
- Execute a comprehensive security audit across Next.js 16 App Router applications.
- Verify authentication, authorization, secret management, input sanitization, and server operation protections.
- Eliminate common web security vulnerabilities (XSS, CSRF, IDOR, Mass Assignment).

---

## Overview & Core Explanation

Application security requires defending every layer of the technology stack—from client component execution boundaries to Server Actions, HTTP cookies, and database queries.

This appendix provides a pre-flight security audit checklist for Next.js 16 applications.

```text
                        SECURITY CHECKLIST PIPELINE
┌────────────────────────┬────────────────────────┬────────────────────────┐
│  SECRETS & COOKIES     │  AUTH & TENANT ISOLATION│  INPUTS & OPERATIONS   │
│                        │                        │                        │
│ • HttpOnly Cookies     │ • Server Action Authz  │ • Zod Schema Parsing   │
│ • NO NEXT_PUBLIC_ Keys │ • Tenant Filter (IDOR) │ • DOMPurify HTML XSS   │
│ • lib/env.ts Zod       │ • DAL Permission Guard │ • Rate Limiting (429)  │
└────────────────────────┴────────────────────────┴────────────────────────┘
```

---

## Production Security Checklist

### 1. Secret Management & Environment Security
- [ ] **No Secret Exposure**: Zero database URIs or private API keys feature the `NEXT_PUBLIC_` prefix.
- [ ] **Environment Validation**: `lib/env.ts` validates all environment variables using Zod during server startup.
- [ ] **Git Exclusion**: `.env*.local` and `.env.production` files are listed in `.gitignore`.
- [ ] **Fatal Secret Misconfigurations**: Server halts startup immediately if critical secrets (`AUTH_SECRET`, `MONGODB_URI`) are missing.

### 2. Authentication Architecture
- [ ] **HTTP-Only Cookies**: Session tokens stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies (never in `localStorage`).
- [ ] **Server Session Checks**: Async Server Components and DAL functions validate sessions using `cookies()` / `headers()`.
- [ ] **Client State Disregard**: Client-side state (`localStorage`, React state) is never trusted for authentication decisions.

### 3. Authorization & Tenant Isolation (Anti-IDOR)
- [ ] **Authoritative Action Security**: Every Server Action and Route Handler performs session authentication and role permission checks.
- [ ] **Tenant Isolation**: Every database read, update, and delete query appends `tenantId: session.tenantId` to prevent cross-tenant IDOR access.
- [ ] **UI Hiding as UX Only**: UI button hiding is treated strictly as UX convenience, never as security enforcement.

### 4. Input Validation & XSS Prevention
- [ ] **Zod Schema Parsing**: All form inputs and Server Action payloads pass through Zod schemas before database execution.
- [ ] **Mass Assignment Defense**: Form inputs are parsed through explicit whitelisted Zod schemas.
- [ ] **HTML Sanitization**: All HTML strings rendered with `dangerouslySetInnerHTML` are sanitized using `isomorphic-dompurify`.

### 5. Protecting Server Operations & Rate Limiting
- [ ] **Rate Limiting**: Sensitive endpoints (login, password reset, API routes) enforce rate limits (returning HTTP 429).
- [ ] **CSRF & Origin Verification**: Mutative Route Handlers verify HTTP `Origin` and `Host` headers.
- [ ] **Request Size Constraints**: Restricted request body payload sizes to prevent memory exhaustion DoS attacks.

---

## Practical Example

```typescript
// app/actions/project-guard.ts
"use server";

import { getSession } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/permissions";
import { deleteProjectById } from "@/lib/dal/projects-authz";

export async function deleteProjectAction(projectId: string) {
  // 1. Authoritative Session Check
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  // 2. Permission Check
  assertPermission(session, "project:delete");

  // 3. Tenant-Isolated Deletion (DAL)
  await deleteProjectById(projectId);

  return { success: true };
}
```

---

## Common Mistakes

1. **Prefixing Database Secrets with `NEXT_PUBLIC_`**: Exposing database URIs in client JavaScript bundles.
2. **Missing Tenant ID Filters in Queries**: Executing `findById(id)` without filtering by `session.tenantId`, exposing IDOR vulnerabilities.
3. **Storing Session Tokens in `localStorage`**: Exposing session tokens to XSS script extraction.

---

## Production Considerations

- **Security Headers**: Configure strict security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) in `next.config.ts`.
- **Dependency Auditing**: Run `npm audit` in CI/CD pipelines to catch known CVE vulnerabilities in npm dependencies.

---

## Summary

Executing this security checklist ensures that your Next.js 16 application is protected against XSS, CSRF, IDOR, and unauthorized data access.

---

## Checklist
- [ ] Stored session tokens in `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
- [ ] Enforced `tenantId: session.tenantId` on all database queries.
- [ ] Validated all inputs with Zod schemas inside Server Actions.
- [ ] Sanitized `dangerouslySetInnerHTML` usages with `isomorphic-dompurify`.


---



# Appendix F: Performance Checklist

*Appendix*

---

## Learning Objectives
- Execute a comprehensive performance audit across Next.js 16 App Router applications.
- Optimize Core Web Vitals metrics (LCP, INP, CLS).
- Minimize client JavaScript bundle sizes and database query latencies.

---

## Overview & Core Explanation

Performance directly impacts user retention, conversion rates, and search engine rankings.

This appendix provides an actionable performance audit checklist covering Server Components, Client Bundles, Images, Fonts, Caching, and Database Queries in Next.js 16.

```text
                       PERFORMANCE CHECKLIST PIPELINE
┌────────────────────────┬────────────────────────┬────────────────────────┐
│  SERVER COMPONENTS & JS│   IMAGES & FONTS       │   DATABASE & CACHING   │
│                        │                        │                        │
│ • "use client" at leaves│ • next/image AVIF/WebP │ • React.cache() DAL    │
│ • 0 KB heavy JS shift  │ • next/font self-host  │ • Batched $in queries  │
│ • Bundle Analyzer check│ • Responsive sizes     │ • revalidateTag cache  │
└────────────────────────┴────────────────────────┴────────────────────────┘
```

---

## Production Performance Checklist

### 1. Server Components & Client Bundle Footprint
- [ ] **Server Components First**: Components in `app/` omit `"use client"` by default.
- [ ] **Leaf Node Pushing**: `"use client"` directives are pushed down strictly to interactive leaf nodes.
- [ ] **Heavy Library Isolation**: Heavy parsing libraries (markdown, date tools) execute inside Server Components (0 KB client JS).
- [ ] **Bundle Analysis**: Client JavaScript bundle footprint audited using `@next/bundle-analyzer` (`ANALYZE=true npm run build`).
- [ ] **Lazy Loading**: Heavy client-only interactive components lazy-loaded using `next/dynamic(..., { ssr: false })`.

### 2. Media Assets & Web Vitals
- [ ] **Image Optimization**: Images use `<Image />` from `next/image` with responsive `sizes` hints.
- [ ] **Modern Image Formats**: Enabled `formats: ['image/avif', 'image/webp']` in `next.config.ts`.
- [ ] **LCP Hero Priority**: Above-the-fold hero images feature `priority={true}`.
- [ ] **CLS Prevention**: Images enforce explicit aspect ratios or `fill` with parent containers to prevent layout shifts.
- [ ] **Self-Hosted Fonts**: Fonts configured using `next/font/google` (`subsets: ['latin']`, `display: 'swap'`) with 0 external CDN calls.

### 3. Database & Server Latency
- [ ] **Connection Caching**: Mongoose / database connection promises cached on `globalThis` (`lib/db.ts`) with `bufferCommands: false`.
- [ ] **N+1 Query Elimination**: Data Access Layer uses batched `$in` queries or DataLoader to resolve child entities in 1 query.
- [ ] **Compound Indexing**: Database collections feature compound indexes matching exact query filter and sort shapes.
- [ ] **Lean DTO Queries**: Read-only queries append `.lean()` and `.select()` projection fields.
- [ ] **Request Memoization**: Custom ORM / DB queries wrapped with `React.cache()` for single-request deduplication.

### 4. Caching & Revalidation
- [ ] **Tagged Cache Functions**: Expensive server calculations wrap functions with `'use cache'` and `cacheTag()`.
- [ ] **On-Demand Revalidation**: Server Actions invoke `revalidateTag()` or `revalidatePath()` after database mutations.
- [ ] **Route Segment Options**: Static documentation routes set `export const revalidate = 3600`.

---

## Practical Example

```typescript
// lib/dal/batched-users.ts
import "server-only";

import { UserModel } from "@/lib/db/models";

export async function fetchUsersBatched(userIds: string[]) {
  const uniqueIds = [...new Set(userIds)];

  // Single batched $in lookup
  const users = await UserModel.find({ _id: { $in: uniqueIds } })
    .select("name email")
    .lean();

  return new Map(users.map((u) => [String(u._id), u.name]));
}
```

---

## Common Mistakes

1. **Placing `"use client"` at Page Root**: Converting entire route trees into Client Components, inflating client JavaScript bundles.
2. **N+1 Database Query Loops**: Executing individual database queries inside `for` loops.
3. **Omitting `sizes` on Responsive Images**: Serving desktop-resolution images to mobile device viewports.

---

## Production Considerations

- **Core Web Vitals Benchmarks**: Monitor production field metrics via Google Search Console or Vercel Speed Insights:
  - LCP < 2.5s
  - INP < 200ms
  - CLS < 0.1
- **Performance Budgets**: Enforce performance budgets on CI builds to alert developers when client bundle sizes increase.

---

## Summary

Executing this performance checklist ensures that your Next.js 16 application delivers sub-second paints, sub-100ms server responses, and minimal client JavaScript overhead.

---

## Checklist
- [ ] Shifted heavy library operations to Server Components.
- [ ] Audited client bundles with `@next/bundle-analyzer`.
- [ ] Eliminated N+1 database queries using batched `$in` lookups.
- [ ] Configured self-hosted fonts with `next/font`.


---
