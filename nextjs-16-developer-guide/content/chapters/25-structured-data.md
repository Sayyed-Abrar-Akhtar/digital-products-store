# Chapter 25: Structured Data

*Part V — SEO*

---

## Learning Objectives
- Implement **JSON-LD (JavaScript Object Notation for Linked Data)** structured data in Next.js 16 Server Components.
- Utilize Schema.org standards (`SoftwareApplication`, `Article`, `Organization`, `BreadcrumbList`) to unlock Google Rich Results.
- Safely inject JSON-LD payloads into React `<script type="application/ld+json">` tags without introducing Cross-Site Scripting (XSS) vulnerabilities.
- Connect dynamic database entities to structured schema definitions.
- Avoid structured data errors such as invalid JSON syntax, un-escaped user strings, and schema type mismatches.

---

## Overview & Core Explanation

Structured Data is a standardized format (defined by **Schema.org**) for providing explicit information about a web page and classifying its content to search engine crawlers.

When search engines parse valid JSON-LD structured data on your site, they can enhance standard search listings with **Rich Results** (star ratings, price displays, software version badges, breadcrumb trails, site search boxes).

In Next.js 16, because React Server Components render markup entirely on the server, you can construct typed JSON-LD objects directly inside `page.tsx` components and serialize them safely into a `<script type="application/ld+json">` tag.

```
Page Render (Server Component)
   │
   ├─► Fetches Entity Data from Database (DAL)
   │
   ├─► Constructs Schema.org Typed Object (JSON-LD)
   │
   └─► Renders inline: <script type="application/ld+json">{...}</script>
         │
         ▼
Search Engine Crawler parses Schema -> Displays Google Rich Result
```

---

## Safely Injecting JSON-LD in React Server Components

When injecting JSON-LD into a `<script>` tag in React, you must prevent Cross-Site Scripting (XSS) vulnerabilities caused by un-escaped user inputs (such as a project title containing `</script><script>alert(1)</script>`).

Use `JSON.stringify()` paired with a string replacement helper that sanitizes script tags:

```typescript
// lib/seo/json-ld.ts
import "server-only";

/**
 * Safely stringifies JSON-LD objects while escaping embedded HTML script tags
 */
export function sanitizeJsonLd(data: Record<string, any>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

---

## Practical Example

Let's implement root organization and software application schema in **Acme App**.

```typescript
// app/page.tsx (Server Component Landing Page)
import { sanitizeJsonLd } from "@/lib/seo/json-ld";

export default function HomePage() {
  // 1. Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Acme Platform",
    url: "https://acme-app.store.com",
    logo: "https://acme-app.store.com/logo.png",
    sameAs: [
      "https://github.com/Sayyed-Abrar-Akhtar/digital-products-store",
    ],
  };

  // 2. Software Application Schema
  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Acme Telemetry Engine",
    operatingSystem: "Web",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Sayyed Abrar Akhtar",
    },
  };

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Inject Structured Data Scripts into Page HTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(softwareAppSchema) }}
      />

      <h1 className="text-3xl font-bold">Acme Platform</h1>
      <p className="text-muted-foreground">
        Production Next.js 16 Developer Guide Reference Application.
      </p>
    </main>
  );
}
```

---

## Dynamic Entity Schema (`Article` & `BreadcrumbList`)

For dynamic documentation articles or project detail routes, construct `Article` and `BreadcrumbList` schemas dynamically based on database properties.

```typescript
// app/docs/[slug]/page.tsx
import { notFound } from "next/navigation";
import { fetchDocBySlug } from "@/lib/dal/docs";
import { sanitizeJsonLd } from "@/lib/seo/json-ld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DocArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const doc = await fetchDocBySlug(slug);

  if (!doc) notFound();

  // Dynamic Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: doc.title,
    description: doc.summary,
    datePublished: doc.createdAt,
    dateModified: doc.updatedAt || doc.createdAt,
    author: {
      "@type": "Person",
      name: doc.authorName || "Sayyed Abrar Akhtar",
    },
    publisher: {
      "@type": "Organization",
      name: "Acme Developer Guide",
      logo: {
        "@type": "ImageObject",
        url: "https://acme-app.store.com/logo.png",
      },
    },
  };

  // Dynamic Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://acme-app.store.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Documentation",
        item: "https://acme-app.store.com/docs",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: doc.title,
        item: `https://acme-app.store.com/docs/${doc.slug}`,
      },
    ],
  };

  return (
    <article className="p-6 max-w-3xl mx-auto space-y-4">
      {/* Structured Data Script Tags */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(breadcrumbSchema) }}
      />

      <h1 className="text-3xl font-bold">{doc.title}</h1>
      <p className="text-sm text-muted-foreground">Published: {doc.createdAt.slice(0, 10)}</p>
      <div className="prose dark:prose-invert mt-6">{doc.content}</div>
    </article>
  );
}
```

---

## Schema.org Type Matrix

| Schema Type | Ideal Use Case | Key Schema.org Attributes |
| :--- | :--- | :--- |
| `Organization` | Root layout / Homepage | `name`, `url`, `logo`, `sameAs` |
| `SoftwareApplication` | Web App / SaaS Landing Page | `name`, `operatingSystem`, `applicationCategory`, `offers` |
| `TechArticle` / `Article` | Documentation & Blog Posts | `headline`, `datePublished`, `author`, `publisher` |
| `BreadcrumbList` | Hierarchical Navigation Pages | `itemListElement`: array of `ListItem` with `position`, `name`, `item` |

---

## Common Mistakes

1. **Injecting Raw Unsanitized User Input in JSON-LD**: Stringifying JSON-LD directly without sanitizing `<` characters.
   - *Security Risk*: If a user names a project `</script><script>alert(1)</script>`, raw stringification breaks out of the script tag and executes arbitrary XSS script.
2. **Missing Required Schema.org Fields**: Omitting mandatory Schema.org properties (e.g. `TechArticle` without an `author` or `headline`), causing Google Rich Results validation to fail with warnings.
3. **Placing JSON-LD Scripts in Client Components**: Generating JSON-LD inside Client Components after client hydration, delaying crawler schema discovery.

---

## Production Considerations

- **Rich Results Testing**: Test rendered JSON-LD output using Google's official **Rich Results Test Tool** (`search.google.com/test/rich-results`) to verify zero validation warnings.
- **Server Component Colocation**: Keep JSON-LD script generation inside Server Components so structured data is emitted in initial pre-rendered HTML streams.
- **Schema Validation in CI**: Implement unit tests verifying that JSON-LD serialization helpers output valid JSON strings.

---

## Summary

Structured Data (JSON-LD) bridges the gap between raw web markup and search engine understanding. By constructing typed Schema.org objects inside Server Components, sanitizing script strings against XSS, and validating with Google Rich Results tools, you unlock rich search engine listings.

---

## Checklist
- [ ] Created `sanitizeJsonLd()` helper to escape script tags in JSON-LD strings.
- [ ] Added `Organization` and `SoftwareApplication` JSON-LD to homepage/root routes.
- [ ] Added `TechArticle` and `BreadcrumbList` JSON-LD to dynamic documentation routes.
- [ ] Confirmed structured data script tags render in initial pre-rendered server HTML.
- [ ] Validated rendered JSON-LD with Google Rich Results Test tool.
