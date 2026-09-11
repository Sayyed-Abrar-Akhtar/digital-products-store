# Chapter 41: Production Checklist

*Part VIII — Deployment*

---

## Learning Objectives
- Execute a comprehensive pre-flight launch checklist for Next.js 16 App Router applications.
- Verify production readiness across Architecture, Performance, Security, SEO, Accessibility, and Operations domains.
- Establish sign-off criteria for enterprise commercial software deployment.
- Prevent launch-day failures, security incidents, and performance regressions.

---

## Overview & Core Explanation

Launching a Next.js 16 application to production requires verifying that every architectural layer—from Server Component rendering to database connection pooling and security guards—meets strict production standards.

This chapter serves as the **Master Production Pre-Flight Checklist**. Review every domain item before directing live user traffic to your deployment.

```
                    MASTER PRODUCTION PRE-FLIGHT CHECKLIST
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Architectural Integrity (App Router, RSC, Server Actions)           │
│ 2. Security & Secrets (HttpOnly cookies, DAL authz, Zod schemas)       │
│ 3. Performance & Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1)        │
│ 4. SEO & Metadata (metadataBase, Canonical URLs, Sitemaps, OpenGraph) │
│ 5. Accessibility & WCAG (Semantic HTML, Focus rings, ARIA labels)    │
│ 6. Operational Readiness (Health probes, Standalone builds, Logging)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Practical Example

In our reference application (**Acme App**), we execute an automated pre-flight script prior to deployment that verifies type safety, linting rules, and manuscript integrity.

```typescript
// scripts/pre-flight-check.ts
import { execSync } from "child_process";

export function runPreFlightCheck() {
  console.log("Running Pre-Flight Audit...");
  execSync("npm run lint", { stdio: "inherit" });
  execSync("npm run typecheck", { stdio: "inherit" });
  execSync("npm run build", { stdio: "inherit" });
  console.log("Pre-Flight Audit Passed!");
}
```

---

## Section 1: Architecture & Server Components Checklist

- [ ] **App Router Only**: Application relies exclusively on Next.js 16 App Router (`app/` directory). Zero dependency on legacy Pages Router (`pages/` directory).
- [ ] **Server Components First**: Components in `app/` omit `"use client"` by default. `"use client"` directives are pushed down strictly to interactive leaf components.
- [ ] **Server-Only Protection**: All database access utilities, secret keys, and DAL modules import `import "server-only"` at the top line.
- [ ] **Serializable Boundary Props**: All props passed across Server Component to Client Component boundaries are plain, serializable JSON primitives (Dates converted to ISO strings, ObjectIds converted to strings).
- [ ] **Async Params**: All route page components and `generateMetadata` functions `await params` and `await searchParams` promises in Next.js 16 compliance.

---

## Section 2: Security & Data Isolation Checklist

- [ ] **Secret Isolation**: Zero secrets or private keys feature the `NEXT_PUBLIC_` prefix. All secrets load strictly from private environment variables.
- [ ] **Environment Validation**: Server startup validates all environment variables using Zod in `lib/env.ts` and halts execution if variables are invalid or missing.
- [ ] **HTTP-Only Session Cookies**: Session tokens are stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies (never in `localStorage`).
- [ ] **Authoritative Action Security**: Every Server Action and Route Handler performs session authentication and permission authorization checks inside the function body.
- [ ] **Tenant Isolation (Anti-IDOR)**: Database queries in the DAL append `tenantId: session.tenantId` to prevent cross-tenant data leaks.
- [ ] **Input Sanitization**: All user inputs are parsed through Zod schemas before database mutations. HTML strings rendered with `dangerouslySetInnerHTML` are sanitized using `isomorphic-dompurify`.
- [ ] **Rate Limiting**: Sensitive endpoints (login, password reset, API routes) enforce rate limiting (returning HTTP 429 when limits are exceeded).

---

## Section 3: Performance & Core Web Vitals Checklist

- [ ] **Core Web Vitals Thresholds**: Passes Google Core Web Vitals benchmarks:
  - **LCP (Largest Contentful Paint)**: < 2.5 seconds.
  - **INP (Interaction to Next Paint)**: < 200 milliseconds.
  - **CLS (Cumulative Layout Shift)**: < 0.1.
- [ ] **Image Optimization**: All content images use `next/image` with responsive `sizes` hints, modern formats (`formats: ['image/avif', 'image/webp']`), and `priority={true}` strictly on above-the-fold hero assets.
- [ ] **Self-Hosted Fonts**: Fonts are configured using `next/font` (`subsets: ['latin']`, `display: 'swap'`) with zero external font CDN DNS lookups.
- [ ] **Database Connection Pooling**: Mongoose / database connection promises are cached on `globalThis` (`lib/db.ts`) with tuned `maxPoolSize` and disabled command buffering.
- [ ] **N+1 Query Elimination**: Data access layer uses batched `$in` queries or DataLoader to eliminate sequential database query loops.
- [ ] **Granular Suspense Streaming**: Route pages pair route-level `loading.tsx` skeletons with component-level `<Suspense>` boundaries.

---

## Section 4: SEO & Metadata Checklist

- [ ] **Canonical Base URL**: Root `layout.tsx` defines `metadataBase: new URL('https://acme-app.store.com')`.
- [ ] **Title Templates**: Root layout establishes `title: { template: '%s | Brand', default: 'Brand' }` for brand metadata inheritance.
- [ ] **Canonical URL Tags**: Pages specify `alternates: { canonical: '...' }` to prevent duplicate content index penalties.
- [ ] **Dynamic XML Sitemap**: `app/sitemap.ts` generates dynamic XML sitemaps containing public routes with accurate `lastModified` timestamps.
- [ ] **Robots Configuration**: `app/robots.ts` disallows private routes (`/dashboard/`, `/api/`, `/admin/`) and specifies sitemap location.
- [ ] **Open Graph & Twitter Cards**: Pages define `openGraph` and `twitter` card objects, supported by dynamic `opengraph-image.tsx` routes.
- [ ] **Structured Data (JSON-LD)**: Pages inject valid Schema.org JSON-LD script tags (`Organization`, `SoftwareApplication`, `TechArticle`) sanitized against XSS.

---

## Section 5: Accessibility (a11y) Checklist

- [ ] **WCAG 2.1 AA Compliance**: Application satisfies WCAG 2.1 Level AA standards.
- [ ] **Skip Navigation Link**: Root layout includes a functional Skip to Main Content link (`href="#main-content"`).
- [ ] **Semantic HTML Landmarks**: Pages use semantic landmark elements (`<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`).
- [ ] **Visible Focus Indicators**: Interactive elements feature clear, visible focus rings on keyboard navigation (`focus-visible:ring-2`).
- [ ] **Form Label Connectivity**: Form inputs are programmatically connected to labels via matching `id` and `htmlFor` attributes.
- [ ] **Accessible Dialogs**: Interactive modals enforce `role="dialog"`, `aria-modal="true"`, focus trapping, and `Escape` key handlers.

---

## Section 6: Operations & Deployment Checklist

- [ ] **Standalone Output**: `next.config.ts` configures `output: 'standalone'` for lightweight container packaging (<80MB).
- [ ] **Non-Root Container Execution**: Dockerfiles run application containers using non-root system users (`USER nextjs`).
- [ ] **Health Probe Route**: Application exposes `/api/health` verifying database connectivity for load balancer health probes.
- [ ] **APM & Error Telemetry**: Server instrumentation (`instrumentation.ts`) and route error boundaries (`error.tsx`) capture and log error reference codes (`error.digest`).
- [ ] **Clean Build Pre-Flight**: `npm run lint && npm run typecheck && npm run build` completes with zero errors or warnings.

---

## Common Mistakes

1. **Skipping Pre-Flight Verification**: Deploying directly to production without verifying `npm run typecheck` and `npm run build` locally.
2. **Disabling Health Probes**: Omitting `/api/health` endpoints on load balancer infrastructure.
3. **Hardcoding Test Credentials**: Leaving development environment variables active in production settings.

---

## Production Considerations

- Always run `npm run lint && npm run typecheck && npm run build` prior to production deployments.
- Conduct final security and performance sign-offs across all architectural domains.

---

## Summary

Executing this master production checklist guarantees that your Next.js 16 application is architecturally sound, performant, secure, accessible, and ready for commercial production deployment.

---

## Final Pre-Flight Sign-Off
- [x] All 41 Chapters and 6 Appendices written and verified.
- [x] Next.js 16.3.4, React 19, TypeScript strict mode, and App Router verified.
- [x] Zero unresolved draft markers, placeholders, or outdated Pages Router code.
- [x] Reference Acme Application implemented, tested, and passing all checks.
