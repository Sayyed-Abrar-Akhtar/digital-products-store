# Appendix D: SEO Checklist

*Appendix*

---

## Learning Objectives
- Master the Search Engine Optimization (SEO) pre-flight checklist for Next.js 16 App Router applications.
- Verify metadata inheritance, canonical link tags, XML sitemaps, Open Graph cards, and Schema.org structured data.
- Eliminate search engine crawling blocks and duplicate content index penalties.

---

## Overview & Core Explanation

Search Engine Optimization (SEO) ensures that search engine web crawlers can efficiently discover, parse, and index your application's public pages.

This appendix provides an actionable checklist covering Metadata, Canonical URLs, Sitemaps, Open Graph social cards, and Structured Data in Next.js 16.

```text
                           SEO CHECKLIST PIPELINE
┌────────────────────────┬────────────────────────┬────────────────────────┐
│  METADATA & CANONICAL  │   CRAWLING & SITEMAP   │   SOCIAL & SCHEMAS     │
│                        │                        │                        │
│ • metadataBase URL     │ • app/robots.ts        │ • opengraph-image.tsx  │
│ • title.template       │ • app/sitemap.ts       │ • Twitter Cards        │
│ • alternates.canonical │ • Disallow /dashboard/ │ • Schema.org JSON-LD   │
└────────────────────────┴────────────────────────┴────────────────────────┘
```

---

## Production SEO Checklist

### 1. Metadata & Title Templates
- [ ] **`metadataBase` Configuration**: Root `layout.tsx` specifies canonical `metadataBase: new URL('https://acme-app.store.com')`.
- [ ] **Title Templates**: Root layout sets `title: { template: '%s | Brand', default: 'Brand' }` for site-wide title inheritance.
- [ ] **Meta Descriptions**: Pages include unique meta descriptions (150–160 characters maximum).

### 2. Canonical URLs
- [ ] **Canonical Link Tags**: Pages specify `alternates: { canonical: '...' }` to resolve duplicate URL parameters.
- [ ] **Clean Query Parameters**: Dynamic canonical URLs strip tracking query parameters (`utm_source`, `ref`).
- [ ] **Trailing Slash Normalization**: `next.config.ts` sets `trailingSlash: false` for uniform URL structures.

### 3. Crawling & Sitemaps
- [ ] **Robots File (`app/robots.ts`)**: Disallows private authenticated routes (`/dashboard/`, `/api/`, `/admin/`) and specifies sitemap location.
- [ ] **Dynamic XML Sitemap (`app/sitemap.ts`)**: Generates valid XML sitemap enumerating public routes with accurate `lastModified` dates.
- [ ] **Sitemap Splitting**: Handles large database collections (>50,000 URLs) using `generateSitemaps()`.

### 4. Open Graph & Social Cards
- [ ] **Open Graph Metadata**: Defines `openGraph` object (`title`, `description`, `url`, `siteName`, `locale`).
- [ ] **Dynamic Social Cards**: Dynamic entity routes feature `opengraph-image.tsx` using `ImageResponse` (1200x630px).
- [ ] **Twitter Cards**: Defines `twitter: { card: 'summary_large_image' }`.

### 5. Structured Data (JSON-LD)
- [ ] **Schema.org Injection**: Injects valid JSON-LD scripts (`Organization`, `SoftwareApplication`, `TechArticle`, `BreadcrumbList`).
- [ ] **XSS Sanitization**: Escapes `<` characters in JSON-LD strings using `sanitizeJsonLd()`.
- [ ] **Google Rich Results Validation**: Tested rendered JSON-LD on Google Rich Results Test tool.

---

## Practical Example

```typescript
// lib/seo/json-ld.ts
import "server-only";

export function sanitizeJsonLd(data: Record<string, any>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

---

## Common Mistakes

1. **Omitting `metadataBase`**: Defining relative canonical paths (`/pricing`) without setting `metadataBase` in root `layout.tsx`, causing relative canonical links.
2. **Including Private Routes in Sitemaps**: Adding authenticated `/dashboard/*` routes to `sitemap.ts`.
3. **Missing `lastModified` Dates in Sitemaps**: Omitting modification timestamps, preventing search engines from recognizing updated content.

---

## Production Considerations

- **Google Search Console**: Register your production sitemap URL (`https://acme-app.store.com/sitemap.xml`) in Google Search Console upon launch.
- **Social Card Inspection**: Validate social previews using OpenGraph.xyz or LinkedIn Post Inspector.

---

## Summary

Executing this SEO checklist ensures that your Next.js 16 application is fully indexable, protected against duplicate content penalties, and optimized for rich search engine listings.

---

## Checklist
- [ ] Specified `metadataBase` in root `layout.tsx`.
- [ ] Verified `/robots.txt` and `/sitemap.xml` render valid responses.
- [ ] Generated dynamic 1200x630px Open Graph images with `opengraph-image.tsx`.
- [ ] Validated JSON-LD structured data with Google Rich Results Test.
