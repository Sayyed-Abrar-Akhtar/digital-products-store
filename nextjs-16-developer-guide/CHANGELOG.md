# Changelog

All notable changes to the "Practical Next.js 16 Developer Guide" project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
