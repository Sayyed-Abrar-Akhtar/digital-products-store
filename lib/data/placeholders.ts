import { Product, Category, Bundle, FreeResource, BlogPost } from "@/types";

export const PLACEHOLDER_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    slug: "developer-tools",
    name: "Developer Tools",
    description: "Boilerplates, CLI utilities, and component kits built for modern web applications.",
    productCountPlaceholder: 12,
  },
  {
    id: "cat-2",
    slug: "design-systems",
    name: "Design Systems",
    description: "UI kits, typography systems, and icon sets crafted for crisp product design.",
    productCountPlaceholder: 8,
  },
  {
    id: "cat-3",
    slug: "templates-themes",
    name: "Templates & Themes",
    description: "Production-ready web templates optimized for performance and conversion.",
    productCountPlaceholder: 15,
  },
  {
    id: "cat-4",
    slug: "guides-ebooks",
    name: "Guides & Architecture",
    description: "Technical playbooks, architecture blue-prints, and deep-dive engineering guides.",
    productCountPlaceholder: 6,
  },
];

export const PLACEHOLDER_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    slug: "nextjs-saas-starter-kit",
    name: "[Placeholder] Modern Next.js SaaS Architecture Kit",
    tagline: "Comprehensive foundation for building modern web applications with Next.js 16.",
    description:
      "This is a placeholder product representing a full-featured starter kit. It features modular architecture, strict TypeScript configurations, design system setup, and responsive UI components.",
    price: 49,
    originalPrice: 79,
    categorySlug: "developer-tools",
    categoryName: "Developer Tools",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Architecture"],
    features: [
      "Next.js 16 App Router setup",
      "Full TypeScript strict mode",
      "Tailwind CSS design tokens",
      "Production-ready project structure",
      "SEO & Open Graph foundation",
    ],
    fileFormat: "ZIP Source Code",
    version: "1.0.0",
    updatedAt: "2025-02-01",
    badge: "Featured",
  },
  {
    id: "prod-2",
    slug: "minimalist-ui-design-tokens",
    name: "[Placeholder] Minimalist Design Tokens & System",
    tagline: "Essential design tokens, typography scales, and UI assets for digital product designers.",
    description:
      "A clean, developer-focused design token system designed to maintain strict visual hierarchy and accessibility compliance.",
    price: 29,
    categorySlug: "design-systems",
    categoryName: "Design Systems",
    tags: ["Design System", "UI Kit", "Tailwind", "Typography"],
    features: [
      "Comprehensive color palettes",
      "Accessible contrast pairs",
      "Fluid typography scale",
      "Figma token mapping",
    ],
    fileFormat: "JSON / Figma / CSS",
    version: "2.1.0",
    updatedAt: "2025-01-20",
  },
  {
    id: "prod-3",
    slug: "ecommerce-analytics-dashboard-template",
    name: "[Placeholder] Ecommerce Analytics Dashboard Template",
    tagline: "Minimalist dashboard layout for tracking sales, analytics, and product performance.",
    description:
      "A fast, responsive dashboard layout crafted with Tailwind CSS and Server Components for real-time reporting views.",
    price: 39,
    originalPrice: 59,
    categorySlug: "templates-themes",
    categoryName: "Templates & Themes",
    tags: ["Dashboard", "React", "Tailwind CSS", "Analytics"],
    features: [
      "Responsive grid layout",
      "Data visualizer placeholders",
      "Dark and light theme support",
      "Clean component abstractions",
    ],
    fileFormat: "React / Next.js Source",
    version: "1.2.0",
    updatedAt: "2025-02-10",
    badge: "Popular",
  },
  {
    id: "prod-4",
    slug: "fullstack-performance-playbook",
    name: "[Placeholder] Modern Web Performance Architecture Guide",
    tagline: "Practical architectural patterns for building ultra-fast React and Next.js applications.",
    description:
      "A complete guide on optimizing Core Web Vitals, server response times, caching strategies, and asset loading.",
    price: 19,
    categorySlug: "guides-ebooks",
    categoryName: "Guides & Architecture",
    tags: ["Performance", "SEO", "Next.js", "Guide"],
    features: [
      "Core Web Vitals optimization checklist",
      "Dynamic import & bundle size strategies",
      "Edge caching patterns",
      "PDF & EPUB formats",
    ],
    fileFormat: "PDF / EPUB",
    version: "1.0.0",
    updatedAt: "2025-01-15",
  },
];

export const PLACEHOLDER_BUNDLES: Bundle[] = [
  {
    id: "bundle-1",
    slug: "developer-complete-suite",
    title: "[Placeholder] Complete Developer & UI Architecture Bundle",
    description: "Get all developer toolkits, design systems, and architecture guides in one discounted package.",
    price: 89,
    originalValue: 136,
    includedProductSlugs: [
      "nextjs-saas-starter-kit",
      "minimalist-ui-design-tokens",
      "fullstack-performance-playbook",
    ],
    badge: "Best Value",
  },
];

export const PLACEHOLDER_FREE_RESOURCES: FreeResource[] = [
  {
    id: "free-1",
    slug: "nextjs-16-cheatsheet",
    title: "[Placeholder] Next.js 16 App Router Quick Reference Cheat Sheet",
    description: "A concise reference guide covering Server Components, Caching, and Metadata API conventions.",
    format: "PDF Document",
    downloadUrlPlaceholder: "#download-placeholder",
    category: "Developer Tools",
    createdAt: "2025-02-01",
  },
  {
    id: "free-2",
    slug: "tailwind-accessibility-checklist",
    title: "[Placeholder] Tailwind CSS Accessibility & Design Token Checklist",
    description: "Handy checklist to ensure high contrast ratio, proper focus management, and semantic HTML.",
    format: "Markdown / PDF",
    downloadUrlPlaceholder: "#download-placeholder",
    category: "Design Systems",
    createdAt: "2025-01-25",
  },
];

export const PLACEHOLDER_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    slug: "building-scalable-digital-product-stores",
    title: "[Placeholder] Architecture Strategy for High-Performance Digital Product Stores",
    excerpt: "Exploring the fundamental architectural decisions behind fast, accessible, and SEO-first digital marketplaces.",
    content: `
Building a modern digital store requires a tight focus on performance, accessibility, and clear architecture.
By utilizing Next.js Server Components, static generation, and structured metadata, digital storefronts can deliver exceptional speed and SEO discoverability.

### Key Architectural Pillars
1. **Server-First Rendering**: Offloading heavy layout computation and static catalog data to the server.
2. **Decoupled Data Layers**: Keeping product models distinct from visual UI components to ensure clean maintenance.
3. **Optimized SEO**: Crafting dynamic sitemaps, Open Graph images, and semantic HTML structure.
    `,
    category: "Engineering",
    author: {
      name: "Sayyed Abrar Akhtar",
      role: "Lead Architect",
    },
    publishedAt: "2025-02-12",
    readTime: "5 min read",
  },
  {
    id: "post-2",
    slug: "seo-best-practices-for-nextjs-16",
    title: "[Placeholder] Technical SEO Best Practices for Next.js 16 App Router",
    excerpt: "How to configure metadata, canonical URLs, dynamic sitemaps, and structured data in Next.js 16.",
    content: `
SEO is critical for organic growth in digital product distribution. Next.js 16 provides built-in primitives for managing metadata, dynamic robots.txt, and sitemaps cleanly.

### Essential Practices
- Utilize \`metadataBase\` in root layout to enforce canonical domain resolution.
- Define explicit \`robots.ts\` and \`sitemap.ts\` routes.
- Implement structured semantic tags and ARIA labels.
    `,
    category: "SEO & Growth",
    author: {
      name: "Sayyed Abrar Akhtar",
      role: "Lead Architect",
    },
    publishedAt: "2025-02-05",
    readTime: "4 min read",
  },
];
