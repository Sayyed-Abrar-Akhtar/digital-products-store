import { Product, Category, Bundle, FreeResource, BlogPost } from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "cat-1",
    slug: "developer-tools",
    name: "Developer Tools",
    description: "Boilerplates, starter kits, and CLI utilities built for modern web applications.",
  },
  {
    id: "cat-2",
    slug: "design-systems",
    name: "Design Systems",
    description: "UI component kits, typography scales, and token systems crafted for clean product design.",
  },
  {
    id: "cat-3",
    slug: "templates-themes",
    name: "Templates & Themes",
    description: "Production-ready web templates optimized for speed, accessibility, and high conversion.",
  },
  {
    id: "cat-4",
    slug: "guides-ebooks",
    name: "Guides & Architecture",
    description: "Technical playbooks, architecture blueprints, and deep-dive web engineering guides.",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    slug: "nextjs-saas-starter-kit",
    name: "Modern Next.js SaaS Architecture Kit",
    shortDescription: "Comprehensive foundation for building modern web applications with Next.js 16.",
    description:
      "A modular starter kit engineered with Next.js 16 App Router, React 19, strict TypeScript configurations, and Tailwind CSS. Designed for rapid SaaS development with performance and maintainability at its core.",
    category: "Developer Tools",
    categorySlug: "developer-tools",
    categoryName: "Developer Tools",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Architecture"],
    price: 49,
    compareAtPrice: 79,
    currency: "USD",
    images: ["/images/products/nextjs-starter.png"],
    features: [
      "Next.js 16 App Router architecture",
      "Full TypeScript strict mode configuration",
      "Tailwind CSS design token structure",
      "Modular Server Components pattern",
      "SEO & Open Graph dynamic metadata foundation",
    ],
    requirements: [
      "Node.js 20.x or higher",
      "Next.js 16+",
      "TypeScript 5+",
    ],
    version: "1.0.0-dev",
    status: "in_development",
    featured: true,
    createdAt: "2025-02-01",
    updatedAt: "2025-02-15",
    seoTitle: "Next.js 16 SaaS Starter Kit — Developer Foundation",
    seoDescription: "Engineered SaaS starter kit built on Next.js 16 App Router, React 19, strict TypeScript, and Tailwind CSS.",
    badge: "In Development",
  },
  {
    id: "prod-2",
    slug: "minimalist-ui-design-tokens",
    name: "Minimalist Design Tokens & System",
    shortDescription: "Essential design tokens, typography scales, and UI assets for digital product designers.",
    description:
      "A clean design token system engineered to maintain visual hierarchy, color contrast ratios, and fluid responsive typography across dark and light themes.",
    category: "Design Systems",
    categorySlug: "design-systems",
    categoryName: "Design Systems",
    tags: ["Design System", "UI Kit", "Tailwind", "Typography"],
    price: 29,
    currency: "USD",
    images: ["/images/products/design-tokens.png"],
    features: [
      "Comprehensive color palettes & CSS variables",
      "Accessible high-contrast color pairings",
      "Fluid typography scale for desktop & mobile",
      "Tailwind CSS theme tokens mapping",
    ],
    requirements: [
      "Tailwind CSS 3.4+ or 4.x",
      "CSS Variable support",
    ],
    version: "2.1.0-dev",
    status: "in_development",
    featured: true,
    createdAt: "2025-01-20",
    updatedAt: "2025-02-10",
    seoTitle: "Minimalist UI Design Tokens — Design System Asset",
    seoDescription: "Design token system with accessible color scales, fluid typography, and Tailwind CSS mappings.",
    badge: "Upcoming",
  },
  {
    id: "prod-3",
    slug: "ecommerce-analytics-dashboard-template",
    name: "Ecommerce Analytics Dashboard Template",
    shortDescription: "Minimalist dashboard layout for tracking sales, analytics, and product performance.",
    description:
      "A fast, responsive analytics dashboard crafted with Tailwind CSS and Server Components for real-time reporting views and clean data representation.",
    category: "Templates & Themes",
    categorySlug: "templates-themes",
    categoryName: "Templates & Themes",
    tags: ["Dashboard", "React", "Tailwind CSS", "Analytics"],
    price: 39,
    compareAtPrice: 59,
    currency: "USD",
    images: ["/images/products/analytics-dashboard.png"],
    features: [
      "Responsive metric grid layouts",
      "Data visualizer container components",
      "Dark and light theme support",
      "Clean React Server Component abstractions",
    ],
    requirements: [
      "React 19+",
      "Next.js 16+",
      "Tailwind CSS",
    ],
    version: "1.2.0-dev",
    status: "in_development",
    featured: true,
    createdAt: "2025-02-10",
    updatedAt: "2025-02-18",
    seoTitle: "Ecommerce Analytics Dashboard Template — React & Next.js",
    seoDescription: "Minimalist analytics dashboard template for Next.js 16 and React 19.",
    badge: "In Development",
  },
  {
    id: "prod-4",
    slug: "fullstack-performance-playbook",
    name: "Modern Web Performance Architecture Guide",
    shortDescription: "Practical architectural patterns for building ultra-fast React and Next.js applications.",
    description:
      "A comprehensive technical playbook detailing optimizations for Core Web Vitals, server response times, caching strategies, dynamic imports, and edge execution.",
    category: "Guides & Architecture",
    categorySlug: "guides-ebooks",
    categoryName: "Guides & Architecture",
    tags: ["Performance", "SEO", "Next.js", "Guide"],
    price: 19,
    currency: "USD",
    images: ["/images/products/performance-playbook.png"],
    features: [
      "Core Web Vitals optimization checklist",
      "Dynamic import & bundle reduction strategies",
      "Edge caching & stale-while-revalidate patterns",
      "PDF & EPUB formats included",
    ],
    requirements: [
      "PDF / EPUB reader",
    ],
    version: "1.0.0-dev",
    status: "coming_soon",
    featured: false,
    createdAt: "2025-01-15",
    updatedAt: "2025-02-01",
    seoTitle: "Modern Web Performance Architecture Guide",
    seoDescription: "Deep-dive guide on Core Web Vitals, server caching, and bundle optimization for Next.js.",
    badge: "Coming Soon",
  },
];

export const BUNDLES: Bundle[] = [
  {
    id: "bundle-1",
    slug: "developer-complete-suite",
    title: "Complete Developer & UI Architecture Bundle",
    description: "Combine all developer toolkits, design systems, and technical playbooks in one suite upon release.",
    price: 89,
    originalValue: 136,
    includedProductSlugs: [
      "nextjs-saas-starter-kit",
      "minimalist-ui-design-tokens",
      "fullstack-performance-playbook",
    ],
    badge: "Upcoming Suite",
    status: "coming_soon",
  },
];

export const FREE_RESOURCES: FreeResource[] = [
  {
    id: "free-1",
    slug: "nextjs-16-cheatsheet",
    title: "Next.js 16 App Router Quick Reference Cheat Sheet",
    description: "A concise reference guide covering Server Components, Caching, and Metadata API conventions.",
    format: "PDF Document",
    category: "Developer Tools",
    createdAt: "2025-02-01",
  },
  {
    id: "free-2",
    slug: "tailwind-accessibility-checklist",
    title: "Tailwind CSS Accessibility & Design Token Checklist",
    description: "Handy checklist to ensure high contrast ratio, proper focus management, and semantic HTML.",
    format: "Markdown / PDF",
    category: "Design Systems",
    createdAt: "2025-01-25",
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    slug: "building-scalable-digital-product-stores",
    title: "Architecture Strategy for High-Performance Digital Product Stores",
    excerpt: "Exploring the fundamental architectural decisions behind fast, accessible, and SEO-first digital storefronts.",
    content: `Building a modern digital store requires a tight focus on performance, accessibility, and clean architecture. By utilizing Next.js Server Components, static generation, and structured metadata, digital storefronts can deliver exceptional speed and SEO discoverability.

### Key Architectural Pillars

1. **Server-First Rendering**: Offloading heavy layout computation and catalog data to the server.
2. **Decoupled Data Layers**: Keeping product models distinct from visual UI components to ensure clean code maintenance.
3. **SEO Readiness**: Crafting dynamic sitemaps, Open Graph metadata, and semantic HTML structure from day one.`,
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
    title: "Technical SEO Best Practices for Next.js 16 App Router",
    excerpt: "How to configure metadata, canonical URLs, dynamic sitemaps, and structured data in Next.js 16.",
    content: `SEO is critical for organic growth in digital product distribution. Next.js 16 provides built-in primitives for managing metadata, dynamic robots.txt, and sitemaps cleanly.

### Essential Practices

- Utilize \`metadataBase\` in root layout to enforce canonical domain resolution.
- Define explicit \`robots.ts\` and \`sitemap.ts\` routes.
- Implement structured semantic tags, JSON-LD schemas, and ARIA labels.`,
    category: "SEO & Growth",
    author: {
      name: "Sayyed Abrar Akhtar",
      role: "Lead Architect",
    },
    publishedAt: "2025-02-05",
    readTime: "4 min read",
  },
];

// Re-exports for backward compatibility during refactoring
export const PLACEHOLDER_CATEGORIES = CATEGORIES;
export const PLACEHOLDER_PRODUCTS = PRODUCTS;
export const PLACEHOLDER_BUNDLES = BUNDLES;
export const PLACEHOLDER_FREE_RESOURCES = FREE_RESOURCES;
export const PLACEHOLDER_BLOG_POSTS = BLOG_POSTS;
