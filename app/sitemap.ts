import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/config/site";
import { getPublishedProducts, getPublishedCategories } from "@/lib/db/data-access";
import { BLOG_POSTS } from "@/lib/data/store-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url.replace(/\/$/, "");

  // Stable baseline date for static pages to prevent unnecessary crawler churn on every request
  const STATIC_LAST_MODIFIED = new Date("2025-01-01T00:00:00.000Z");

  const products = await getPublishedProducts();
  const categories = await getPublishedCategories();

  // Public static routes that exist in the application
  const staticRoutes = [
    "",
    "/products",
    "/categories",
    "/bundles",
    "/free",
    "/blog",
    "/about",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
    "/refunds",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Public product detail pages from DB (drafts and archived excluded)
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Public category detail pages
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Public blog post pages
  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...blogRoutes];
}
