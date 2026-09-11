# Appendix A: Recommended Project Structure

*Appendix*

---

## Learning Objectives
- Master the production-ready project folder hierarchy for Next.js 16 App Router applications.
- Separate presentation components, server data access layers, actions, and validation schemas.
- Enforce strict server-client boundaries through file organization conventions.

---

## Overview & Core Explanation

A clean project directory structure prevents architectural decay, eliminates circular dependencies, and clarifies server vs client boundaries.

In Next.js 16, application code is organized into root-level domain folders paired with the App Router (`app/`) directory.

```text
my-nextjs-16-app/
├── app/                           <-- App Router directory (Routes & Layouts)
│   ├── (auth)/                    <-- Route Group (Un-bracketed layout group)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── actions/                   <-- Public Server Actions ('use server')
│   │   ├── auth-actions.ts
│   │   └── project-actions.ts
│   ├── api/                       <-- Route Handlers (HTTP Endpoints)
│   │   ├── health/
│   │   │   └── route.ts
│   │   └── revalidate/
│   │       └── route.ts
│   ├── dashboard/                 <-- Dashboard Route Segment
│   │   ├── _components/           <-- Route-private components (Omitted from routing)
│   │   │   ├── client-drawer.tsx
│   │   │   └── status-filter.tsx
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   ├── not-found.tsx
│   │   │   │   ├── opengraph-image.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── error.tsx          <-- Route error boundary ('use client')
│   │   │   ├── loading.tsx        <-- Route loading skeleton
│   │   │   └── page.tsx
│   │   ├── layout.tsx             <-- Dashboard nested layout
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css                <-- Global CSS variables & Tailwind directives
│   ├── layout.tsx                 <-- Root layout (Server Component)
│   ├── not-found.tsx              <-- Global 404 handler
│   ├── page.tsx                   <-- Landing page
│   ├── robots.ts                  <-- Dynamic robots.txt generator
│   └── sitemap.ts                 <-- Dynamic sitemap.xml generator
├── components/                    <-- Global shared UI components
│   └── ui/                        <-- Reusable UI primitives (Button, Input, Card)
│       ├── button.tsx
│       └── input.tsx
├── lib/                           <-- Core business logic, DB, & DAL
│   ├── dal/                       <-- Data Access Layer ('server-only')
│   │   ├── projects.ts
│   │   └── users.ts
│   ├── db/                        <-- Database connections & Mongoose models
│   │   ├── models/
│   │   │   └── project.ts
│   │   ├── serialize.ts
│   │   └── index.ts               <-- Connection caching (lib/db.ts)
│   ├── validation/                <-- Zod validation schemas
│   │   └── project-schema.ts
│   ├── env.ts                     <-- Zod environment variable validation
│   └── utils.ts                   <-- Utility functions (cn, clsx)
├── public/                        <-- Static public assets (Images, SVGs)
│   ├── logo.png
│   └── favicon.ico
├── tests/                         <-- Unit & integration tests
│   └── dal.test.ts
├── .env.example                   <-- Public template for required env vars
├── .gitignore                     <-- Ignored files (.env*.local, node_modules)
├── eslint.config.mjs              <-- ESLint flat config
├── next.config.ts                 <-- Next.js 16 configuration
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts             <-- Tailwind CSS configuration
└── tsconfig.json                  <-- TypeScript strict configuration
```

---

## Practical Example

Next.js App Router treats folders inside `app/` as public route segments by default. To prevent co-located helper components from accidentally becoming URL routes, prefix private helper folders with an underscore (`_components`).

Folder paths starting with `_` are completely ignored by the App Router routing engine.

```typescript
// app/dashboard/_components/client-drawer.tsx
"use client";

export function ClientDrawer() {
  return <div className="p-4 border">Interactive Helper Drawer</div>;
}
```

---

## Common Mistakes

1. **Placing Business & DB Logic Inside `app/` Route Files**: Writing raw database queries directly inside `page.tsx` instead of isolating queries in `lib/dal/`.
2. **Exposing Helper Routes Unintentionally**: Creating `app/dashboard/components/button.tsx` without an underscore, causing Next.js to register `/dashboard/components/button` as an accessible page route.
3. **Hardcoding Client Components in Layout Roots**: Adding `"use client"` to `app/layout.tsx` to use hooks, turning the entire application route tree into Client Components.

---

## Production Considerations

- **Colocation vs Shared Modules**: Keep route-specific UI components co-located inside `app/route/_components/`. Move UI components to root `components/ui/` only when used across 2 or more distinct route segments.
- **Strict Server Layer Guarding**: Every file inside `lib/dal/` and `lib/db/` must begin with `import "server-only"`.

---

## Summary

A production Next.js 16 project structure enforces clear separation between route segments (`app/`), shared UI primitives (`components/ui/`), business logic and Data Access Layers (`lib/dal/`), and static assets (`public/`). Following this structure guarantees scalable, maintainable codebases.

---

## Checklist
- [ ] Isolated server database operations inside `lib/dal/` with `import "server-only"`.
- [ ] Used `_components` naming convention for private co-located route helper components.
- [ ] Placed shared reusable UI primitives inside `components/ui/`.
- [ ] Preserved `app/layout.tsx` as an async Server Component.
- [ ] Kept static assets in `public/` under 1MB total size.
