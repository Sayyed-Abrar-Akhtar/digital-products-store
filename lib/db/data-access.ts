import { connectToDatabase } from "./mongodb";
import { Product as ProductModel, Category as CategoryModel, Bundle as BundleModel, Tag as TagModel, ProductStatusType } from "./models";
import { Product, Category, Bundle } from "@/types";
import { PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES as FALLBACK_CATEGORIES, BUNDLES as FALLBACK_BUNDLES } from "@/lib/data/store-data";

// Statuses allowed in public catalog queries
const PUBLIC_STATUSES: ProductStatusType[] = ["published", "coming_soon", "in_development", "available"];

function mapProduct(doc: any): Product {
  const categoryObj = doc.category && typeof doc.category === "object" ? doc.category : null;
  const tagList = Array.isArray(doc.tags)
    ? doc.tags.map((t: any) => (typeof t === "object" && t !== null ? t.name || t.slug : String(t)))
    : [];

  const imageList = Array.isArray(doc.images)
    ? doc.images.map((img: any) => (typeof img === "object" && img !== null ? img.url : String(img)))
    : [];

  const featureList = Array.isArray(doc.features)
    ? doc.features.map((f: any) => (typeof f === "object" && f !== null ? f.title : String(f)))
    : [];

  return {
    id: doc._id ? doc._id.toString() : doc.id || "",
    slug: doc.slug,
    name: doc.name,
    shortDescription: doc.shortDescription,
    description: doc.description,
    category: categoryObj?.name || doc.categoryName || "Uncategorized",
    categorySlug: categoryObj?.slug || doc.categorySlug || "",
    categoryName: categoryObj?.name || doc.categoryName || "Uncategorized",
    tags: tagList,
    price: doc.price,
    compareAtPrice: doc.compareAtPrice,
    currency: doc.currency || "USD",
    images: imageList,
    demoUrl: doc.demoUrl || undefined,
    documentationUrl: doc.documentationUrl || undefined,
    features: featureList,
    requirements: doc.requirements || [],
    version: doc.version || "1.0.0",
    status: doc.status,
    featured: Boolean(doc.featured),
    isFree: Boolean(doc.isFree),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    seoTitle: doc.seoTitle || undefined,
    seoDescription: doc.seoDescription || undefined,
    badge: doc.badge || undefined,
  };
}

function mapCategory(doc: any): Category {
  return {
    id: doc._id ? doc._id.toString() : doc.id || "",
    slug: doc.slug,
    name: doc.name,
    description: doc.description || "",
  };
}

function mapBundle(doc: any): Bundle {
  const includedProductSlugs = Array.isArray(doc.products)
    ? doc.products.map((p: any) => (typeof p === "object" && p !== null ? p.slug : String(p)))
    : [];

  return {
    id: doc._id ? doc._id.toString() : doc.id || "",
    slug: doc.slug,
    title: doc.name || doc.title,
    description: doc.description || "",
    price: doc.price,
    originalValue: doc.compareAtPrice || doc.price,
    includedProductSlugs,
    badge: doc.badge || undefined,
    status: doc.status,
  };
}

/**
 * Fetch all published/public products.
 * Draft and archived products are strictly excluded.
 */
export async function getPublishedProducts(): Promise<Product[]> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const docs = await ProductModel.find({ status: { $in: PUBLIC_STATUSES } })
        .populate("category")
        .populate("tags")
        .sort({ createdAt: -1 })
        .lean();

      if (docs && docs.length > 0) {
        return docs.map(mapProduct);
      }
    }
  } catch (err) {
    console.error("Error in getPublishedProducts:", err);
  }

  // Fallback to static data if DB is empty or disconnected
  return FALLBACK_PRODUCTS.filter((p) => PUBLIC_STATUSES.includes(p.status));
}

/**
 * Fetch featured published/public products.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const docs = await ProductModel.find({ featured: true, status: { $in: PUBLIC_STATUSES } })
        .populate("category")
        .populate("tags")
        .sort({ createdAt: -1 })
        .lean();

      if (docs && docs.length > 0) {
        return docs.map(mapProduct);
      }
    }
  } catch (err) {
    console.error("Error in getFeaturedProducts:", err);
  }

  return FALLBACK_PRODUCTS.filter((p) => p.featured && PUBLIC_STATUSES.includes(p.status));
}

/**
 * Fetch a single product by slug.
 * Draft and archived products return null (not found for public).
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const doc = await ProductModel.findOne({ slug })
        .populate("category")
        .populate("tags")
        .lean();

      if (doc) {
        // Exclude draft and archived products from public access
        if (!PUBLIC_STATUSES.includes(doc.status)) {
          return null;
        }
        return mapProduct(doc);
      }
    }
  } catch (err) {
    console.error("Error in getProductBySlug:", err);
  }

  const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
  if (fallback && PUBLIC_STATUSES.includes(fallback.status)) {
    return fallback;
  }
  return null;
}

/**
 * Fetch all categories.
 */
export async function getPublishedCategories(): Promise<Category[]> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const docs = await CategoryModel.find().sort({ name: 1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map(mapCategory);
      }
    }
  } catch (err) {
    console.error("Error in getPublishedCategories:", err);
  }

  return FALLBACK_CATEGORIES;
}

/**
 * Fetch category by slug.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const doc = await CategoryModel.findOne({ slug }).lean();
      if (doc) {
        return mapCategory(doc);
      }
    }
  } catch (err) {
    console.error("Error in getCategoryBySlug:", err);
  }

  const fallback = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
  return fallback || null;
}

/**
 * Fetch published/public products in a category by category slug.
 */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const category = await CategoryModel.findOne({ slug: categorySlug }).lean();
      if (category) {
        const docs = await ProductModel.find({
          category: category._id,
          status: { $in: PUBLIC_STATUSES },
        })
          .populate("category")
          .populate("tags")
          .sort({ createdAt: -1 })
          .lean();

        return docs.map(mapProduct);
      }
    }
  } catch (err) {
    console.error("Error in getProductsByCategory:", err);
  }

  return FALLBACK_PRODUCTS.filter(
    (p) => p.categorySlug === categorySlug && PUBLIC_STATUSES.includes(p.status)
  );
}

/**
 * Fetch published bundles.
 */
export async function getPublishedBundles(): Promise<Bundle[]> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const docs = await BundleModel.find({ status: { $in: PUBLIC_STATUSES } })
        .populate("products")
        .sort({ createdAt: -1 })
        .lean();

      if (docs && docs.length > 0) {
        return docs.map(mapBundle);
      }
    }
  } catch (err) {
    console.error("Error in getPublishedBundles:", err);
  }

  return FALLBACK_BUNDLES.filter((b) => PUBLIC_STATUSES.includes(b.status));
}

/**
 * Fetch bundle by slug.
 */
export async function getBundleBySlug(slug: string): Promise<Bundle | null> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const doc = await BundleModel.findOne({ slug }).populate("products").lean();
      if (doc) {
        if (!PUBLIC_STATUSES.includes(doc.status)) {
          return null;
        }
        return mapBundle(doc);
      }
    }
  } catch (err) {
    console.error("Error in getBundleBySlug:", err);
  }

  const fallback = FALLBACK_BUNDLES.find((b) => b.slug === slug);
  if (fallback && PUBLIC_STATUSES.includes(fallback.status)) {
    return fallback;
  }
  return null;
}
