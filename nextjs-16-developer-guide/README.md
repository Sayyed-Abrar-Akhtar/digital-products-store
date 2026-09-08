# Practical Next.js 16 Developer Guide

> **Working Title**: Practical Next.js 16 Developer Guide
> **Version**: 0.1.0 (Manuscript Development Stage)
> **Target Framework**: Next.js 16.x (Target 16.3.4) & React 19

This repository contains the manuscript, reference code examples, assets, and build tools for the commercial technical ebook **"Practical Next.js 16 Developer Guide"**.

---

## Target Audience
Intermediate to advanced full-stack JavaScript/TypeScript engineers, frontend architects, and software leaders seeking a deep, production-focused guide to Next.js 16, React 19, and modern web application development.

---

## Manuscript Structure

The manuscript is structured into 8 main Parts, 41 Chapters, and 6 Appendices:

- **Part I — Modern Next.js** (Chapters 1–5): Core Next.js 16 architecture, setup, App Router, project structure, and layouts.
- **Part II — React Architecture** (Chapters 6–10): Server vs. Client Components, composition, streaming, and error handling.
- **Part III — Data** (Chapters 11–15): Data fetching patterns, server actions/mutations, MongoDB/Mongoose, and revalidation.
- **Part IV — Production UI** (Chapters 16–20): Tailwind CSS, accessibility, dynamic images, fonts, and responsive design.
- **Part V — SEO** (Chapters 21–26): Metadata, canonical URLs, dynamic sitemaps, Open Graph, and structured data.
- **Part VI — Security** (Chapters 27–31): Auth architecture, authorization boundaries, server operations, and secret management.
- **Part VII — Performance** (Chapters 32–36): Hydration optimization, asset delivery, database tuning, and production builds.
- **Part VIII — Deployment** (Chapters 37–41): CI/CD, production configuration, debugging, and launch checklists.
- **Appendices A–F**: Quick reference checklists for architecture, commands, deployment, SEO, security, and performance.

---

## Fictional Reference Application ("Acme App")
Code examples throughout the ebook are rooted in the fictional reference application located at `examples/acme-app/`. It demonstrates:
- App Router layout and page conventions
- Type-safe server data operations
- Minimal client-side hydration overhead

---

## Manuscript Validation & Commands

### Running Manuscript Validation
To check links, headers, metadata, and chapter section completeness:
```bash
npx ts-node scripts/validate-manuscript.ts
```

### Typechecking Examples
To verify TypeScript compilation across the manuscript tooling and reference application:
```bash
# Typecheck root manuscript tools
npx tsc --noEmit -p tsconfig.json

# Typecheck Acme reference app
npx tsc --noEmit -p examples/acme-app/tsconfig.json
```

---

## Planned Output Formats
- Interactive Web Documentation
- PDF Edition
- EPUB / E-Reader Formats
- Free Sample Preview Package

---

## Versioning & Status
- `0.1.0`: Initial manuscript structure and reference architecture release.
- `0.9.0`: Release Candidate (Full chapters completed & edited).
- `1.0.0`: Official commercial publication release.

---

## Licensing
See [LICENSE.md](LICENSE.md) for terms and copyright notices. DRAFT — FINAL LICENSE TO BE REVIEWED BEFORE SALE.
