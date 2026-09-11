# Chapter 23: Sitemap and robots.txt

*Part V — SEO*

---

## Learning Objectives
- Generate dynamic XML sitemaps using Next.js 16's `sitemap.ts` route convention.
- Configure crawler instructions using the `robots.ts` file convention.
- Split large sitemaps into sitemap index files when handling thousands of dynamic database entities.
- Block search engine crawlers from indexing private authenticated app areas (`/dashboard`, `/api`, `/admin`).
- Avoid common sitemap errors such as missing lastmod dates, invalid XML markup, and indexing private routes.

---

## Overview & Core Explanation

For search engine crawlers (Googlebot, Bingbot) to discover and index your application's public pages efficiently, web standards require two essential SEO control files placed at the domain root:

1. **`robots.txt` (`app/robots.ts`)**: Instructs search engine web crawlers which URL paths they are allowed or forbidden to crawl, and provides the location of the XML sitemap.
2. **`sitemap.xml` (`app/sitemap.ts`)**: An XML map enumerating all public, indexable URLs across your domain, along with modification dates (`lastModified`), update frequencies (`changeFrequency`), and priority weighting.

In Next.js 16 App Router, these files are generated dynamically using TypeScript code conventions placed inside the `app/` directory.

```
Crawler HTTP Request -> GET /robots.txt
                           │
                           ▼
           Evaluates app/robots.ts Code
           ├── Disallows: /dashboard/*, /api/*
           └── Specifies Sitemap URL: https://acme-app.store.com/sitemap.xml
                           │
                           ▼
Crawler HTTP Request -> GET /sitemap.xml
                           │
                           ▼
           Evaluates app/sitemap.ts Code
           ├── Queries Database (DAL) for Public Slugs
           └── Returns Valid XML Sitemap Stream
```

---

## Configuring Crawling Instructions (`app/robots.ts`)

Create `app/robots.ts` to export a default function returning a `MetadataRoute.Robots` object.

```typescript
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://acme-app.store.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/", // Block search engines from crawling private dashboard routes
          "/api/",       // Block internal API Route Handlers
          "/admin/",     // Block administration routes
          "/_next/",     // Block internal Next.js build assets
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

Generated `/robots.txt` output served to crawlers:
```text
User-Agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

Sitemap: https://acme-app.store.com/sitemap.xml
```

---

## Generating Dynamic XML Sitemaps (`app/sitemap.ts`)

Create `app/sitemap.ts` to export a default function returning an array of `MetadataRoute.Sitemap` objects.

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { fetchPublicDocSlugs } from "@/lib/dal/docs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://acme-app.store.com";

  // 1. Static Core Public Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // 2. Dynamic Database Routes (e.g. Documentation Articles)
  const docs = await fetchPublicDocSlugs();
  const dynamicDocRoutes: MetadataRoute.Sitemap = docs.map((doc) => ({
    url: `${baseUrl}/docs/${doc.slug}`,
    lastModified: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...dynamicDocRoutes];
}
```

Generated `/sitemap.xml` output served to crawlers:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://acme-app.store.com</loc>
    <lastmod>2026-03-30T10:00:00.000Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://acme-app.store.com/pricing</loc>
    <lastmod>2026-03-30T10:00:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## Handling Large Sitemaps (Sitemap Indexes)

Search engine web standards dictate that a single `sitemap.xml` file **cannot exceed 50,000 URLs or 50MB uncompressed file size**.

If your application manages hundreds of thousands of dynamic database entities (e.g., e-commerce products or large CMS documentation sites), Next.js 16 allows splitting sitemaps into multiple chunk files using `generateSitemaps()`.

```typescript
// app/sitemap.ts (Large Scale Sitemap Index Splitter)
import type { MetadataRoute } from "next";

export async function generateSitemaps() {
  // Return array of sitemap IDs (e.g. 0, 1, 2)
  return [{ id: 0 }, { id: 1 }, { id: 2 }];
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://acme-app.store.com";

  // Fetch slice of database records corresponding to sitemap chunk ID
  const limit = 10000;
  const skip = id * limit;
  const docs = await fetchDocChunk({ skip, limit });

  return docs.map((doc) => ({
    url: `${baseUrl}/docs/${doc.slug}`,
    lastModified: new Date(doc.updatedAt),
  }));
}
```

This automatically generates `/sitemap/0.xml`, `/sitemap/1.xml`, `/sitemap/2.xml` and a parent `/sitemap.xml` index file!

---

## Crawler Instructions Matrix

| Route Type | `robots.ts` Disallow Rule | `sitemap.ts` Inclusion |
| :--- | :--- | :--- |
| **Public Landing Pages** (`/`, `/pricing`) | Allowed | Included with high priority (`1.0` / `0.8`) |
| **Public Content / Docs** (`/docs/[slug]`) | Allowed | Included with dynamic `lastModified` date |
| **Authenticated User Area** (`/dashboard/*`) | `disallow: '/dashboard/'` | **Omitted** from sitemap |
| **Internal API Endpoints** (`/api/*`) | `disallow: '/api/'` | **Omitted** from sitemap |

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

1. **Including Private Authenticated Routes in Sitemaps**: Adding `/dashboard/settings` or `/admin` routes to `sitemap.ts`, inviting crawlers to index empty login-redirect pages.
2. **Hardcoding Incorrect Domain Protocols in Sitemaps**: Using `http://localhost:3000` or raw IP addresses in `sitemap.ts` instead of production HTTPS domain variables.
3. **Omitting `lastModified` Dates**: Leaving `lastModified` undefined in sitemaps, preventing search engines from recognizing updated content during re-crawls.

---

## Production Considerations

- **Cache Lifetime for Sitemaps**: Next.js automatically caches `sitemap.ts` responses. Wrap database chunk queries inside `sitemap.ts` with `'use cache'` or `export const revalidate = 86400` (24 hours) to prevent heavy sitemap queries from overloading database CPU on crawler hits.
- **Google Search Console Registration**: Submit your primary sitemap URL (`https://acme-app.store.com/sitemap.xml`) to Google Search Console and Bing Webmaster Tools during launch setup.
- **Dynamic Sitemap Testing**: Verify generated XML validity using official XML schema validators to ensure zero syntax or encoding errors.

---

## Summary

Next.js 16 provides `robots.ts` and `sitemap.ts` conventions for managing search engine crawler instruction pipelines. By disallowing private routes, generating dynamic XML sitemaps with accurate modification dates, and leveraging sitemap index splitting for large scale databases, you optimize crawler efficiency and search visibility.

---

## Checklist
- [ ] Created `app/robots.ts` disallowing private routes (`/dashboard/`, `/api/`, `/admin/`).
- [ ] Configured `app/sitemap.ts` returning public static and dynamic database routes.
- [ ] Ensured sitemap URLs use fully-qualified production HTTPS domain prefixes.
- [ ] Included accurate `lastModified` timestamps on dynamic sitemap entries.
- [ ] Verified `/robots.txt` and `/sitemap.xml` URLs render valid responses in browser testing.
