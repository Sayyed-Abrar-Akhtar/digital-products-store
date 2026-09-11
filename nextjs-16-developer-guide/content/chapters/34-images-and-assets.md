# Chapter 34: Images and Assets

*Part VII — Performance*

---

## Learning Objectives
- Architect high-performance asset delivery pipelines in Next.js 16 App Router applications.
- Optimize `next/image` configuration in `next.config.ts` for AVIF/WebP image generation and responsive breakpoint device sizes.
- Manage static asset serving inside the `public/` directory with immutable HTTP caching headers.
- Handle SVG vector graphics safely without introducing Cross-Site Scripting (XSS) risks.
- Configure CDN asset distribution and cache controls.

---

## Overview & Core Explanation

Media assets—images, SVGs, icons, video clips, and static downloads—account for over 70% of the total network byte weight of modern web pages.

Next.js 16 manages media asset delivery through two complementary mechanisms:

1. **`next/image` Dynamic Optimization Server**: On-demand server engine that resizes, compresses, and converts raster images (PNG, JPEG) into next-gen formats (AVIF, WebP) tailored to user viewports.
2. **Static Public Asset Engine (`public/`)**: Serves static files directly from the application root under immutable long-term HTTP caching headers.

```
Client Asset Request
   │
   ├─► Request for Static Public Asset (/logo.png) ──► Served directly with Cache-Control headers
   │
   └─► Request for Dynamic Image (_next/image?url=...)
         │
         ▼
Next.js Image Optimization Engine
 ├── Resizes image to target deviceSize breakpoint
 ├── Converts format to AVIF / WebP
 └── Caches compressed asset on Edge CDN
```

---

## Advanced Image Configuration (`next.config.ts`)

Tune `next.config.ts` to customize device breakpoints, image sizes, and compression formats.

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Enable AVIF format first for maximum compression efficiency
    formats: ["image/avif", "image/webp"],

    // Explicit breakpoint sizes matching Tailwind CSS breakpoints
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache optimized images on server for 60 seconds minimum before revalidating
    minimumCacheTTL: 31536000, // 1 year immutable cache

    // Authorize remote image hostnames
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
```

---

## Handling SVG Vector Graphics

SVG (Scalable Vector Graphics) files are XML-based vector graphic documents. Unlike raster images (JPEGs, PNGs), SVGs scale crisply to any resolution with zero pixelation and tiny byte footprints.

### Two Ways to Render SVGs in Next.js 16

1. **Static SVG via `<Image />`**: Ideal for logos and complex vector illustrations.

```typescript
import Image from "next/image";
import logoSvg from "@/public/logo.svg";

export function BrandLogo() {
  return (
    <Image
      src={logoSvg}
      alt="Acme Brand Logo"
      width={120}
      height={32}
      priority
    />
  );
}
```

2. **Inline React SVG Component**: Ideal for UI icons where CSS class manipulation (`className="w-5 h-5 text-primary"`) is required.

```typescript
// components/icons/check-icon.tsx
export function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
```

> **Security Warning**: SVGs can contain embedded `<script>` tags. Never render user-uploaded SVG files directly using raw `<svg>` or `dangerouslySetInnerHTML` without sanitizing them with DOMPurify.

---

## HTTP Cache-Control Headers for Static Assets

Static files served from the `public/` folder should be configured with immutable HTTP caching headers when deployed behind CDN proxies.

```typescript
// next.config.ts (Custom HTTP Headers for Static Assets)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## Asset Delivery Decision Matrix

| Asset Type | Recommended Delivery Mechanism | Optimization Strategy |
| :--- | :--- | :--- |
| **Raster Content Image (JPEG, PNG)** | `<Image />` with `next/image` | AVIF/WebP conversion + responsive `sizes` attribute. |
| **UI Icon / Small Vector** | Inline React SVG Component | 0 network fetch; controllable via Tailwind `text-primary`. |
| **Static Download File (PDF, ZIP)** | `public/downloads/` folder | Direct HTTP download link with `Cache-Control` headers. |
| **User Uploaded Avatar** | Remote S3 / Blob Storage + `<Image />` | Host in S3; authorize domain in `remotePatterns`. |

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

1. **Placing Unused Giant Files in `public/`**: Storing raw uncompressed video files or multi-megabyte Photoshop assets in `public/`, inflating deployment build bundle sizes.
2. **Disabling Image Optimization**: Setting `unoptimized: true` globally in `next.config.ts` out of laziness, sending raw uncompressed 5MB JPEGs to mobile users.
3. **Omitting `alt` Attributes on Graphic Images**: Leaving `alt=""` on informative graphics, degrading SEO accessibility ratings.

---

## Production Considerations

- **CDN Edge Caching**: Ensure edge hosting providers (Vercel, Cloudflare, AWS CloudFront) cache `_next/image` transformed image URLs so subsequent requests hit edge memory caches instantly.
- **Image Domain Whitelisting**: Strictly restrict `remotePatterns` in `next.config.ts` to authorized image host domains to prevent open proxy abuse.
- **Sprite and Font Subsetting**: Subset custom icon sets and web fonts to include only used character ranges, cutting asset payload sizes by up to 80%.

---

## Summary

Asset optimization in Next.js 16 combines automatic image compression via `next/image`, modern AVIF/WebP formats, immutable HTTP caching headers, and inline SVG components. Following these patterns maximizes media delivery speeds and minimizes network bandwidth.

---

## Checklist
- [ ] Enabled AVIF and WebP formats in `next.config.ts`.
- [ ] Registered authorized remote image domains under `remotePatterns`.
- [ ] Used inline React SVG components for interactive UI icons.
- [ ] Configured immutable `Cache-Control` headers for static assets.
- [ ] Verified optimized image delivery over Edge CDN caching layers.
