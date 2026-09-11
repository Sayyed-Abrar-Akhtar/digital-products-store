# Chapter 32: Server vs Client Performance

*Part VII — Performance*

---

## Learning Objectives
- Master the performance trade-offs between Server Component rendering and Client Component execution in Next.js 16.
- Minimize client JavaScript bundle footprints by shifting data transformation and heavy dependencies to the server.
- Measure and optimize Server Component execution time and database latency.
- Analyze client bundle size using `@next/bundle-analyzer`.
- Optimize Web Vitals metrics: Interaction to Next Paint (INP), Largest Contentful Paint (LCP), and First Contentful Paint (FCP).

---

## Overview & Core Explanation

Performance in Next.js 16 App Router applications depends on understanding where computational work takes place: **Server Runtime** vs **Client Runtime**.

### The Core Performance Equilibrium

1. **Server-Side Rendering (RSC)**:
   - **Cost**: Server CPU execution time and database query latency.
   - **Benefit**: **0 KB of JavaScript shipped to the browser** for Server Components; instant HTML payload streaming; fast First Contentful Paint (FCP).
2. **Client-Side Hydration (`"use client"`)**:
   - **Cost**: Larger JavaScript bundle size; client browser CPU parsing and hydration time; higher Interaction to Next Paint (INP) latency on low-end mobile devices.
   - **Benefit**: Rich interactive state and instant client DOM event handling (`onClick`).

```
                              THE PERFORMANCE EQUILIBRIUM
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
│             SERVER PERFORMANCE               │              CLIENT PERFORMANCE              │
│                                              │                                              │
│ • Database Query Execution                   │ • JS Bundle Download & Parse Time            │
│ • Heavy Library Operations (e.g. Markdown)   │ • React DOM Hydration                        │
│ • HTML Stream Generation                     │ • Event Listener Binding                     │
│                                              │                                              │
│ Goal: Sub-100ms Database Queries             │ Goal: Minimal Client JS Bundle (<100KB)      │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## Heavy Dependency Isolation on the Server

A common client bundle inflation issue occurs when heavy parsing libraries (such as `marked`, `date-fns`, `lodash`, or `highlight.js`) are imported into Client Components.

### Anti-Pattern: Importing Heavy Markdown Parser in Client Component
```typescript
// BAD: app/_components/client-markdown.tsx
"use client";

import { parse } from "marked"; // Adding marked inflates client bundle by ~35KB!

export function ClientMarkdown({ content }: { content: string }) {
  const html = parse(content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### Production Pattern: Server-Side Parsing
Move the heavy library execution inside an async Server Component. The library code remains entirely on the server, shipping **0 KB** of parser JavaScript to the browser!

```typescript
// GOOD: app/_components/server-markdown.tsx (Server Component)
import { parse } from "marked"; // Executes strictly on Node.js server!
import DOMPurify from "isomorphic-dompurify";

export async function ServerMarkdown({ content }: { content: string }) {
  // Heavy computation executed on server
  const rawHtml = await parse(content);
  const cleanHtml = DOMPurify.sanitize(rawHtml);

  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}
```

---

## Analyzing Client Bundles with `@next/bundle-analyzer`

To identify heavy dependencies or accidental client boundary leaks, configure `@next/bundle-analyzer`.

### 1. Installation
```bash
npm install --save-dev @next/bundle-analyzer
```

### 2. Configuration (`next.config.ts`)

```typescript
// next.config.ts
import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default bundleAnalyzer(nextConfig);
```

### 3. Running Analysis
```bash
ANALYZE=true npm run build
```

This generates an interactive visual tree map in your browser displaying the exact byte footprint of every JavaScript package in your client bundles.

---

## Core Web Vitals Optimization Matrix

| Web Vitals Metric | Description | Primary Bottleneck | Next.js 16 Optimization Solution |
| :--- | :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | Time until largest above-the-fold content block renders | Slow server database calls or heavy un-sized images | Use `<Image priority />` + Suspense streaming for fast layout shell paint. |
| **INP (Interaction to Next Paint)** | Latency of page responsiveness to user interactions | Heavy client JS hydration / main thread blocking | Push `"use client"` down to leaf components; minimize client JS bundle size. |
| **CLS (Cumulative Layout Shift)** | Visual instability caused by dynamic layout shifts | Missing image aspect ratios or dynamic un-sized skeletons | Use explicit aspect ratios on `<Image />` and matching skeleton heights in `loading.tsx`. |

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

1. **Importing Server Utilities into Client Modules**: Importing heavy data formatting modules into Client Components, pulling server libraries into client bundles.
   - *Fix*: Format strings and dates on the server before passing plain strings as props.
2. **Performing Expensive Calculations During Client Render**: Running heavy sorting or filtering algorithms inside Client Components on every re-render without `useMemo()`.
3. **Neglecting Mobile CPU Benchmarks**: Testing application performance exclusively on high-end developer workstations without throttling CPU speeds to simulate low-end mobile hardware.

---

## Production Considerations

- **Bundle Size Budgeting**: Establish a performance budget (e.g. maximum 100 KB total initial client JavaScript) and fail CI builds if bundle size exceeds thresholds.
- **Dynamic Module Imports**: Lazy-load heavy client-only interactive widgets (such as interactive chart libraries or rich text editors) using `next/dynamic` with `{ ssr: false }`.
- **Edge Runtime Execution**: Evaluate moving lightweight API routes or middleware to the Edge runtime (`export const runtime = 'edge'`) to achieve sub-20ms global execution latencies.

---

## Summary

Optimizing performance in Next.js 16 requires balancing server rendering against client hydration. By isolating heavy libraries in Server Components, analyzing client bundles with `@next/bundle-analyzer`, and tuning Core Web Vitals (LCP, INP, CLS), you deliver ultra-fast web applications.

---

## Checklist
- [ ] Kept heavy data transformation and markdown parsing libraries inside Server Components.
- [ ] Configured `@next/bundle-analyzer` to monitor client JavaScript bundle footprints.
- [ ] Lazy-loaded non-critical interactive Client Components using `next/dynamic`.
- [ ] Optimized Largest Contentful Paint (LCP) using `<Image priority />` and streaming Suspense boundaries.
- [ ] Verified initial client JavaScript bundle size remains under performance budgets.
