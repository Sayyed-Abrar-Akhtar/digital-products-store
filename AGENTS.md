# Project Instructions & Guidelines

## Tech Stack & Core Requirements
- **Next.js Version**: Next.js 16.x is strictly required (target: 16.3.4). **NEVER** downgrade to Next.js 14 or 15 under any circumstances.
- **Router**: Use Next.js App Router exclusively. Do NOT use the Pages Router.
- **Language**: TypeScript with strict type checking enabled.
- **Styling**: Tailwind CSS with CSS variables for design tokens.

## Architectural Principles
- **Server Components First**: Prefer React Server Components (RSC) by default. Use Client Components (`'use client'`) only when interactive state, event handlers, or browser APIs are strictly required.
- **Data & Presentation Separation**: Do not hardcode business or product data directly into UI components. Keep data mock/fetch logic in `lib/` and types in `types/`.
- **Minimal Dependencies**: Do not introduce unnecessary third-party packages or bloated dependencies. Maintain a clean, modern, and maintained dependency graph.
- **Architecture Preservation**: Preserve existing project structure and conventions unless explicit architectural changes are requested.

## Quality, Performance & Security Standards
- **Accessibility**: Follow WCAG / ARIA best practices (semantic HTML, proper labeling, keyboard navigation, focus indicators).
- **SEO**: Adhere to SEO best practices (proper dynamic title/description metadata, canonical URLs, semantic tags, Open Graph images, sitemap, robots.txt).
- **Security**:
  - Never hardcode or expose secrets, API keys, or sensitive credentials in source code or client bundles.
  - Do NOT implement fake security, mock authentication claims, or pseudo-payment bypass mechanisms.
- **Verification**: Always run linting (`npm run lint`), TypeScript checks (`npx tsc --noEmit`), and production builds (`npm run build`) before marking tasks complete.

## Brand Assets & Logo Usage
- **Logo Files**:
  - `public/logo.png`: Main brand logo with solid background (1254x1254).
  - `public/logo-transparent.png`: Main brand logo with transparent background (1254x1254).
- **UI Guidelines**:
  - Use `public/logo-transparent.png` for header/footer logos and UI header navigation where background blending is required.
  - Use `public/logo.png` for solid background logo representations, previews, or social metadata assets.
  - Ensure all rendered logo image tags include appropriate `alt` attributes and maintain correct aspect ratios using Next.js `Image`.
