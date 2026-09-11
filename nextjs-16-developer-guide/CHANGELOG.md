# Changelog

All notable changes to the "Practical Next.js 16 Developer Guide" project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-03-30

### Added
- **Official Commercial Publication Release (V1.0.0)**.
- **Complete 41-Chapter Manuscript & 6 Appendices**:
  - **Part I — Modern Next.js** (Chapters 1–5): Core Next.js 16 architecture, project creation, App Router, project structure, routing & layouts.
  - **Part II — React Architecture** (Chapters 6–10): Server Components, Client Components, Composition Patterns, Loading/Streaming/Suspense, Error & Not-Found handling.
  - **Part III — Data** (Chapters 11–15): Data Fetching, Server-Side Data Access, Mutations & Server Actions, MongoDB/Mongoose, Caching & Revalidation.
  - **Part IV — Production UI** (Chapters 16–20): Styling with Tailwind CSS, Forms & Validation, Accessibility (WCAG 2.1 AA), Images & Fonts, Responsive Design.
  - **Part V — SEO** (Chapters 21–26): Metadata, Canonical URLs, Sitemap & robots.txt, Open Graph, Structured Data (JSON-LD), Internal Linking.
  - **Part VI — Security** (Chapters 27–31): Authentication Architecture, Authorization & Tenant Isolation, Protecting Server Operations, Env Vars & Secrets, Common Security Mistakes.
  - **Part VII — Performance** (Chapters 32–36): Server vs Client Performance, JavaScript & Hydration, Images & Assets, Database Performance, Production Optimization.
  - **Part VIII — Deployment** (Chapters 37–41): Environment Configuration, Production Builds, Deployment, Debugging Production Issues, Master Production Checklist.
  - **Appendices A–F**: Recommended Project Structure, Useful Commands, Deployment Checklist, SEO Checklist, Security Checklist, Performance Checklist.
- **Acme App Reference Application (`examples/acme-app/`)**:
  - Full App Router architecture with nested layouts, async Server Components, interactive Client Component controls (`StatusFilter`), and Client Component form (`CreateProjectForm`) bound to React 19 Server Actions.
  - Type-safe Data Access Layer (DAL) protected by `import "server-only"`.
  - Health check Route Handler (`app/api/health/route.ts`).
  - Unit test suite (`tests/projects.test.ts`) verifying server data operations.
- **Publication & Sample Export Pipeline**:
  - Added `scripts/build-publication.ts` compiling consolidated Markdown, printable HTML, and EPUB manifests.
  - Added `scripts/build-sample.ts` compiling the Free Sample Edition package.

---

## [0.2.0] - 2026-03-29

### Added
- Advanced production manuscript content for **Part I — Modern Next.js** (Chapters 4–6).
- Extended Acme App reference implementation.

---

## [0.1.0] - 2026-03-06

### Added
- Initial manuscript repository architecture (`nextjs-16-developer-guide/`).
- Master Table of Contents in `content/toc.md`.
