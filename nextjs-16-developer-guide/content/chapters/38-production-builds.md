# Chapter 38: Production Builds

*Part VIII — Deployment*

---

## Learning Objectives
- Master the Next.js 16 build compilation pipeline executed by `next build`.
- Integrate strict TypeScript compilation (`tsc --noEmit`) and ESLint validation into build workflows.
- Understand static HTML page generation, dynamic server route compilation, and SSG revalidation timers.
- Troubleshoot common build compilation errors (type mismatches, missing export default components, top-level await failures).
- Optimize build times and build cache retention in CI/CD pipelines.

---

## Overview & Core Explanation

Executing `next build` is the final compilation gate that transforms source TypeScript code, React components, and styling configurations into an optimized production release.

### The 4 Phases of `next build`
1. **Linting and Typechecking**: Next.js runs ESLint and TypeScript checks across the entire codebase. If type errors exist, the build halts immediately.
2. **Module Compilation (SWC / Turbopack)**: Transforms TSX/JSX, bundles modules, performs tree-shaking, and extracts critical CSS.
3. **Route Analysis & Static Pre-Rendering**: Next.js evaluates every route in `app/`. Static routes are pre-rendered into static HTML files; dynamic routes are compiled into Node.js server execution bundles.
4. **Manifest and Standalone Tracing**: Generates route manifests, asset maps, and optional standalone server bundles (`.next/standalone`).

```
                    NEXT BUILD COMPILATION LIFECYCLE
┌───────────────────────────────────────────────────────────────────────┐
│ Phase 1: ESLint & TypeScript Checking (tsc --noEmit)                  │
│ Phase 2: SWC Compiler Module Bundling & Tree-Shaking                   │
│ Phase 3: Route Pre-rendering (Generates static HTML for ○ / ● routes)  │
│ Phase 4: Tracing & Standalone Bundle Generation (.next/standalone)    │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Build Scripts in `package.json`

Define clear package scripts for testing, typechecking, and building.

```json
{
  "name": "acme-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## Pre-Flight Verification Before `next build`

To catch compilation errors quickly during development without waiting for full page pre-rendering, run TypeScript compilation and ESLint in isolation:

```bash
# Typecheck codebase without emitting JavaScript output
npx tsc --noEmit

# Run strict ESLint checks across codebase
npx eslint .
```

---

## Troubleshooting Common Build Failures

### Build Error 1: Missing `export default` in Route Files
App Router route files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`) **must** export a default React component function.

```text
Error: Page "app/dashboard/projects/page.tsx" has no default export.
Target module must export a default React component.
```
- *Fix*: Ensure the route component uses `export default function PageName()`.

---

### Build Error 2: Missing Await on Async `params` in Next.js 16
Accessing `params.id` synchronously without `await params` in route pages or `generateMetadata()`.

```text
Error: Route "/dashboard/projects/[id]" used `params.id` without awaiting `params`.
In Next.js 16, `params` is an async Promise and must be awaited.
```
- *Fix*: Update component signature to `const { id } = await params;`.

```typescript
// GOOD: Next.js 16 Async Params Pattern
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params; // Properly awaiting params promise
  return <div>Project ID: {id}</div>;
}
```

---

### Build Error 3: Database Connection Attempts During Build
Attempting to query live database connections inside static components without wrapping database access in dynamic boundaries or checks.

```text
Error: MONGODB_URI is not defined during static page pre-rendering.
```
- *Fix*: Mark the route segment as dynamic (`export const dynamic = 'force-dynamic'`) or ensure environment variables are present during build time.

---

## Production Build Strategy Matrix

| Build Characteristic | Command / Option | Expected Output |
| :--- | :--- | :--- |
| **Full Production Build** | `npm run build` | Compiles `.next/` directory with static HTML, assets, and server bundles. |
| **Type Check Pre-Flight** | `npx tsc --noEmit` | Validates strict TypeScript compilation without emitting JS files. |
| **Standalone Container Build** | `output: 'standalone'` in `next.config.ts` | Traces dependencies into self-contained `.next/standalone` folder. |
| **Local Production Preview** | `npm run build && npm run start` | Serves compiled production build locally on `http://localhost:3000`. |

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

1. **Bypassing Type Checking in Builds**: Disabling TypeScript errors in `next.config.ts` (`typescript: { ignoreBuildErrors: true }`).
   - *Production Risk*: Allows broken types and undefined property access bugs to ship directly to production users.
2. **Ignoring Build Warnings**: Ignoring red build warnings regarding oversized client JavaScript chunks or un-optimized images.
3. **Not Testing Production Builds Locally**: Deploying code directly to production after running only `npm run dev` without verifying `npm run build && npm run start` locally.

---

## Production Considerations

- **CI Build Caching**: Cache the `.next/cache` directory across CI/CD pipeline runs (GitHub Actions, GitLab CI) to reduce build times by up to 70%.
- **Memory Allocation for Build**: For large codebases, increase Node.js build memory allocation (`NODE_OPTIONS="--max-old-space-size=4096" next build`) to prevent out-of-memory (OOM) build crashes.
- **Build Pre-Flight Checklist**: Run `npm run lint && npm run typecheck && npm run build` before pushing code to main git branches.

---

## Summary

Production builds in Next.js 16 validate and optimize application code for deployment. By resolving type errors, awaiting async `params`, auditing route manifests, and testing builds locally with `npm run start`, you ensure stable, error-free production releases.

---

## Checklist
- [ ] Confirmed `npm run build` completes with zero TypeScript or ESLint errors.
- [ ] Awaited `params` and `searchParams` promises in all dynamic route page components.
- [ ] Audited route pre-rendering manifest indicators (`○`, `●`, `ƒ`).
- [ ] Tested compiled production build locally using `npm run start`.
- [ ] Configured build cache retention (`.next/cache`) in CI/CD build pipelines.
