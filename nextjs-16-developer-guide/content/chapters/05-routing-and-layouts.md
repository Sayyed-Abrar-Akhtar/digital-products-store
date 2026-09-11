# Chapter 5: Routing and Layouts

*Part I — Modern Next.js*

---

## Learning Objectives
- Master the App Router file-system routing architecture in Next.js 16 (target 16.3.4).
- Understand static routes, dynamic segments `[slug]`, catch-all segments `[...slug]`, optional catch-all segments `[[...slug]]`, and Route Groups `(group)`.
- Differentiate between persistent layouts (`layout.tsx`) and un-persisted re-mounting templates (`template.tsx`).
- Leverage special boundary files (`loading.tsx`, `error.tsx`, `not-found.tsx`) to build resilient UI streams with automatic React 19 Suspense integration.
- Implement client navigation (`Link`, `useRouter`) vs server redirection (`redirect`, `permanentRedirect`) and understand layout state persistence.
- Handle Next.js 16 asynchronous parameter contracts (`Promise<params>` and `Promise<searchParams>`) correctly in pages and layouts.

---

## Overview & Core Explanation

Routing in Next.js 16 is entirely file-system based within the `app/` directory. Each directory represents a path segment in the URL hierarchy, and special reserved filenames determine how that segment is rendered, decorated, streamed, or handled when errors occur.

Unlike the legacy Pages Router (where routes were defined by `pages/about.js` or `pages/api/users.js`), the App Router uses folder hierarchies to define routes, requiring an explicit `page.tsx` file to render UI publicly at that segment.

### File-System Route Definitions & Segment Types

Next.js 16 supports multiple route segment types to handle static pages, parameter-driven dynamic content, catch-all patterns, and route grouping without altering URL paths.

```
app/
 ├── page.tsx                           --> Route: '/'
 ├── about/
 │    └── page.tsx                      --> Route: '/about'
 ├── (marketing)/                       --> Route Group (omitted from URL)
 │    ├── contact/
 │    │    └── page.tsx                 --> Route: '/contact'
 │    └── pricing/
 │         └── page.tsx                 --> Route: '/pricing'
 └── store/
      ├── [category]/                   --> Dynamic Segment
      │    └── page.tsx                 --> Route: '/store/electronics', '/store/books'
      ├── docs/[...slug]/               --> Catch-all Dynamic Segment
      │    └── page.tsx                 --> Route: '/store/docs/v1/intro', '/store/docs/api/auth'
      └── optional/[[...tags]]/         --> Optional Catch-all Dynamic Segment
           └── page.tsx                 --> Route: '/store/optional', '/store/optional/react/nextjs'
```

| Route Segment Pattern | Directory Syntax | Example URL Matching | `params` Promise Payload |
| :--- | :--- | :--- | :--- |
| **Static Route** | `app/about/` | `/about` | `{}` |
| **Dynamic Segment** | `app/store/[category]/` | `/store/electronics` | `{ category: "electronics" }` |
| **Catch-all Segment** | `app/docs/[...slug]/` | `/docs/v1/setup` | `{ slug: ["v1", "setup"] }` |
| **Optional Catch-all** | `app/docs/[[...slug]]/` | `/docs` OR `/docs/v1/setup` | `{}` OR `{ slug: ["v1", "setup"] }` |
| **Route Group** | `app/(shop)/products/` | `/products` | `{}` (Group name `(shop)` omitted from URL) |

### Asynchronous Parameter Contracts in Next.js 16

A major architectural contract in Next.js 16 (16.3.4) is that `params` and `searchParams` supplied to pages, layouts, and route handlers are typed as asynchronous **Promises**. This allows Next.js to start rendering and streaming component trees before dynamic route parameter resolution or URL search query parsing finishes on the server.

```typescript
// Next.js 16 Page Signature
export interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  // MUST await params and searchParams before accessing properties
  const { slug } = await params;
  const { tab = "overview" } = await searchParams;

  return (
    <div>
      Slug: {slug} | Tab: {tab}
    </div>
  );
}
```

---

## Layouts vs. Templates & Persistence Architecture

The App Router introduces two distinct mechanisms for nesting UI components across sub-routes: **Layouts** (`layout.tsx`) and **Templates** (`template.tsx`).

### Persistent Layouts (`layout.tsx`)
Layouts wrap child route segments and persist across navigation. When a user navigates between sibling sub-routes sharing the same layout (e.g., from `/dashboard/projects` to `/dashboard/settings`), the layout component **remains mounted**, preserving its internal client-side state, scroll position, and active DOM nodes.

- Layouts accept a `children` prop containing child pages or sub-layouts.
- Layouts can perform asynchronous server data fetching.
- Root layout (`app/layout.tsx`) is mandatory and must contain `<html>` and `<body>` tags.

```
[RootLayout] -> [DashboardLayout (Persisted)] -> [ProjectsPage]
                                                    ↓ User clicks '/dashboard/settings'
[RootLayout] -> [DashboardLayout (Persisted)] -> [SettingsPage]
```

### Un-persisted Re-mounting Templates (`template.tsx`)
Templates wrap child routes identically to layouts, but create a **brand-new component instance on every route transition**. When navigating between routes that share a template, React unmounts the existing template tree and mounts a fresh instance.

- Useful for page entry/exit CSS animations, logging page-view analytics events on route change, or resetting stateful input forms on navigation.

| Feature | Layout (`layout.tsx`) | Template (`template.tsx`) |
| :--- | :--- | :--- |
| **DOM Instance Across Route Changes** | Preserved (remains mounted) | Recreated (unmounts & remounts) |
| **Client Hook State (`useState`)** | Retained during sibling route navigation | Reset on every route navigation |
| **Primary Use Cases** | Persistent navigation bars, sidebars, header/footer shells | Page transition animations, fresh form state, analytics tracking |

---

## Boundary File Conventions: Suspense, Errors, and 404s

Special reserved files wrap page components in boundary wrappers automatically.

```
+-----------------------------------------------------------------------+
|                       app/dashboard/layout.tsx                        |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  |                    app/dashboard/error.tsx                      |  |
|  |                      ('use client' boundary)                    |  |
|  |                                                                 |  |
|  |  +-----------------------------------------------------------+  |  |
|  |  |                 app/dashboard/loading.tsx                 |  |  |
|  |  |                 (React 19 Suspense Fallback)               |  |  |
|  |  |                                                           |  |  |
|  |  |  +-----------------------------------------------------+  |  |  |
|  |  |  |               app/dashboard/page.tsx                |  |  |  |
|  |  |  |               (Server Component Page)               |  |  |  |
|  |  |  +-----------------------------------------------------+  |  |  |
|  |  +-----------------------------------------------------------+  |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

1. **`loading.tsx`**: Wraps the route segment in a React 19 `Suspense` fallback boundary. When a Server Component page performs async data fetching, Next.js instantly streams the loading UI to the client while server data resolves.
2. **`error.tsx`**: Wraps the route segment in a React Error Boundary. Must be a Client Component (`'use client'`). Receives `error` (the thrown `Error` instance) and a `reset()` function to attempt re-rendering the segment without reloading the page.
3. **`not-found.tsx`**: Rendered when the `notFound()` utility function is triggered within a Server Component or when a route fails segment resolution.

---

## Client Navigation vs. Server Navigation

Next.js 16 provides multiple mechanisms for navigating between routes:

### 1. Declarative Client Navigation (`<Link>`)
The `<Link>` component from `next/link` performs soft client-side navigation, updating the URL and rendering the target route without performing a full browser page refresh. Next.js automatically pre-fetches linked routes in the background when they enter the viewport.

```typescript
import Link from "next/link";

export function NavigationBar() {
  return (
    <nav className="flex gap-4">
      <Link href="/dashboard" className="text-primary hover:underline">
        Overview
      </Link>
      <Link href="/dashboard/projects" className="text-primary hover:underline">
        Projects
      </Link>
    </nav>
  );
}
```

### 2. Programmatic Client Navigation (`useRouter`)
Used inside Client Components (`'use client'`) for navigation following imperative actions (e.g., button clicks, form handlers).

```typescript
"use client";

import { useRouter } from "next/navigation";

export function RedirectButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/dashboard/projects")}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
    >
      Go to Projects
    </button>
  );
}
```

### 3. Server Redirection (`redirect` & `permanentRedirect`)
Used inside Server Components, Server Actions, or Route Handlers to perform server-directed navigation. Executed before response rendering finishes.

```typescript
import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth";

export default async function AdminPage() {
  const isAuthorized = await checkAuth();
  if (!isAuthorized) {
    redirect("/auth/login?reason=unauthorized");
  }

  return <div>Welcome Admin</div>;
}
```

---

## Practical Example

In our reference **Acme App**, we construct a nested project details route (`app/dashboard/projects/[slug]/page.tsx`) that consumes dynamic route parameters and search query params asynchronously in Next.js 16.

### Dynamic Route Component (`app/dashboard/projects/[slug]/page.tsx`)
```typescript
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProjectBySlug } from "@/lib/projects";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  // Await asynchronous params and searchParams per Next.js 16 requirement
  const { slug } = await params;
  const search = await searchParams;
  const tab = typeof search.tab === "string" ? search.tab : "overview";

  const project = await fetchProjectBySlug(slug);
  if (!project) {
    // Triggers nearest app/dashboard/not-found.tsx or global 404
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        <Link href="/dashboard/projects" className="text-sm text-primary hover:underline">
          &larr; Back to List
        </Link>
      </div>

      {/* Navigation Tabs updating searchParams */}
      <div className="flex gap-4 border-b pb-2">
        <Link
          href={`/dashboard/projects/${slug}?tab=overview`}
          className={`text-sm font-medium ${tab === "overview" ? "text-primary border-b-2 border-primary pb-2" : "text-muted-foreground"}`}
        >
          Overview Tab
        </Link>
        <Link
          href={`/dashboard/projects/${slug}?tab=deploys`}
          className={`text-sm font-medium ${tab === "deploys" ? "text-primary border-b-2 border-primary pb-2" : "text-muted-foreground"}`}
        >
          Deployments Tab
        </Link>
      </div>

      <div className="p-4 border rounded-lg bg-card text-card-foreground">
        <p className="text-sm mb-2">
          <strong>Environment:</strong> {project.environment} | <strong>Region:</strong> {project.region}
        </p>
        {tab === "overview" ? (
          <div>
            <p className="text-sm text-muted-foreground">Active production workspace tracking real-time server telemetry.</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm">Total deployments recorded: <strong>{project.deployCount}</strong></p>
            <p className="text-xs text-muted-foreground">Last deployment: {project.lastDeployedAt}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Common Mistakes

1. **Accessing `params` or `searchParams` Synchronously in Next.js 16**: Writing `const { slug } = props.params` without `await`. In Next.js 16.3.4, `params` and `searchParams` are typed as Promises. Accessing them synchronously will fail TypeScript compilation (`tsc --noEmit`) or trigger runtime warnings.
   - *Fix*: Declare props as `params: Promise<{ slug: string }>` and `await params` inside async components.
2. **Importing Navigation Utilities from Legacy `next/router`**: Importing `useRouter` from `next/router` instead of `next/navigation`. `next/router` belongs strictly to the legacy Pages Router and throws runtime exceptions in the `app/` directory.
   - *Fix*: Always import `useRouter`, `usePathname`, `useSearchParams`, `redirect`, and `notFound` from `next/navigation`.
3. **Placing `<html>` and `<body>` Tags in Sub-Layouts**: Defining root HTML elements inside nested layouts (e.g., `app/dashboard/layout.tsx`).
   - *Fix*: `<html>` and `<body>` tags must reside strictly in the top-level `app/layout.tsx` root layout.
4. **Omitting `'use client'` on Error Boundaries**: Creating `error.tsx` as a Server Component. Because error boundaries rely on React error catching hooks, Next.js requires `error.tsx` files to be Client Components.
   - *Fix*: Add `'use client'` at line 1 of every `error.tsx` file.

---

## Production Considerations

- **Granular Loading UI**: Avoid relying solely on a global `app/loading.tsx`. Place granular `loading.tsx` skeletons deep inside sub-route folders (e.g., `app/dashboard/projects/loading.tsx`) so that parent layouts (navigation bars, sidebars) remain interactive while individual dynamic pages finish streaming.
- **Route Group Isolation**: Use Route Groups `(marketing)` and `(dashboard)` to apply distinct layout structures (e.g., full-width landing layout vs. side-nav dashboard layout) to different parts of your application without adding unnecessary prefix segments to public URLs.
- **Custom 404 Handling with `notFound()`**: Invoke `notFound()` inside dynamic route components whenever database entities are missing or invalid. This presents consistent UI using `not-found.tsx` while returning proper HTTP 404 status codes to search engines.

---

## Summary

Next.js 16 file-system routing in the App Router offers powerful declarative primitives (`layout.tsx`, `template.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`). By treating `params` and `searchParams` as asynchronous Promises, building nested persistent layouts, and leveraging client navigation utilities from `next/navigation`, developers build fast, accessible web applications.

---

## Checklist
- [ ] Verified `params` and `searchParams` are declared as `Promise` types and `await`ed in all Next.js 16 pages/layouts.
- [ ] Confirmed root layout in `app/layout.tsx` is the sole file containing `<html>` and `<body>` tags.
- [ ] Ensured all `error.tsx` files begin with `'use client'`.
- [ ] Evaluated layout state persistence vs. template re-mounting behavior.
- [ ] Replaced legacy `next/router` imports with `next/navigation`.
