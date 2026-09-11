# Chapter 24: Open Graph

*Part V — SEO*

---

## Learning Objectives
- Master Open Graph (`og:*`) and Twitter Card metadata specifications in Next.js 16.
- Generate dynamic social media share images on the fly using `@vercel/og` (`ImageResponse`).
- Construct custom JSX templates that render into PNG graphics at edge server speeds.
- Associate dynamic social cards with dynamic database entity routes (`/projects/[id]`).
- Avoid common social card glitches such as incorrect aspect ratios, missing fallbacks, and un-cached image generation.

---

## Overview & Core Explanation

When users share links to your application on social platforms (Twitter/X, LinkedIn, Slack, Facebook, Discord), platform crawlers fetch Open Graph metadata tags (`og:title`, `og:description`, `og:image`) to render visual preview cards.

Static social cards (a generic logo image) perform poorly on dynamic routes. When sharing a specific project or document, users expect a rich social card displaying the project's exact title, status, and metrics.

Next.js 16 provides built-in dynamic image generation via the `ImageResponse` constructor (powered by `@vercel/og` and Satori). `ImageResponse` converts standard HTML/CSS written in JSX into optimized PNG images rendered dynamically at the edge.

```
User shares link on Twitter: https://acme-app.store.com/dashboard/projects/proj-123
                               │
                               ▼
Twitter Crawler requests: /dashboard/projects/proj-123/opengraph-image
                               │
                               ▼
Evaluates opengraph-image.tsx (ImageResponse)
 ├── Fetches Project Title from Database (DAL)
 ├── Renders JSX Canvas (Flexbox, Tailwind, Custom Fonts)
 └── Compiles Satori SVG -> Resized PNG Image Stream (1200x630)
                               │
                               ▼
Twitter displays rich social card graphic with dynamic title!
```

---

## The Open Graph Standard & Recommended Dimensions

For optimal rendering across all social media networks (LinkedIn, Twitter, Facebook, Slack), social card graphics must adhere to standard dimensions:
- **Width**: 1200 pixels
- **Height**: 630 pixels
- **Aspect Ratio**: 1.91:1
- **File Format**: PNG or JPEG

---

## Dynamic Social Card Generation (`opengraph-image.tsx`)

Next.js 16 provides a file convention for dynamic Open Graph image routes: `opengraph-image.tsx` placed inside any route segment folder.

Next.js automatically generates the PNG route endpoint and links it inside the page's HTML `<head>` tags:
```html
<meta property="og:image" content="https://acme-app.store.com/dashboard/projects/proj-123/opengraph-image?a1b2c3" />
```

### Practical Example: Dynamic Project Open Graph Image in Acme App

```typescript
// app/dashboard/projects/[id]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getProjectById } from "@/lib/dal/projects";

// Route segment config
export const runtime = "edge";
export const alt = "Project Telemetry Overview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ id: string }>;
}

export default async function Image({ params }: ImageProps) {
  // Await params promise in Next.js 16
  const { id } = await params;
  const project = await getProjectById(id);

  const title = project?.name || "Acme Project Telemetry";
  const key = project?.key || "ACME";
  const status = project?.status || "ACTIVE";

  return new ImageResponse(
    (
      // JSX layout styling for Satori (supports subset of Flexbox CSS)
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            A
          </div>
          <span style={{ fontSize: "28px", fontWeight: "bold", color: "#94a3b8" }}>
            Acme Developer Guide
          </span>
        </div>

        {/* Dynamic Main Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                backgroundColor: "#1e293b",
                color: "#38bdf8",
                padding: "6px 16px",
                borderRadius: "8px",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              KEY: {key}
            </span>
            <span
              style={{
                backgroundColor: "#166534",
                color: "#86efac",
                padding: "6px 16px",
                borderRadius: "8px",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              {status}
            </span>
          </div>

          <h1
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              lineHeight: "1.1",
              color: "#ffffff",
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>

        {/* Footer Subtext */}
        <div style={{ fontSize: "20px", color: "#64748b" }}>
          https://acme-app.store.com — Production Next.js 16 Architecture
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

---

## Static Open Graph Metadata Configuration

For static routes (such as the homepage or pricing page), configure Open Graph metadata directly inside the static `metadata` export.

```typescript
// app/pricing/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description: "Flexible enterprise plans for Next.js 16 development teams.",
  openGraph: {
    title: "Pricing Plans | Acme Developer Guide",
    description: "Flexible enterprise plans for Next.js 16 development teams.",
    url: "https://acme-app.store.com/pricing",
    siteName: "Acme Developer Guide",
    images: [
      {
        url: "https://acme-app.store.com/assets/pricing-og.png",
        width: 1200,
        height: 630,
        alt: "Acme Pricing Plans Overview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing Plans | Acme Developer Guide",
    description: "Flexible enterprise plans for Next.js 16 development teams.",
    images: ["https://acme-app.store.com/assets/pricing-og.png"],
  },
};
```

---

## Open Graph Architecture Matrix

| Route Type | Open Graph Strategy | Implementation |
| :--- | :--- | :--- |
| **Homepage / Core Marketing** | Static metadata export + static PNG image | `openGraph.images: [{ url: '/og-default.png' }]` in `layout.tsx` |
| **Dynamic Entity Route (`[id]`)** | File-system dynamic `opengraph-image.tsx` | `ImageResponse` with JSX Satori styling |
| **Twitter Card Integration** | `twitter: { card: 'summary_large_image' }` | Inherits `openGraph` image URLs automatically |

---

## Common Mistakes

1. **Unsupported CSS in `ImageResponse` JSX**: Attempting to use complex CSS Grid or advanced CSS animations inside `ImageResponse`.
   - *Limitation*: Satori (the underlying engine) supports standard Flexbox layout properties (`display: flex`, `flexDirection`, `alignItems`, `padding`). Avoid CSS grid or unsupported pseudo-selectors.
2. **Missing Font Definitions for Custom Text**: Rendering dynamic canvas text that relies on non-system fonts without bundling TTF/WOFF font binaries in `ImageResponse`.
3. **Mismatched Image Dimensions**: Generating dynamic social card images with non-standard dimensions (e.g. square 500x500 images), causing social platforms to crop graphics awkwardly.

---

## Production Considerations

- **Edge CDN Caching**: Dynamic `opengraph-image.tsx` responses are automatically cached on Edge CDN networks. Ensure response headers include long `Cache-Control` max-age directives to prevent regenerating social cards on every social bot crawl.
- **Text Truncation**: When rendering user-generated strings in `ImageResponse`, clamp title text (`title.slice(0, 50) + '...'`) to prevent text from overflowing the 1200x630 pixel canvas.
- **Social Crawler Testing**: Use the OpenGraph.xyz or LinkedIn Post Inspector tools to verify that dynamic social card images resolve and render without errors.

---

## Summary

Open Graph and Twitter Card tags turn shared URLs into high-converting visual graphics. By combining static metadata fallbacks with Next.js 16's `opengraph-image.tsx` and `ImageResponse` engine, you deliver dynamic, pixel-perfect social preview cards for every route.

---

## Checklist
- [ ] Added default `openGraph` and `twitter` card objects to root `layout.tsx`.
- [ ] Created dynamic `opengraph-image.tsx` routes for dynamic database entity paths.
- [ ] Verified social card graphics adhere to standard 1200x630 pixel dimensions.
- [ ] Used supported Flexbox layout styling inside `ImageResponse` JSX.
- [ ] Tested social share links on social preview inspection tools.
