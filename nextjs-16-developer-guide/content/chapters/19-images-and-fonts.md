# Chapter 19: Images and Fonts

*Part IV — Production UI*

---

## Learning Objectives
- Harness `next/image` to automatically compress, re-size, and convert images into modern formats (AVIF, WebP).
- Eliminate Cumulative Layout Shift (CLS) by enforcing layout aspect ratios and blur placeholders.
- Configure `next/font` to optimize custom and Google fonts with zero layout shift and automatic self-hosting.
- Utilize the `sizes` attribute to deliver responsive image sizes tailored to user viewports.
- Avoid performance bottlenecks caused by un-optimized un-sized images and external font network requests.

---

## Overview & Core Explanation

Un-optimized media assets—specifically large un-compressed images and web fonts loaded from external CDNs—are the leading cause of poor web performance, high Cumulative Layout Shift (CLS), and low Core Web Vitals scores.

Next.js 16 solves these challenges through built-in media optimization compilers:
1. **`next/image`**: An extension of the HTML `<img>` element that performs on-demand server-side image resizing, converts heavy JPEGs/PNGs into next-gen AVIF/WebP formats, lazy-loads offscreen images, and enforces explicit width/height dimensions to eliminate layout shifts.
2. **`next/font`**: Automatically optimizes custom local fonts and Google Fonts, downloading font files at build time to self-host them alongside static assets with zero external font network requests or flash of unstyled text (FOUT).

```
Image Request Flow (next/image)
   │
   ├─► Browser requests image with viewport hint (e.g. 640px width)
   │
   ├─► Next.js Image Optimization Server
   │     ├── Resizes original image to 640px
   │     ├── Compresses to AVIF / WebP format
   │     └── Caches compressed asset on Edge CDN
   │
   └─► Returns lightweight compressed WebP image to browser
```

---

## Font Optimization with `next/font`

Loading fonts directly from third-party CDNs (such as `fonts.googleapis.com`) introduces external DNS lookup stalls and privacy tracking issues. `next/font` downloads font files at build time and self-hosts them from your own domain.

### Practical Example: Configuring Fonts in App Router (`app/fonts.ts`)

```typescript
// app/fonts.ts
import { Inter, JetBrains_Mono } from "next/font/google";

/**
 * Configure Inter as primary sans-serif font
 */
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // Ensures fallback font displays while primary font loads
});

/**
 * Configure JetBrains Mono for code blocks and monospace elements
 */
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
```

```typescript
// app/layout.tsx (Server Component Root Layout)
import { fontSans, fontMono } from "./fonts";
import { cn } from "@/lib/utils";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(fontSans.variable, fontMono.variable)}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
```

Now, Tailwind utility classes like `font-sans` and `font-mono` reference local, self-hosted font files with zero network latency.

---

## Image Optimization with `next/image`

The `<Image />` component requires explicit dimensions (`width` and `height`) or the `fill` prop to reserve DOM aspect ratio space before the image binary finishes loading over the network.

### 1. Static Local Image Import (Automatic Aspect Ratio & Blur Placeholder)

When you import a local image file statically, Next.js automatically calculates its native `width`, `height`, and `blurDataURL` at build time.

```typescript
// app/dashboard/overview/page.tsx
import Image from "next/image";
import heroBanner from "@/public/assets/dashboard-banner.png";

export default function OverviewPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Executive Dashboard</h1>

      <div className="relative rounded-xl overflow-hidden border">
        {/* Local import provides automatic width, height, and blurred LQIP placeholder */}
        <Image
          src={heroBanner}
          alt="Acme Telemetry Analytics Banner"
          placeholder="blur"
          priority // Preloads above-the-fold image immediately
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
}
```

### 2. Dynamic Remote Image with `sizes` and `fill` Props

When rendering dynamic user avatar URLs or database project cover images where exact pixel dimensions vary by screen size, use the `fill` prop paired with the `sizes` hint attribute.

> **Crucial Rule**: The `sizes` attribute informs the browser's preload scanner which image breakpoint size to fetch before CSS layout computation finishes, saving significant mobile bandwidth.

```typescript
// app/dashboard/projects/_components/project-card.tsx
import Image from "next/image";

interface ProjectCardProps {
  title: string;
  coverImageUrl: string;
}

export function ProjectCard({ title, coverImageUrl }: ProjectCardProps) {
  return (
    <div className="border rounded-xl overflow-hidden bg-card shadow-sm space-y-3">
      {/* Container must have relative positioning and fixed height/aspect ratio when using fill */}
      <div className="relative w-full h-48 bg-muted">
        <Image
          src={coverImageUrl}
          alt={`Cover graphic for ${title}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
    </div>
  );
}
```

---

## Configuring Remote Image Domains (`next.config.ts`)

For security, Next.js blocks rendering remote images from arbitrary external URLs to prevent server SSR image optimization proxy abuse. You must explicitly register allowed remote image domains in `next.config.ts`.

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"], // Prefers AVIF format for highest compression
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
        port: "",
        pathname: "/acme-app-assets/**",
      },
    ],
  },
};

export default nextConfig;
```

---

## Media Optimization Matrix

| Asset Type | Optimization Tool | Key Props / Configuration | Result |
| :--- | :--- | :--- | :--- |
| **Above-the-Fold Hero Image** | `next/image` | `priority={true}` | Preloads image payload immediately; improves Largest Contentful Paint (LCP). |
| **Below-the-Fold Content Image** | `next/image` | Default lazy loading + `placeholder="blur"` | Lazy-loads on scroll; 0 KB initial bandwidth impact. |
| **Responsive Grid Image** | `next/image` | `fill` + `sizes="..."` | Serves exact responsive breakpoint image size tailored to screen viewport. |
| **Google Fonts** | `next/font/google` | `subsets: ['latin']`, `display: 'swap'` | Self-hosts font files locally; 0 external CDN DNS lookups; 0 CLS. |

---

## Common Mistakes

1. **Using Standard `<img>` Tags for Content Images**: Bypassing `next/image` using raw `<img>` tags, shipping multi-megabyte uncompressed JPEGs to mobile devices.
2. **Omitting `sizes` When Using `fill`**: Using `<Image fill />` without defining `sizes`. This causes Next.js to serve the maximum desktop image resolution to small mobile viewports.
3. **Setting `priority` on Every Image**: Marking dozens of below-the-fold images with `priority`, overwhelming browser network bandwidth during initial page load.

---

## Production Considerations

- **Modern Format Support**: Enable `formats: ['image/avif', 'image/webp']` in `next.config.ts`. AVIF images are typically 20% smaller than WebP images at equivalent visual quality.
- **CDN Caching for Media**: Ensure production proxies (e.g. Cloudflare or Vercel Edge) cache optimized image URLs with long `Cache-Control` headers (`public, max-age=31536000, immutable`).
- **SVG Vector Handling**: SVGs are vector graphics that do not require raster optimization. Render static local SVGs directly using inline React components or standard SVG tags.

---

## Summary

Media asset optimization in Next.js 16 is powered by `next/image` and `next/font`. By enforcing self-hosted zero-CLS fonts, enabling modern AVIF/WebP image compression, and configuring responsive sizes, you maximize page load speeds and achieve high Core Web Vitals scores.

---

## Checklist
- [ ] Replaced raw `<img>` tags with `<Image />` from `next/image`.
- [ ] Configured self-hosted fonts using `next/font/google` or `next/font/local`.
- [ ] Set `priority={true}` strictly on above-the-fold hero images to improve LCP.
- [ ] Added `sizes` hint string when using `fill` on dynamic grid images.
- [ ] Registered authorized external image domains in `next.config.ts` under `remotePatterns`.
