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
 * It resets and seeds sample category, tag, product, bundle, and version documents in MongoDB.
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

  console.log("Clearing existing sample catalog collections...");
  await Category.deleteMany({});
  await Tag.deleteMany({});
  await Product.deleteMany({});
  await Bundle.deleteMany({});
  await ProductVersion.deleteMany({});

  console.log("Seeding categories...");
  const devToolsCat = await Category.create({
    name: "Developer Tools",
    slug: "developer-tools",
    description: "Sample boilerplates, starter kits, and CLI utilities for local development.",
    seoTitle: "Developer Tools — Sample Category",
    seoDescription: "Sample developer tools category for development testing.",
  });

  const designSysCat = await Category.create({
    name: "Design Systems",
    slug: "design-systems",
    description: "Sample UI component kits, typography scales, and token systems for testing.",
    seoTitle: "Design Systems — Sample Category",
    seoDescription: "Sample design systems category for development testing.",
  });

  const templatesCat = await Category.create({
    name: "Templates & Themes",
    slug: "templates-themes",
    description: "Sample web templates optimized for speed and accessibility testing.",
    seoTitle: "Templates & Themes — Sample Category",
    seoDescription: "Sample templates category for development testing.",
  });

  console.log("Seeding tags...");
  const tagNextjs = await Tag.create({ name: "Next.js", slug: "nextjs", description: "Next.js framework tag" });
  const tagTypescript = await Tag.create({ name: "TypeScript", slug: "typescript", description: "TypeScript tag" });
  const tagTailwind = await Tag.create({ name: "Tailwind CSS", slug: "tailwind-css", description: "Tailwind CSS tag" });
  const tagUi = await Tag.create({ name: "UI Kit", slug: "ui-kit", description: "UI Kit tag" });

  console.log("Seeding products...");
  // 1. Published Product
  const prod1 = await Product.create({
    name: "Sample Next.js 16 SaaS Architecture Kit",
    slug: "sample-nextjs-saas-architecture-kit",
    shortDescription: "Sample starter kit for Next.js 16 App Router local testing.",
    description:
      "This is a sample product used to test the MongoDB product catalog architecture in local development mode.",
    status: "published",
    productType: "software",
    isFree: false,
    price: 49,
    compareAtPrice: 79,
    currency: "USD",
    featured: true,
    demoUrl: "https://example.com/demo-nextjs",
    documentationUrl: "https://example.com/docs-nextjs",
    requirements: ["Node.js 20+", "Next.js 16+", "TypeScript 5+"],
    version: "1.0.0",
    category: devToolsCat._id,
    tags: [tagNextjs._id, tagTypescript._id, tagTailwind._id],
    images: [{ url: "/images/products/nextjs-starter.png", altText: "Sample Nextjs Kit", sortOrder: 0, isPrimary: true }],
    features: [
      { title: "Next.js 16 App Router support", sortOrder: 0 },
      { title: "Strict TypeScript configuration", sortOrder: 1 },
      { title: "MongoDB / Mongoose integration", sortOrder: 2 },
    ],
    seoTitle: "Sample Next.js 16 SaaS Architecture Kit",
    seoDescription: "Sample product for local database seeding and testing.",
    badge: "Sample Product",
  });

  // 2. Coming Soon Product
  const prod2 = await Product.create({
    name: "Sample UI Design Token System",
    slug: "sample-ui-design-token-system",
    shortDescription: "Sample design token kit for UI theme testing.",
    description: "Sample design token system for dark/light theme testing in development.",
    status: "coming_soon",
    productType: "template",
    isFree: false,
    price: 29,
    currency: "USD",
    featured: true,
    requirements: ["Tailwind CSS 3.4+"],
    version: "0.9.0-beta",
    category: designSysCat._id,
    tags: [tagUi._id, tagTailwind._id],
    images: [{ url: "/images/products/design-tokens.png", altText: "Sample Design Tokens", sortOrder: 0, isPrimary: true }],
    features: [
      { title: "CSS variables token structure", sortOrder: 0 },
      { title: "Accessible high-contrast scales", sortOrder: 1 },
    ],
    seoTitle: "Sample UI Design Token System",
    seoDescription: "Sample design system product.",
    badge: "Upcoming Sample",
  });

  // 3. Draft Product (Must be excluded from public queries)
  const prodDraft = await Product.create({
    name: "Draft Internal Software Tool",
    slug: "draft-internal-software-tool",
    shortDescription: "Internal unreleased draft product.",
    description: "This draft product should never appear in public catalog queries.",
    status: "draft",
    productType: "tool",
    isFree: false,
    price: 99,
    currency: "USD",
    featured: false,
    version: "0.1.0-draft",
    category: devToolsCat._id,
    tags: [tagNextjs._id],
    images: [],
    features: [{ title: "Unreleased feature", sortOrder: 0 }],
  });

  // 4. Free Resource Product
  const prodFree = await Product.create({
    name: "Sample Next.js 16 Quick Reference Cheat Sheet",
    slug: "sample-nextjs-16-cheatsheet",
    shortDescription: "Free developer cheatsheet for Next.js 16 conventions.",
    description: "Free architectural reference document for developers.",
    status: "published",
    productType: "resource",
    isFree: true,
    price: 0,
    currency: "USD",
    featured: false,
    version: "1.0.0",
    category: devToolsCat._id,
    tags: [tagNextjs._id],
    images: [],
    features: [{ title: "PDF Reference", sortOrder: 0 }],
    badge: "Free Resource",
  });

  console.log("Seeding product versions...");
  await ProductVersion.create({
    product: prod1._id,
    version: "1.0.0",
    releaseNotes: "Initial sample release with MongoDB integration.",
    releaseDate: new Date("2025-02-15"),
  });

  console.log("Seeding bundles...");
  await Bundle.create({
    name: "Sample Complete Developer Suite Bundle",
    slug: "sample-complete-developer-suite",
    description: "Sample bundle package combining starter kits and design systems.",
    products: [prod1._id, prod2._id],
    price: 69,
    compareAtPrice: 78,
    currency: "USD",
    status: "coming_soon",
    badge: "Sample Suite",
    seoTitle: "Sample Complete Developer Suite",
    seoDescription: "Sample bundle package for testing.",
  });

  console.log("Seeding completed successfully!");
  console.log(`Created: 3 Categories, 4 Tags, 4 Products (1 Draft, 1 Free, 1 Coming Soon, 1 Published), 1 Version, 1 Bundle.`);

  await mongoose.disconnect();
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
