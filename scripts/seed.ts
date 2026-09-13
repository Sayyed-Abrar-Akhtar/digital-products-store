import mongoose from "mongoose";
import { connectToDatabase } from "../lib/db/mongodb";
import {
  Category,
  Tag,
  Product,
  Bundle,
  ProductVersion,
} from "../lib/db/models";

/**
 * DEVELOPMENT SEED SCRIPT
 * -----------------------
 * WARNING: This script is intended strictly for local development and testing environments.
 * It seeds sample category, tag, product, bundle, and version documents in MongoDB.
 *
 * DO NOT RUN THIS IN PRODUCTION.
 */

async function seedDatabase() {
  if (process.env.NODE_ENV === "production") {
    console.error("CRITICAL ERROR: Seed script cannot be run in production mode.");
    process.exit(1);
  }

  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    console.error("ERROR: MONGODB_URI is not set in environment variables.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB for seeding...");
  const db = await connectToDatabase();
  if (!db) {
    console.error("ERROR: Could not establish connection to MongoDB.");
    process.exit(1);
  }

  console.log("Seeding categories (idempotent upsert)...");
  const categoriesData = [
    {
      name: "Next.js & React",
      slug: "nextjs-react",
      description: "Production-ready boilerplates, architecture starters, and React 19 frameworks.",
      seoTitle: "Next.js & React Starter Kits — Web Architecture",
      seoDescription: "Production-ready boilerplates and architecture starters built with Next.js 16 App Router, React 19, and TypeScript.",
    },
    {
      name: "Website Templates",
      slug: "website-templates",
      description: "High-performance web templates engineered with Next.js App Router and Tailwind CSS.",
      seoTitle: "Next.js Website Templates & Admin Dashboards",
      seoDescription: "Responsive, high-performance web templates optimized for speed, accessibility, and modern UI design.",
    },
    {
      name: "UI & Design Systems",
      slug: "ui-design-systems",
      description: "Modular design token systems, accessible UI component kits, and design assets.",
      seoTitle: "UI & Design Systems — Component Kits & Tokens",
      seoDescription: "Accessible UI component kits, design token systems, and CSS variables mapped for Tailwind CSS.",
    },
    {
      name: "Developer Tools",
      slug: "developer-tools",
      description: "API documentation starters, CLI utilities, and developer workflow automation tools.",
      seoTitle: "Developer Tools & API Documentation Starters",
      seoDescription: "Developer workflow tools, REST and GraphQL API documentation templates, and CLI starters.",
    },
    {
      name: "Productivity",
      slug: "productivity",
      description: "Technical project planning templates, freelancer business toolkits, and workflow frameworks.",
      seoTitle: "Developer Productivity & Freelancer Business Toolkits",
      seoDescription: "Technical scoping templates, freelancer consulting frameworks, and RFC project planning structures.",
    },
    {
      name: "Guides & Resources",
      slug: "guides-resources",
      description: "Technical checklists, architecture playbooks, and production readiness guides.",
      seoTitle: "Technical Guides, SEO Checklists & Architecture Playbooks",
      seoDescription: "Deep-dive technical guides, Next.js 16 SEO checklists, and production security launch playbooks.",
    },
    {
      name: "Ebooks",
      slug: "ebooks",
      description: "Actionable ebooks, research-backed study systems, and educational productivity guides.",
      seoTitle: "Educational Ebooks & Study Productivity Systems",
      seoDescription: "Practical digital ebooks and learning frameworks designed for structured study, retention, and exam preparation.",
    },
  ];

  const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const cat of categoriesData) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: cat },
      { upsert: true, new: true }
    );
    categoryMap[cat.slug] = doc._id as mongoose.Types.ObjectId;
  }

  console.log("Seeding tags (idempotent upsert)...");
  const tagsData = [
    { name: "Next.js", slug: "nextjs", description: "Next.js framework tag" },
    { name: "React", slug: "react", description: "React 19 tag" },
    { name: "TypeScript", slug: "typescript", description: "Strict TypeScript tag" },
    { name: "Tailwind CSS", slug: "tailwind-css", description: "Tailwind CSS styling tag" },
    { name: "SaaS", slug: "saas", description: "Software as a Service architecture tag" },
    { name: "UI Kit", slug: "ui-kit", description: "User interface kit tag" },
    { name: "Dashboard", slug: "dashboard", description: "Admin and analytics dashboard tag" },
    { name: "Startup", slug: "startup", description: "Startup product tag" },
    { name: "Developer", slug: "developer", description: "Developer tools tag" },
    { name: "Productivity", slug: "productivity", description: "Productivity framework tag" },
    { name: "SEO", slug: "seo", description: "Technical SEO tag" },
    { name: "Design System", slug: "design-system", description: "Design tokens and system tag" },
    { name: "Template", slug: "template", description: "Web template tag" },
    { name: "Boilerplate", slug: "boilerplate", description: "Code boilerplate tag" },
    { name: "REST API", slug: "rest-api", description: "REST API tag" },
    { name: "Documentation", slug: "documentation", description: "API and code documentation tag" },
    { name: "Performance", slug: "performance", description: "Performance optimization tag" },
    { name: "Architecture", slug: "architecture", description: "Software architecture tag" },
    { name: "Starter", slug: "starter", description: "Starter project tag" },
    { name: "Checklist", slug: "checklist", description: "Verification checklist tag" },
    { name: "Ebook", slug: "ebook", description: "Digital ebook tag" },
    { name: "PDF", slug: "pdf", description: "PDF digital format tag" },
    { name: "Study System", slug: "study-system", description: "Study system tag" },
    { name: "Learning", slug: "learning", description: "Learning strategies tag" },
  ];

  const tagMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const tag of tagsData) {
    const doc = await Tag.findOneAndUpdate(
      { slug: tag.slug },
      { $set: tag },
      { upsert: true, new: true }
    );
    tagMap[tag.slug] = doc._id as mongoose.Types.ObjectId;
  }

  console.log("Seeding products (idempotent upsert)...");
  const productsData = [
    {
      name: "Next.js 16 SaaS Architecture Starter",
      slug: "nextjs-saas-starter-kit",
      shortDescription: "Complete full-stack SaaS boilerplate with Next.js 16 App Router, React 19, and MongoDB.",
      description:
        "A modular, production-ready SaaS architecture starter engineered with Next.js 16 App Router, React 19, strict TypeScript, Mongoose, and Tailwind CSS. Built with clean server/client separation and SEO foundations.",
      status: "published",
      productType: "software",
      isFree: false,
      price: 49,
      compareAtPrice: 79,
      currency: "USD",
      featured: true,
      demoUrl: "https://example.com/demo/nextjs-saas",
      documentationUrl: "https://example.com/docs/nextjs-saas",
      requirements: ["Node.js 20.x or higher", "Next.js 16+", "MongoDB 6.0+", "TypeScript 5+"],
      version: "1.0.0",
      categorySlug: "nextjs-react",
      tagSlugs: ["nextjs", "react", "typescript", "tailwind-css", "saas", "boilerplate"],
      images: [{ url: "/images/products/nextjs-starter.png", altText: "Next.js SaaS Starter", sortOrder: 0, isPrimary: true }],
      features: [
        { title: "Next.js 16 App Router & React 19 architecture", description: "Server Components first with strict separation of server/client code.", sortOrder: 0 },
        { title: "Strict TypeScript type checking configuration", description: "No implicit any, strict null checks enabled throughout.", sortOrder: 1 },
        { title: "MongoDB & Mongoose connection pooling setup", description: "Reuses database connection cache across Next.js hot reloads.", sortOrder: 2 },
        { title: "Tailwind CSS custom design token integration", description: "Configured CSS variables for dark and light theme tokens.", sortOrder: 3 },
        { title: "Dynamic Open Graph and SEO metadata helpers", description: "Built-in metadata generators and canonical link resolutions.", sortOrder: 4 },
        { title: "Clean server-only data access layer patterns", description: "Safe database queries strictly isolated from client bundles.", sortOrder: 5 },
      ],
      seoTitle: "Next.js 16 SaaS Architecture Starter — Full-Stack Boilerplate",
      seoDescription: "Engineered SaaS architecture starter built with Next.js 16 App Router, React 19, strict TypeScript, and MongoDB.",
      badge: "Bestseller",
    },
    {
      name: "Modern Admin & Operational Dashboard Kit",
      slug: "nextjs-admin-dashboard-kit",
      shortDescription: "Clean operational dashboard template for managing product data and metrics.",
      description:
        "A fast, responsive administrative interface template crafted with Next.js 16 App Router and Tailwind CSS. Built with Server Components for low latency metric rendering and modular UI components.",
      status: "published",
      productType: "template",
      isFree: false,
      price: 39,
      compareAtPrice: 59,
      currency: "USD",
      featured: true,
      requirements: ["Node.js 20.x or higher", "Next.js 16+", "Tailwind CSS 3.4+"],
      version: "1.1.0",
      categorySlug: "website-templates",
      tagSlugs: ["nextjs", "dashboard", "ui-kit", "tailwind-css", "template"],
      images: [{ url: "/images/products/admin-dashboard.png", altText: "Admin Dashboard Kit", sortOrder: 0, isPrimary: true }],
      features: [
        { title: "Responsive analytics grid and metric cards", sortOrder: 0 },
        { title: "Accessible table layouts with sorting controls", sortOrder: 1 },
        { title: "Dark and light mode color variable bindings", sortOrder: 2 },
        { title: "Reusable React Server Component layout primitives", sortOrder: 3 },
        { title: "Clean filter and search bar abstractions", sortOrder: 4 },
      ],
      seoTitle: "Modern Admin & Operational Dashboard Kit — Next.js 16 Template",
      seoDescription: "Responsive admin dashboard template built with Next.js 16 App Router, React 19, and Tailwind CSS.",
      badge: "Popular",
    },
    {
      name: "Minimalist Developer Portfolio Starter",
      slug: "developer-portfolio-starter",
      shortDescription: "Sleek, lightning-fast portfolio template for software engineers and creators.",
      description:
        "Showcase your engineering projects, technical writing, and open-source contributions with a clean, accessible Next.js portfolio template optimized for lighthouse performance.",
      status: "published",
      productType: "template",
      isFree: false,
      price: 19,
      compareAtPrice: 29,
      currency: "USD",
      featured: false,
      requirements: ["Node.js 20.x or higher", "Next.js 16+"],
      version: "1.0.0",
      categorySlug: "website-templates",
      tagSlugs: ["react", "nextjs", "developer", "template", "tailwind-css"],
      images: [{ url: "/images/products/portfolio-starter.png", altText: "Developer Portfolio Starter", sortOrder: 0, isPrimary: true }],
      features: [
        { title: "100/100 Lighthouse performance target score", sortOrder: 0 },
        { title: "Markdown & MDX project showcase layout", sortOrder: 1 },
        { title: "Semantic HTML tags with ARIA accessibility labels", sortOrder: 2 },
        { title: "Responsive typography and code block formatting", sortOrder: 3 },
      ],
      seoTitle: "Minimalist Developer Portfolio Starter — Next.js Portfolio Template",
      seoDescription: "Sleek, accessible developer portfolio template built with Next.js 16 and Tailwind CSS.",
    },
    {
      name: "REST & GraphQL API Documentation Starter",
      slug: "api-documentation-starter",
      shortDescription: "Structured documentation template for REST APIs and GraphQL microservices.",
      description:
        "Provide clear, beautiful documentation for your APIs. Includes code syntax highlighting, endpoint reference cards, interactive query preview structures, and search filter controls.",
      status: "published",
      productType: "tool",
      isFree: false,
      price: 15,
      currency: "USD",
      featured: false,
      requirements: ["Node.js 20.x or higher", "Next.js 16+"],
      version: "1.0.0",
      categorySlug: "developer-tools",
      tagSlugs: ["developer", "rest-api", "documentation", "typescript"],
      images: [{ url: "/images/products/api-docs.png", altText: "API Documentation Starter", sortOrder: 0, isPrimary: true }],
      features: [
        { title: "Structured endpoint specification layout", sortOrder: 0 },
        { title: "Multi-language code snippet tab components", sortOrder: 1 },
        { title: "Fast client-side document search indexing", sortOrder: 2 },
        { title: "Mobile-responsive side navigation tree", sortOrder: 3 },
      ],
      seoTitle: "REST & GraphQL API Documentation Starter — Developer Tool",
      seoDescription: "Structured API documentation template with multi-language code snippets and endpoint cards.",
    },
    {
      name: "Developer Dashboard Design System",
      slug: "developer-dashboard-ui-system",
      shortDescription: "Comprehensive UI token system and component kit for developer web apps.",
      description:
        "A clean design token architecture and UI system crafted specifically for developer tools and technical web apps. Built with CSS variables and Tailwind CSS tokens.",
      status: "published",
      productType: "template",
      isFree: false,
      price: 29,
      compareAtPrice: 45,
      currency: "USD",
      featured: true,
      requirements: ["Tailwind CSS 3.4+ or 4.x", "CSS Variable support"],
      version: "2.0.0",
      categorySlug: "ui-design-systems",
      tagSlugs: ["ui-kit", "design-system", "tailwind-css"],
      images: [{ url: "/images/products/design-system.png", altText: "Developer Design System", sortOrder: 0, isPrimary: true }],
      features: [
        { title: "Comprehensive CSS variable design tokens", sortOrder: 0 },
        { title: "High-contrast, accessible color palettes", sortOrder: 1 },
        { title: "Fluid typography scale for mobile and desktop", sortOrder: 2 },
        { title: "Pre-configured Tailwind CSS theme mapping", sortOrder: 3 },
        { title: "Monospace metric and badge component primitives", sortOrder: 4 },
      ],
      seoTitle: "Developer Dashboard Design System — UI Tokens & Kit",
      seoDescription: "Design token system with accessible color scales, fluid typography, and Tailwind CSS mappings.",
      badge: "Updated",
    },
    {
      name: "Software Engineer Freelancer Business Toolkit",
      slug: "freelancer-business-toolkit",
      shortDescription: "Contracts, project scoping templates, and invoice structures for engineering consultants.",
      description:
        "Professional operational templates for freelance developers and technical consultants. Includes project proposal outlines, statement of work structures, and invoice templates.",
      status: "published",
      productType: "resource",
      isFree: false,
      price: 9,
      currency: "USD",
      featured: false,
      requirements: ["Markdown or PDF viewer"],
      version: "1.0.0",
      categorySlug: "productivity",
      tagSlugs: ["productivity", "developer", "startup"],
      images: [{ url: "/images/products/freelancer-toolkit.png", altText: "Freelancer Toolkit", sortOrder: 0, isPrimary: true }],
      features: [
        { title: "Software consulting statement of work template", sortOrder: 0 },
        { title: "Milestone-based project pricing calculator", sortOrder: 1 },
        { title: "Technical discovery call questionnaire", sortOrder: 2 },
        { title: "Clean Markdown and PDF document formats", sortOrder: 3 },
      ],
      seoTitle: "Software Engineer Freelancer Business Toolkit",
      seoDescription: "Professional project scoping templates, contracts, and proposal structures for developer consultants.",
    },

    // Free Published Products
    {
      name: "Next.js 16 SEO & Metadata Checklist",
      slug: "nextjs-seo-checklist",
      shortDescription: "Free comprehensive checklist for technical SEO, metadata, and canonical URL setup.",
      description:
        "Ensure your Next.js 16 App Router application is fully discoverable by search engine crawlers. Covers root metadataBase, Open Graph tags, dynamic sitemaps, robots.txt, and structured JSON-LD data.",
      status: "published",
      productType: "resource",
      isFree: true,
      price: 0,
      currency: "USD",
      featured: true,
      requirements: ["Next.js 16 App Router"],
      version: "1.0.0",
      categorySlug: "guides-resources",
      tagSlugs: ["nextjs", "seo", "checklist"],
      images: [{ url: "/images/products/seo-checklist.png", altText: "Next.js SEO Checklist", sortOrder: 0, isPrimary: true }],
      features: [
        { title: "Step-by-step metadataBase configuration guide", sortOrder: 0 },
        { title: "Dynamic sitemap.ts & robots.ts setup instructions", sortOrder: 1 },
        { title: "Open Graph and Twitter Card image metadata rules", sortOrder: 2 },
        { title: "JSON-LD structured data validation guide", sortOrder: 3 },
      ],
      seoTitle: "Next.js 16 SEO & Metadata Checklist — Free Developer Resource",
      seoDescription: "Free technical SEO checklist for Next.js 16 App Router, Open Graph, and JSON-LD metadata.",
      badge: "Free Resource",
    },
    {
      name: "Production SaaS Launch & Security Checklist",
      slug: "saas-launch-checklist",
      shortDescription: "Essential pre-launch verification checklist for modern full-stack web apps.",
      description:
        "A complete 50-point checklist covering security headers, database connection pooling, error boundary fallbacks, environment variable handling, and rate limiting before going live.",
      status: "published",
      productType: "resource",
      isFree: true,
      price: 0,
      currency: "USD",
      featured: false,
      requirements: ["Markdown or PDF reader"],
      version: "1.0.0",
      categorySlug: "guides-resources",
      tagSlugs: ["saas", "startup", "checklist"],
      images: [{ url: "/images/products/saas-checklist.png", altText: "SaaS Launch Checklist", sortOrder: 0, isPrimary: true }],
      features: [
        { title: "Security headers & CORS policy verification", sortOrder: 0 },
        { title: "Database connection cache & query index validation", sortOrder: 1 },
        { title: "Environment variable secret exposure checks", sortOrder: 2 },
        { title: "Core Web Vitals performance benchmarks", sortOrder: 3 },
      ],
      seoTitle: "Production SaaS Launch & Security Checklist — Free Guide",
      seoDescription: "Free 50-point pre-launch checklist for verifying security, performance, and database setup.",
      badge: "Free Resource",
    },
    {
      name: "Developer Technical Project Planning Template",
      slug: "developer-project-planning-template",
      shortDescription: "Structured technical specification template for engineering projects.",
      description:
        "A practical Markdown template for writing clean technical specification documents (RFCs/Tech Specs) before implementing complex software features.",
      status: "published",
      productType: "resource",
      isFree: true,
      price: 0,
      currency: "USD",
      featured: false,
      requirements: ["Markdown editor"],
      version: "1.0.0",
      categorySlug: "productivity",
      tagSlugs: ["productivity", "developer", "architecture"],
      images: [{ url: "/images/products/project-template.png", altText: "Project Planning Template", sortOrder: 0, isPrimary: true }],
      features: [
        { title: "Architecture diagram & schema definition sections", sortOrder: 0 },
        { title: "Security & risk evaluation questions", sortOrder: 1 },
        { title: "API payload and response model design blocks", sortOrder: 2 },
        { title: "Testing strategy & rollout plan structure", sortOrder: 3 },
      ],
      seoTitle: "Developer Technical Project Planning Template — Free RFC Template",
      seoDescription: "Free Markdown technical specification template for writing RFCs and planning engineering projects.",
      badge: "Free Resource",
    },

    // Coming Soon Product
    {
      name: "High-Conversion Landing Page Component Collection",
      slug: "landing-page-component-collection",
      shortDescription: "A collection of responsive React 19 components designed for SaaS landing pages.",
      description:
        "Upcoming collection of feature grids, pricing tables, hero sections, and FAQ accordions built with Next.js Server Components and Tailwind CSS.",
      status: "coming_soon",
      productType: "template",
      isFree: false,
      price: 29,
      currency: "USD",
      featured: false,
      requirements: ["Next.js 16+", "React 19+", "Tailwind CSS"],
      version: "0.9.0-alpha",
      categorySlug: "website-templates",
      tagSlugs: ["template", "ui-kit", "tailwind-css", "nextjs"],
      images: [{ url: "/images/products/landing-collection.png", altText: "Landing Page Collection", sortOrder: 0, isPrimary: true }],
      features: [
        { title: "Accessible hero and headline layouts", sortOrder: 0 },
        { title: "Interactive pricing comparison matrices", sortOrder: 1 },
        { title: "Optimized SVG icon integration examples", sortOrder: 2 },
        { title: "Responsive navigation headers and footers", sortOrder: 3 },
      ],
      seoTitle: "High-Conversion Landing Page Component Collection — Coming Soon",
      seoDescription: "Upcoming collection of React 19 and Next.js 16 landing page UI components.",
      badge: "Coming Soon",
    },

    // Draft Product (Excluded from public queries)
    {
      name: "Internal Micro-SaaS Analytics Engine",
      slug: "internal-analytics-micro-engine",
      shortDescription: "Unreleased development draft for internal analytics ingestion.",
      description:
        "This is a development draft product specifically created to test database exclusion rules for unreleased content.",
      status: "draft",
      productType: "software",
      isFree: false,
      price: 39,
      currency: "USD",
      featured: false,
      version: "0.1.0-draft",
      categorySlug: "developer-tools",
      tagSlugs: ["developer", "rest-api", "performance"],
      images: [],
      features: [
        { title: "Internal draft feature testing", sortOrder: 0 },
      ],
      seoTitle: "Draft Product — Internal Only",
      seoDescription: "Draft product for internal verification.",
    },

    // Archived Product (Excluded from public queries)
    {
      name: "Legacy Next.js Pages Router Starter",
      slug: "legacy-nextjs-pages-router-template",
      shortDescription: "Archived starter kit for legacy Next.js 14 Pages Router applications.",
      description:
        "This product has been archived and replaced by the Next.js 16 App Router architecture kit.",
      status: "archived",
      productType: "template",
      isFree: false,
      price: 19,
      currency: "USD",
      featured: false,
      version: "1.0.0-archived",
      categorySlug: "nextjs-react",
      tagSlugs: ["nextjs", "template"],
      images: [],
      features: [
        { title: "Legacy pages directory structure", sortOrder: 0 },
      ],
      seoTitle: "Legacy Product — Archived",
      seoDescription: "Archived legacy product.",
    },

    // Real Commercial Digital Ebook Product
    {
      name: "The Student Study System",
      slug: "the-student-study-system",
      shortDescription: "Study Less Randomly. Remember More. Prepare With a System.",
      description:
        "A practical study system for students who spend hours studying but still feel unprepared. Built on five evidence-backed loops (PLAN → LEARN → RETRIEVE → SPACE → MEASURE), this ebook provides step-by-step frameworks, retrieval practice routines, error logs, task checklists, 7-Day Reset, 30-Day Exam Preparation System, and AI study prompts. Please note: This guide is an educational productivity resource, not a guarantee of grades or exam results.",
      status: "published",
      productType: "ebook",
      isFree: false,
      price: 19,
      compareAtPrice: 29,
      currency: "USD",
      featured: true,
      requirements: ["PDF Reader (Adobe Acrobat, Apple Books, Chrome, Preview, or any PDF viewer)"],
      version: "1.0.0",
      categorySlug: "ebooks",
      tagSlugs: ["ebook", "pdf", "productivity", "study-system", "learning"],
      images: [{ url: "/images/products/the-student-study-system.png", altText: "The Student Study System Ebook Cover", sortOrder: 0, isPrimary: true }],
      features: [
        { title: "5-Loop Framework: PLAN → LEARN → RETRIEVE → SPACE → MEASURE", sortOrder: 0 },
        { title: "5-Minute Retrieval Loop & 50-Minute Session Structure", sortOrder: 1 },
        { title: "7-Day Reset & 30-Day Exam Preparation System", sortOrder: 2 },
        { title: "Practice Question Strategy & Diagnostic Error Log", sortOrder: 3 },
        { title: "Daily Task Checklists & Progress Measurement Matrix", sortOrder: 4 },
        { title: "5 Custom AI Study Prompts (Concept Tutor, Quiz, Error Diagnosis, Exam Simulator, Planner)", sortOrder: 5 },
      ],
      seoTitle: "The Student Study System — Practical Ebook for Effective Learning",
      seoDescription: "Study Less Randomly. Remember More. Prepare With a System. Actionable ebook with retrieval practice, spaced schedules, exam systems, and AI prompts.",
      badge: "New Release",
    },
  ];

  const productMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const p of productsData) {
    const categoryId = categoryMap[p.categorySlug];
    const tagIds = p.tagSlugs.map((slug) => tagMap[slug]).filter(Boolean);

    const doc = await Product.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          name: p.name,
          slug: p.slug,
          shortDescription: p.shortDescription,
          description: p.description,
          status: p.status,
          productType: p.productType,
          isFree: p.isFree,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          currency: p.currency,
          featured: p.featured,
          demoUrl: p.demoUrl || "",
          documentationUrl: p.documentationUrl || "",
          requirements: p.requirements,
          version: p.version,
          category: categoryId,
          tags: tagIds,
          images: p.images,
          features: p.features,
          seoTitle: p.seoTitle || "",
          seoDescription: p.seoDescription || "",
          badge: p.badge || "",
        },
      },
      { upsert: true, new: true }
    );
    productMap[p.slug] = doc._id as mongoose.Types.ObjectId;
  }

  console.log("Seeding product versions (idempotent upsert)...");
  const versionsData = [
    {
      productSlug: "nextjs-saas-starter-kit",
      version: "1.0.0",
      releaseNotes: "Initial production architecture release with Next.js 16 App Router, React 19, and MongoDB support.",
      releaseDate: new Date("2025-02-01"),
    },
    {
      productSlug: "nextjs-admin-dashboard-kit",
      version: "1.0.0",
      releaseNotes: "Initial admin dashboard layout launch.",
      releaseDate: new Date("2025-01-15"),
    },
    {
      productSlug: "nextjs-admin-dashboard-kit",
      version: "1.1.0",
      releaseNotes: "Added dark mode color bindings and improved table sorting accessibility.",
      releaseDate: new Date("2025-02-18"),
    },
    {
      productSlug: "developer-dashboard-ui-system",
      version: "2.0.0",
      releaseNotes: "Major version release featuring updated Tailwind CSS 3.4+ CSS variables.",
      releaseDate: new Date("2025-02-14"),
    },
  ];

  for (const v of versionsData) {
    const productId = productMap[v.productSlug];
    if (productId) {
      await ProductVersion.findOneAndUpdate(
        { product: productId, version: v.version },
        {
          $set: {
            product: productId,
            version: v.version,
            releaseNotes: v.releaseNotes,
            releaseDate: v.releaseDate,
          },
        },
        { upsert: true, new: true }
      );
    }
  }

  console.log("Seeding bundles (idempotent upsert)...");
  const bundleData = {
    name: "Full-Stack Developer & SaaS Architecture Suite",
    slug: "full-stack-developer-suite",
    description: "Combine the Next.js 16 SaaS Architecture Starter, Admin Dashboard Kit, and Design System at a bundle discount.",
    includedProductSlugs: [
      "nextjs-saas-starter-kit",
      "nextjs-admin-dashboard-kit",
      "developer-dashboard-ui-system",
    ],
    price: 89,
    compareAtPrice: 117,
    currency: "USD",
    status: "published",
    badge: "Complete Suite",
    seoTitle: "Full-Stack Developer Suite — Next.js 16 Architecture & UI Bundle",
    seoDescription: "Get the Next.js 16 SaaS starter, admin dashboard, and design system in one complete developer bundle.",
  };

  const bundleProductIds = bundleData.includedProductSlugs
    .map((s) => productMap[s])
    .filter(Boolean);

  await Bundle.findOneAndUpdate(
    { slug: bundleData.slug },
    {
      $set: {
        name: bundleData.name,
        slug: bundleData.slug,
        description: bundleData.description,
        products: bundleProductIds,
        price: bundleData.price,
        compareAtPrice: bundleData.compareAtPrice,
        currency: bundleData.currency,
        status: bundleData.status,
        badge: bundleData.badge,
        seoTitle: bundleData.seoTitle,
        seoDescription: bundleData.seoDescription,
      },
    },
    { upsert: true, new: true }
  );

  console.log("Seeding completed successfully!");
  console.log("Catalog Summary:");
  console.log(`- Categories: ${categoriesData.length}`);
  console.log(`- Tags: ${tagsData.length}`);
  console.log(`- Total Products: ${productsData.length}`);
  console.log(`  - Published Paid: 6`);
  console.log(`  - Published Free: 3`);
  console.log(`  - Coming Soon: 1`);
  console.log(`  - Draft: 1`);
  console.log(`  - Archived: 1`);
  console.log(`  - Featured: 4`);
  console.log(`- Product Versions: ${versionsData.length}`);
  console.log(`- Bundles: 1`);

  await mongoose.disconnect();
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
