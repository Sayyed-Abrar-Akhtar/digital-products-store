# Chapter 22: Canonical URLs

*Part V — SEO*

---

## Learning Objectives
- Master canonical URL management in Next.js 16 to eliminate duplicate content penalties in search engine indexes.
- Utilize the `alternates.canonical` field within Next.js 16 metadata objects.
- Standardize canonical URLs across parameter variations, pagination states, and marketing landing pages.
- Handle multi-domain environments and trailing slash URL normalization.
- Avoid common SEO canonical flaws such as relative canonical links, self-referential loops on paginated routes, and protocol mismatches.

---

## Overview & Core Explanation

Search engines (Google, Bing, DuckDuckGo) view identical or highly similar web content accessible via different URLs as **duplicate content**.

For example, all of the following URLs might render the exact same project listing page:
- `https://acme-app.store.com/dashboard/projects`
- `https://acme-app.store.com/dashboard/projects?utm_source=newsletter`
- `https://acme-app.store.com/dashboard/projects?sort=desc&page=1`
- `http://acme-app.store.com/dashboard/projects/`

Without a **Canonical URL tag** (`<link rel="canonical" href="...">`), search engines split ranking metrics (PageRank, link equity) across these duplicate variations or penalize the domain for indexing duplicate pages.

A Canonical URL explicitly informs search engine crawlers: *"Regardless of URL query parameters or protocol variations, this specific canonical URL is the authoritative source for this page content."*

```
Incoming Crawler Requests
├── https://acme-app.store.com/projects?ref=twitter
├── https://acme-app.store.com/projects?sort=asc
└── https://acme-app.store.com/projects

                    │
                    ▼
HTML Output contains Canonical Meta Tag:
<link rel="canonical" href="https://acme-app.store.com/projects" />
                    │
                    ▼
Search Engine indexes ONLY Authoritative Canonical URL
```

---

## Configuring Canonical URLs with Next.js Metadata API

Next.js 16 manages canonical link tag output via the `alternates` configuration key inside static `metadata` exports or dynamic `generateMetadata()` functions.

### 1. Setting Static Canonical URLs

When combined with `metadataBase` in root `layout.tsx`, defining `alternates: { canonical: '/pricing' }` emits a fully-qualified, absolute canonical link tag in the rendered HTML `<head>`.

```typescript
// app/pricing/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description: "Flexible, transparent pricing plans for enterprise telemetry teams.",
  alternates: {
    canonical: "/pricing", // Resolves against metadataBase -> https://acme-app.store.com/pricing
  },
};

export default function PricingPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Pricing Plans</h1>
    </main>
  );
}
```

Rendered HTML `<head>` output:
```html
<link rel="canonical" href="https://acme-app.store.com/pricing" />
```

---

## Dynamic Canonical URLs for Resource Routes

For dynamic resource routes (such as blog posts, documentation articles, or project entities), construct the canonical URL dynamically inside `generateMetadata()`, stripping tracking query parameters (`utm_source`, `ref`, `session_id`).

```typescript
// app/docs/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchDocBySlug } from "@/lib/dal/docs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await fetchDocBySlug(slug);

  if (!doc) {
    return { title: "Document Not Found" };
  }

  // Canonical URL strips tracking query parameters and forces canonical slug URL
  const canonicalUrl = `/docs/${doc.slug}`;

  return {
    title: doc.title,
    description: doc.summary,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = await fetchDocBySlug(slug);

  if (!doc) notFound();

  return (
    <article className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{doc.title}</h1>
      <div className="mt-4 prose dark:prose-invert">{doc.content}</div>
    </article>
  );
}
```

---

## Canonical Strategy Matrix

| Scenario | Canonical Rule | Implementation Pattern |
| :--- | :--- | :--- |
| **Marketing Page with Tracking Query Params** (`?utm_source=twitter`) | Strip tracking parameters; point canonical to clean base URL | `alternates: { canonical: '/pricing' }` |
| **Paginated Content** (`/blog?page=2`) | Point canonical to current page URL variation or primary series root | `alternates: { canonical: '/blog?page=2' }` |
| **Filtered Product Directory** (`/projects?status=active`) | Point canonical to main unfiltered directory URL | `alternates: { canonical: '/projects' }` |
| **Multi-Language Regional Alternates** | Define `languages` object alongside canonical | `alternates: { canonical: '...', languages: { 'es-ES': '/es/pricing' } }` |

---

## Trailing Slash Normalization (`next.config.ts`)

In web architecture, `/projects` and `/projects/` (with a trailing slash) are technically distinct URLs.

To prevent search engines from indexing both variations, configure trailing slash normalization explicitly in `next.config.ts`.

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enforces URL normalization without trailing slashes
  trailingSlash: false,
};

export default nextConfig;
```

When `trailingSlash: false` is configured, incoming requests to `/projects/` receive a 308 Permanent Redirect to `/projects`, preserving canonical SEO index integrity.

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

1. **Omitting `metadataBase` in Root Layout**: Defining `alternates: { canonical: '/projects' }` without setting `metadataBase` in root `layout.tsx`.
   - *Result*: Next.js outputs a relative canonical tag (`<link rel="canonical" href="/projects">`), which search engine crawlers ignore.
2. **Pointing All Paginated Pages to Page 1**: Setting the canonical URL for `/blog?page=5` to `/blog`.
   - *SEO Risk*: Search engine crawlers will stop indexing articles listed on pages 2 through 5. Paginated URLs should feature self-referential canonical tags.
3. **Mismatched HTTP/HTTPS Protocol in Canonical Links**: Hardcoding `http://` instead of `https://` in canonical domain definitions.

---

## Production Considerations

- **Canonical Verification via Google Search Console**: Inspect indexed URLs in Google Search Console's "URL Inspection" tool to verify that "Google-selected canonical" matches "User-declared canonical".
- **Cross-Domain Canonicalization**: If syndicating blog posts or content across third-party platforms (Medium, Dev.to), ensure the external platform points its canonical tag back to your authoritative Next.js domain URL.
- **Environment Aware Canonical Domains**: Ensure staging environments (e.g., `staging.acme.com`) omit canonical tags or set `robots: { index: false }` to prevent staging builds from competing with production indexing.

---

## Summary

Canonical URLs instruct search engine crawlers to index the single authoritative version of every page. By configuring `metadataBase`, utilizing `alternates.canonical` in static and dynamic route metadata, and enforcing trailing slash normalization, you protect domain authority and maximize search engine rankings.

---

## Checklist
- [ ] Defined `metadataBase` in root `layout.tsx`.
- [ ] Added `alternates: { canonical: '...' }` to static and dynamic route metadata.
- [ ] Stripped marketing and tracking query parameters (`utm_*`) from dynamic canonical URLs.
- [ ] Configured `trailingSlash: false` in `next.config.ts` for URL normalization.
- [ ] Verified canonical tags render as absolute HTTPS URLs in page source HTML.
