# Changelog

All notable changes to the "Practical Next.js 16 Developer Guide" project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-03-29

### Added
- Advanced production manuscript content for **Part I — Modern Next.js** (Chapters 4–6):
  - `04-project-structure.md`: Mandatory framework file-system conventions (`app/`, `public/`) vs application-level conventions (`components/`, `lib/`, `services/`, `types/`); architectural trade-offs across route-oriented, feature-oriented, and layered organizational paradigms; server data access boundaries with `import 'server-only'`; runtime environment schema validation avoiding unsafe hardcoded fallback secrets.
  - `05-routing-and-layouts.md`: Comprehensive App Router file-system routing in Next.js 16; static, dynamic (`[slug]`), catch-all (`[...slug]`), optional catch-all (`[[...slug]]`), and Route Group (`(group)`) segment types; persistent layouts (`layout.tsx`) vs re-mounting templates (`template.tsx`); special boundary files (`loading.tsx`, `error.tsx`, `not-found.tsx`); declarative `<Link>` vs `useRouter` vs server `redirect`; Next.js 16 asynchronous `Promise<params>` and `Promise<searchParams>` contracts.
  - `06-server-components.md`: Deep mental model of React 19 Server Components; dual runtime model (Server Runtime vs Client Runtime); RSC binary payload streaming; `"use client"` execution boundaries; composition patterns (passing Server Components as `children` into Client Components); props serialization requirements; secret protection with `server-only`; clear criteria for when Client Components are strictly required.
- Extended Acme App reference implementation (`examples/acme-app/`):
  - Added server-side data access layer in `lib/projects.ts` protected by `server-only`.
  - Added nested dashboard layout (`app/dashboard/layout.tsx`), overview page (`app/dashboard/page.tsx`), and projects list page (`app/dashboard/projects/page.tsx`).
  - Added dynamic route segment page (`app/dashboard/projects/[slug]/page.tsx`) with async `params` and `searchParams` contracts.
  - Added streaming loading skeleton (`app/dashboard/projects/loading.tsx`), interactive client error boundary (`app/dashboard/error.tsx`), and custom 404 handler (`app/dashboard/not-found.tsx`).
  - Added route-local interactive leaf Client Component (`app/dashboard/projects/_components/status-toggle.tsx`).

---

## [0.1.0] - 2026-03-06

### Added
- Initial manuscript repository architecture (`nextjs-16-developer-guide/`).
- Centralized product metadata in `content/metadata.json` and TypeScript accessor `content/metadata.ts`.
- Master Table of Contents in `content/toc.md` covering 8 Parts, 41 Chapters, and 6 Appendices.
- Full production manuscript content for **Part I — Modern Next.js**:
  - `01-what-nextjs-16-is.md`: Next.js 16.3.4 & React 19 architecture, RSC binary payload streaming, Turbopack default engine, explicit caching with Cache Components and `'use cache'`, uncached fetch defaults, edge Routing Proxy vs Middleware, and Pages vs App router analysis.
  - `02-creating-a-nextjs-16-project.md`: Scaffolding, Node.js `>=20.0.0` prerequisites, `tsconfig.json` bundler resolution, `next.config.ts`, secure environment schema validation excluding hardcoded fallback secrets, and CI checks.
  - `03-understanding-the-app-router.md`: Special file conventions, nested layout state preservation, edge Routing Proxy request interception, async dynamic `params`/`searchParams` contract, and error boundaries.
- Outline template files for Chapters 4–41 and Appendices A–F in `content/chapters/`.
- Compilable Next.js 16.3.4 App Router reference application ("Acme App") in `examples/acme-app/` featuring environment configuration schemas (`lib/env.ts`), ESLint v9 Flat Config (`eslint.config.mjs`), `.env.example` template, and `next.config.ts`.
- Automated manuscript validation script in `scripts/validate-manuscript.ts`.
- Cover Specification in `assets/cover-spec.md`.
- Free Sample Strategy outline in `docs/free-sample-strategy.md`.
- Project license notice in `LICENSE.md`.
