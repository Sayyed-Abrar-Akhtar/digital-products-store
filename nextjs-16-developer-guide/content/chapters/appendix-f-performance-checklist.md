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
