# Chapter 21: Metadata

*Part V — SEO*

---

## Learning Objectives
- Master static and dynamic SEO metadata management in Next.js 16 App Router applications.
- Utilize title templates (`title.template`) for consistent brand metadata inheritance across route trees.
- Implement `generateMetadata()` for dynamic database-driven routes with async `params` in Next.js 16.
- Configure Open Graph, Twitter Cards, and search engine crawler instructions.
- Avoid common SEO flaws such as missing fallback titles, duplicate meta tags, and unhandled metadata promise rejections.

---

## Overview & Core Explanation

Search Engine Optimization (SEO) and social media sharing rely on accurate, high-quality HTML `<head>` metadata tags (`<title>`, `<meta name="description">`, `<meta property="og:title">`, `<link rel="canonical">`).

In Next.js 16, metadata is managed declaratively using the built-in **Metadata API**.

### Static vs Dynamic Metadata
1. **Static Metadata Export (`export const metadata: Metadata`)**: Declared as a static object in `layout.tsx` or `page.tsx` for static routes (e.g. homepage, pricing, about).
2. **Dynamic Metadata Function (`export async function generateMetadata()`)**: An async function declared in dynamic route files (`[id]/page.tsx`) that reads route `params`, queries the database or API, and returns computed metadata dynamically.

```
Page Request (/dashboard/projects/proj-123)
   │
   ├─► App Router evaluates layout.tsx metadata (Title template, site name)
   │
   ├─► App Router invokes generateMetadata({ params }) in page.tsx
   │     ├── Awaits params promise (Next.js 16 requirement)
   │     └── Fetches project name from Database (DAL)
   │
   └─► Merges parent layout metadata with page metadata -> Emits <head> tags
```

---

## Title Inheritance & Templates in Root Layout

Define a global site title template in `app/layout.tsx`. When child pages export a title string (`title: "Telemetry Details"`), Next.js automatically interpolates it into the parent template (`"Telemetry Details | Acme Platform"`).

```typescript
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://acme-app.store.com"
  ),
  title: {
    template: "%s | Acme Developer Guide",
    default: "Acme Platform — Production Next.js 16 Guide",
  },
  description:
    "Production reference application demonstrating Next.js 16, React 19, App Router, and server component architecture.",
  keywords: ["Next.js 16", "React 19", "App Router", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "Sayyed Abrar Akhtar", url: "https://store.sayyedabrarakhtar.com.np" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://acme-app.store.com",
    siteName: "Acme Developer Guide",
    title: "Acme Platform — Production Next.js 16 Guide",
    description: "Production reference application for Next.js 16 and React 19.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Acme Platform — Production Next.js 16 Guide",
    description: "Production reference application for Next.js 16 and React 19.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

---

## Dynamic Metadata with `generateMetadata()` in Next.js 16

In Next.js 16, route `params` and `searchParams` passed to `generateMetadata()` are **async Promises**. You must `await params` before accessing parameter values.

### Practical Example: Dynamic Project Page Metadata

```typescript
// app/dashboard/projects/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/dal/projects";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Dynamic Metadata Generator for Project Detail Route
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Next.js 16 requirement: await params promise
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project identifier does not exist.",
    };
  }

  return {
    title: project.name, // Interpolates into template: "Project Name | Acme Developer Guide"
    description: `Detailed project telemetry, status, and metrics for ${project.name} (${project.key}).`,
    openGraph: {
      title: `${project.name} (${project.key}) — Telemetry`,
      description: `View active project configuration and stats for ${project.name}.`,
      type: "article",
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{project.name}</h1>
      <p className="text-muted-foreground">Project Key: {project.key}</p>
    </main>
  );
}
```

---

## Metadata Request Deduplication

Notice that in the example above, `getProjectById(id)` is called **twice** during a single request pass:
1. First inside `generateMetadata()` to generate head tags.
2. Second inside `ProjectDetailPage()` to render page UI.

Because `getProjectById` is wrapped with `React.cache()` inside our Data Access Layer (DAL), Next.js executes the database query **exactly once**. You do not need to pass data from `generateMetadata()` to the page component.

---

## Metadata Strategy Decision Matrix

| Metadata Requirement | Recommended Approach | Code Example |
| :--- | :--- | :--- |
| **Site-Wide Default Branding** | `metadata` object in root `layout.tsx` | `title: { template: '%s \| Brand', default: 'Brand' }` |
| **Static Content Page (Pricing, About)** | `metadata` object export in `page.tsx` | `export const metadata: Metadata = { title: 'Pricing' }` |
| **Dynamic Entity Page (Product, Post)** | `generateMetadata()` function in `page.tsx` | `export async function generateMetadata({ params })` |
| **Absolute Domain Resolution** | Set `metadataBase` in root layout | `metadataBase: new URL('https://domain.com')` |

---

## Common Mistakes

1. **Accessing `params.id` Synchronously in Next.js 16**: Calling `params.id` without `await params` in `generateMetadata()`, breaking build compilation in Next.js 16.
2. **Forgetting `metadataBase`**: Defining relative OpenGraph image URLs (`/og-image.png`) without setting `metadataBase` in root `layout.tsx`. Next.js requires `metadataBase` to construct fully-qualified absolute URLs required by social platforms.
3. **Overwriting Parent Layout Fields Unintentionally**: Defining a custom `openGraph` object in a child page without specifying required fields, erasing parent fallback properties.

---

## Production Considerations

- **Social Card Preview Auditing**: Verify Open Graph and Twitter cards using official validator tools (LinkedIn Post Inspector, Twitter Card Validator, OpenGraph.xyz).
- **Canonical Domain Consistency**: Ensure `metadataBase` uses your production HTTPS canonical URL (`https://acme-app.store.com`) rather than local development URLs (`http://localhost:3000`).
- **Dynamic Meta Description Limits**: Truncate dynamic database descriptions in `generateMetadata()` to a maximum of 155–160 characters to prevent search engines from truncating meta descriptions in search result listings.

---

## Summary

Next.js 16 provides declarative metadata management via static `metadata` exports and dynamic `generateMetadata()` functions. By leveraging title templates, setting `metadataBase`, awaiting async `params`, and memoizing database queries with `React.cache()`, you achieve robust SEO and social preview sharing.

---

## Checklist
- [ ] Configured `metadataBase` with canonical HTTPS URL in root `layout.tsx`.
- [ ] Established `title.template` for site-wide brand metadata inheritance.
- [ ] Awaited `params` and `searchParams` promises inside `generateMetadata()` functions.
- [ ] Wrapped dynamic metadata database queries with `React.cache()` for request deduplication.
- [ ] Verified Open Graph and Twitter Card tags render correctly in social sharing previews.
