import { connectToDatabase } from "@/lib/db/mongodb";
import { Product as ProductModel, Category as CategoryModel, Tag as TagModel, ProductVersion as ProductVersionModel } from "@/lib/db/models";
import { PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES as FALLBACK_CATEGORIES } from "@/lib/data/store-data";

export interface AdminProductStats {
  total: number;
  published: number;
  draft: number;
  comingSoon: number;
  archived: number;
  free: number;
  paid: number;
}

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  productType: string;
  categoryName: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  isFree: boolean;
  featured: boolean;
  version: string;
  updatedAt: string;
  createdAt: string;
}

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: string;
  productType: string;
  isFree: boolean;
  price: number;
  compareAtPrice?: number;
  currency: string;
  featured: boolean;
  demoUrl?: string;
  documentationUrl?: string;
  requirements: string[];
  version: string;
  category: { id: string; name: string; slug: string };
  tags: Array<{ id: string; name: string; slug: string }>;
  images: Array<{ url: string; altText?: string; sortOrder?: number; isPrimary?: boolean }>;
  features: Array<{ title: string; description?: string; sortOrder?: number }>;
  seoTitle?: string;
  seoDescription?: string;
  badge?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductQueryParams {
  status?: string;
  type?: string;
  free?: boolean | string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminProductQueryResult {
  products: AdminProductListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function mapAdminProductDetail(doc: any): AdminProductDetail {
  const catObj = doc.category && typeof doc.category === "object"
    ? {
        id: doc.category._id ? doc.category._id.toString() : doc.category.id || "",
        name: doc.category.name || "Uncategorized",
        slug: doc.category.slug || "",
      }
    : { id: "", name: "Uncategorized", slug: "" };

  const tagList = Array.isArray(doc.tags)
    ? doc.tags.map((t: any) =>
        typeof t === "object" && t !== null
          ? { id: t._id ? t._id.toString() : t.id || "", name: t.name, slug: t.slug }
          : { id: String(t), name: String(t), slug: String(t) }
      )
    : [];

  const imageList = Array.isArray(doc.images)
    ? doc.images.map((img: any) => ({
        url: typeof img === "string" ? img : img.url,
        altText: typeof img === "string" ? "" : img.altText || "",
        sortOrder: typeof img === "string" ? 0 : img.sortOrder || 0,
        isPrimary: typeof img === "string" ? false : Boolean(img.isPrimary),
      }))
    : [];

  const featureList = Array.isArray(doc.features)
    ? doc.features.map((f: any) => ({
        title: typeof f === "string" ? f : f.title,
        description: typeof f === "string" ? "" : f.description || "",
        sortOrder: typeof f === "string" ? 0 : f.sortOrder || 0,
      }))
    : [];

  return {
    id: doc._id ? doc._id.toString() : doc.id || "",
    name: doc.name,
    slug: doc.slug,
    shortDescription: doc.shortDescription || "",
    description: doc.description || "",
    status: doc.status || "draft",
    productType: doc.productType || "software",
    isFree: Boolean(doc.isFree),
    price: doc.price,
    compareAtPrice: doc.compareAtPrice,
    currency: doc.currency || "USD",
    featured: Boolean(doc.featured),
    demoUrl: doc.demoUrl || undefined,
    documentationUrl: doc.documentationUrl || undefined,
    requirements: doc.requirements || [],
    version: doc.version || "1.0.0",
    category: catObj,
    tags: tagList,
    images: imageList,
    features: featureList,
    seoTitle: doc.seoTitle || undefined,
    seoDescription: doc.seoDescription || undefined,
    badge: doc.badge || undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * Retrieve admin dashboard statistical counters directly from MongoDB.
 */
export async function getAdminProductStats(): Promise<AdminProductStats> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const [total, published, draft, comingSoon, archived, free, paid] = await Promise.all([
        ProductModel.countDocuments(),
        ProductModel.countDocuments({ status: "published" }),
        ProductModel.countDocuments({ status: "draft" }),
        ProductModel.countDocuments({ status: "coming_soon" }),
        ProductModel.countDocuments({ status: "archived" }),
        ProductModel.countDocuments({ $or: [{ isFree: true }, { price: 0 }] }),
        ProductModel.countDocuments({ isFree: false, price: { $gt: 0 } }),
      ]);

      return { total, published, draft, comingSoon, archived, free, paid };
    }
  } catch (err) {
    console.error("Error in getAdminProductStats:", err);
  }

  // Fallback calculations for development disconnected state
  return {
    total: FALLBACK_PRODUCTS.length,
    published: FALLBACK_PRODUCTS.filter((p) => p.status === "published").length,
    draft: FALLBACK_PRODUCTS.filter((p) => p.status === "draft").length,
    comingSoon: FALLBACK_PRODUCTS.filter((p) => p.status === "coming_soon").length,
    archived: FALLBACK_PRODUCTS.filter((p) => p.status === "archived").length,
    free: FALLBACK_PRODUCTS.filter((p) => p.isFree || p.price === 0).length,
    paid: FALLBACK_PRODUCTS.filter((p) => !p.isFree && p.price > 0).length,
  };
}

/**
 * Retrieve paginated admin products including draft and archived records.
 */
export async function getAdminProducts(params: AdminProductQueryParams = {}): Promise<AdminProductQueryResult> {
  const { status, type, free, search, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const query: any = {};

      if (status && status !== "all") {
        query.status = status;
      }

      if (type && type !== "all") {
        query.productType = type;
      }

      if (free === true || free === "true") {
        query.$or = [{ isFree: true }, { price: 0 }];
      } else if (free === false || free === "false") {
        query.isFree = false;
        query.price = { $gt: 0 };
      }

      if (search && search.trim().length > 0) {
        const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        query.$or = [{ name: regex }, { slug: regex }, { shortDescription: regex }];
      }

      const total = await ProductModel.countDocuments(query);
      const docs = await ProductModel.find(query)
        .populate("category")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const products: AdminProductListItem[] = docs.map((doc: any) => {
        const catObj = doc.category && typeof doc.category === "object" ? doc.category : null;
        return {
          id: doc._id.toString(),
          name: doc.name,
          slug: doc.slug,
          status: doc.status,
          productType: doc.productType,
          categoryName: catObj?.name || "Uncategorized",
          categorySlug: catObj?.slug || "",
          price: doc.price,
          compareAtPrice: doc.compareAtPrice,
          currency: doc.currency || "USD",
          isFree: Boolean(doc.isFree),
          featured: Boolean(doc.featured),
          version: doc.version || "1.0.0",
          updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        };
      });

      return {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    }
  } catch (err) {
    console.error("Error in getAdminProducts:", err);
  }

  // Fallback memory list
  let list = [...FALLBACK_PRODUCTS];
  if (status && status !== "all") {
    list = list.filter((p) => p.status === status);
  }
  if (search && search.trim().length > 0) {
    const s = search.trim().toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s));
  }

  const total = list.length;
  const paginated = list.slice(skip, skip + limit).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    status: p.status,
    productType: (p as any).productType || "software",
    categoryName: p.categoryName,
    categorySlug: p.categorySlug,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    currency: p.currency,
    isFree: Boolean(p.isFree),
    featured: Boolean(p.featured),
    version: p.version,
    updatedAt: p.updatedAt,
    createdAt: p.createdAt,
  }));

  return {
    products: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Fetch detailed product data for admin editing (allows accessing draft and archived records).
 */
export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      let doc = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        doc = await ProductModel.findById(id).populate("category").populate("tags").lean();
      }
      if (!doc) {
        doc = await ProductModel.findOne({ slug: id }).populate("category").populate("tags").lean();
      }

      if (doc) {
        return mapAdminProductDetail(doc);
      }
    }
  } catch (err) {
    console.error("Error in getAdminProductById:", err);
  }

  const fallback = FALLBACK_PRODUCTS.find((p) => p.id === id || p.slug === id);
  if (fallback) {
    const cat = FALLBACK_CATEGORIES.find((c) => c.slug === fallback.categorySlug);
    return {
      id: fallback.id,
      name: fallback.name,
      slug: fallback.slug,
      shortDescription: fallback.shortDescription,
      description: fallback.description,
      status: fallback.status,
      productType: (fallback as any).productType || "software",
      isFree: Boolean(fallback.isFree),
      price: fallback.price,
      compareAtPrice: fallback.compareAtPrice,
      currency: fallback.currency,
      featured: fallback.featured,
      demoUrl: fallback.demoUrl,
      documentationUrl: fallback.documentationUrl,
      requirements: fallback.requirements,
      version: fallback.version,
      category: { id: cat?.id || "cat-1", name: fallback.categoryName, slug: fallback.categorySlug },
      tags: fallback.tags.map((t) => ({ id: t, name: t, slug: t.toLowerCase() })),
      images: fallback.images.map((img) => ({ url: img, altText: fallback.name, sortOrder: 0, isPrimary: true })),
      features: fallback.features.map((f, i) => ({ title: f, description: "", sortOrder: i })),
      seoTitle: fallback.seoTitle,
      seoDescription: fallback.seoDescription,
      badge: fallback.badge,
      createdAt: fallback.createdAt,
      updatedAt: fallback.updatedAt,
    };
  }

  return null;
}

/**
 * Fetch categories for admin management and selection dropdowns.
 */
export async function getAdminCategories() {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const docs = await CategoryModel.find().sort({ name: 1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          id: d._id.toString(),
          name: d.name,
          slug: d.slug,
          description: d.description || "",
          seoTitle: d.seoTitle || "",
          seoDescription: d.seoDescription || "",
        }));
      }
    }
  } catch (err) {
    console.error("Error in getAdminCategories:", err);
  }

  return FALLBACK_CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    seoTitle: "",
    seoDescription: "",
  }));
}

/**
 * Fetch tags for admin tag assignment.
 */
export async function getAdminTags() {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const docs = await TagModel.find().sort({ name: 1 }).lean();
      if (docs) {
        return docs.map((d: any) => ({
          id: d._id.toString(),
          name: d.name,
          slug: d.slug,
          description: d.description || "",
        }));
      }
    }
  } catch (err) {
    console.error("Error in getAdminTags:", err);
  }

  return [];
}

/**
 * Check if a product slug is available / unique.
 */
export async function checkSlugUniqueness(slug: string, excludeProductId?: string): Promise<boolean> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const query: any = { slug };
      if (excludeProductId && excludeProductId.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = { $ne: excludeProductId };
      }
      const existing = await ProductModel.findOne(query).select("_id").lean();
      return !existing;
    }
  } catch (err) {
    console.error("Error in checkSlugUniqueness:", err);
  }

  const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === slug && p.id !== excludeProductId);
  return !fallback;
}
