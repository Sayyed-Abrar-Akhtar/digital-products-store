import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/config/site";
import { getPublishedProducts, getPublishedCategories } from "@/lib/db/data-access";
import { BLOG_POSTS } from "@/lib/data/store-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  const products = await getPublishedProducts();
  const categories = await getPublishedCategories();

  // Static routes
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
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Product detail pages
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Category detail pages
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Blog post pages
  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...blogRoutes];
}
