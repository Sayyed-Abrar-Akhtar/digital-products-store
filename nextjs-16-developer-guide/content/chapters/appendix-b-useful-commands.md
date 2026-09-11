# Appendix B: Useful Commands

*Appendix*

---

## Learning Objectives
- Master the essential CLI commands for developing, testing, auditing, and building Next.js 16 App Router applications.
- Execute pre-flight typechecking, linting, and manuscript validation scripts.
- Analyze client JavaScript bundle footprints using `@next/bundle-analyzer`.

---

## Overview & Core Explanation

Command-line utilities streamline project setup, development workflows, testing, and production builds. This reference appendix lists the primary CLI commands utilized throughout the Next.js 16 Developer Guide.

```text
                                CLI COMMAND WORKFLOW
┌──────────────────────┬──────────────────────┬──────────────────────┐
│     DEVELOPMENT      │    VERIFICATION      │      BUILD / PROD    │
│                      │                      │                      │
│ npm run dev          │ npm run lint         │ npm run build        │
│ npm run dev --turbo  │ npx tsc --noEmit     │ npm run start        │
│ npx create-next-app  │ npm run validate     │ ANALYZE=true build   │
└──────────────────────┴──────────────────────┴──────────────────────┘
```

---

## 1. Project Creation & Setup Commands

### Create a New Next.js 16 Project
```bash
# Creates a modern Next.js 16 App Router project with TypeScript & Tailwind CSS
npx create-next-app@latest my-app --typescript --tailwind --app --eslint --src-dir=false --import-alias="@/*"
```

### Installing Core Dependencies
```bash
# Install server-only boundary enforcement
npm install server-only

# Install utility helper libraries for Tailwind CSS class merging
npm install clsx tailwind-merge

# Install Zod validation library
npm install zod

# Install Mongoose ODM for MongoDB
npm install mongoose
```

---

## 2. Development Commands

```bash
# Start local development server (Standard SWC compiler)
npm run dev

# Start development server with Turbopack acceleration
npm run dev -- --turbopack

# Start development server on a custom port
npm run dev -- -p 4000
```

---

## 3. Verification & Quality Commands

```bash
# Run strict ESLint checks across codebase
npm run lint

# Run strict TypeScript compilation without emitting JS output
npx tsc --noEmit

# Run manuscript structure, word count, and header validator (Guide Workspace)
npm run validate

# Run unit and integration tests (Root / Acme App)
npm test
```

---

## 4. Production Build & Analysis Commands

```bash
# Execute production build compilation
npm run build

# Start local production preview server (Serves compiled .next build)
npm run start

# Run bundle analyzer to visualize client JavaScript byte footprints
ANALYZE=true npm run build
```

---

## Practical Example

Combine verification commands into a single pre-flight script in `package.json`:

```json
{
  "scripts": {
    "ci:check": "npm run lint && npm run typecheck && npm run validate && npm test"
  }
}
```

Running `npm run ci:check` verifies code quality before pushing code to main git branches.

---

## Common Mistakes

1. **Running `npm run start` Without Running `npm run build` First**: Executing `npm run start` when no compiled `.next` build folder exists.
   - *Fix*: Always run `npm run build` before `npm run start`.
2. **Ignoring TypeScript Exit Codes in CI**: Running `tsc` without `--noEmit`, causing TypeScript errors to be ignored in CI build logs.

---

## Production Considerations

- **Turbopack Development Speed**: Use `npm run dev -- --turbopack` during local development for up to 10x faster HMR (Hot Module Replacement) updates.
- **Node.js Memory Allocation**: If `npm run build` encounters Out-Of-Memory (OOM) errors on large codebases, increase Node heap memory: `NODE_OPTIONS="--max-old-space-size=4096" npm run build`.

---

## Summary

Command-line utilities provide complete control over project creation, development, verification, and deployment. Mastering these commands ensures fast, error-free development workflows.

---

## Checklist
- [ ] Verified `npm run dev` starts the development server without errors.
- [ ] Executed `npx tsc --noEmit` and `npm run lint` before committing code.
- [ ] Audited client bundles using `ANALYZE=true npm run build`.
- [ ] Confirmed `npm run build && npm run start` runs cleanly in local production previews.
