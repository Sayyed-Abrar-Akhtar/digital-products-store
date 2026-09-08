"use server";

import { revalidatePath } from "next/cache";
import { assertAdminAuth } from "@/lib/admin/auth-guard";
import { logAdminAction } from "@/lib/admin/audit";
import { connectToDatabase } from "@/lib/db/mongodb";
import {
  Product as ProductModel,
  Category as CategoryModel,
  Tag as TagModel,
  ProductVersion as ProductVersionModel,
  ProductStatusType,
  ProductKindType,
} from "@/lib/db/models";
import { checkSlugUniqueness } from "@/lib/admin/data-access";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface ImageInput {
  url: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface FeatureInput {
  title: string;
  description?: string;
  sortOrder?: number;
}

export interface ProductFormData {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ProductStatusType;
  productType: ProductKindType;
  isFree: boolean;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  featured: boolean;
  demoUrl?: string;
  documentationUrl?: string;
  requirements?: string[];
  version?: string;
  categoryId: string;
  tagIds?: string[];
  images?: ImageInput[];
  features?: FeatureInput[];
  seoTitle?: string;
  seoDescription?: string;
  badge?: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface TagFormData {
  name: string;
  slug: string;
  description?: string;
}

export interface VersionFormData {
  version: string;
  releaseNotes?: string;
  releaseDate?: string;
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateProductFields(data: ProductFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Product name is required.";
  }

  if (!data.slug || data.slug.trim().length === 0) {
    errors.slug = "Product slug is required.";
  } else if (!SLUG_REGEX.test(data.slug.trim())) {
    errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens (e.g., 'my-product-slug').";
  }

  if (!data.shortDescription || data.shortDescription.trim().length === 0) {
    errors.shortDescription = "Short description is required.";
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.description = "Full description is required.";
  }

  if (!data.categoryId || data.categoryId.trim().length === 0) {
    errors.categoryId = "Category selection is required.";
  }

  const validStatuses: ProductStatusType[] = ["draft", "coming_soon", "published", "archived", "in_development", "available"];
  if (!validStatuses.includes(data.status)) {
    errors.status = `Invalid status. Must be one of: ${validStatuses.join(", ")}`;
  }

  const validTypes: ProductKindType[] = ["template", "software", "ebook", "course", "resource", "tool", "bundle"];
  if (!validTypes.includes(data.productType)) {
    errors.productType = `Invalid product type. Must be one of: ${validTypes.join(", ")}`;
  }

  if (data.isFree) {
    if (data.price !== 0) {
      errors.price = "Price must be 0 for free products.";
    }
  } else {
    if (typeof data.price !== "number" || isNaN(data.price) || data.price <= 0) {
      errors.price = "Paid products require a valid price greater than 0.";
    }
  }

  if (data.images && Array.isArray(data.images)) {
    for (let i = 0; i < data.images.length; i++) {
      const img = data.images[i];
      if (img.url && !img.url.startsWith("/") && !img.url.startsWith("http://") && !img.url.startsWith("https://")) {
        errors.images = `Image #${i + 1} must be a valid URL starting with http://, https://, or a root path /`;
        break;
      }
    }
  }

  return errors;
}

/**
 * Server Action: Create Product
 */
export async function createProductAction(data: ProductFormData): Promise<ActionResult<{ productId: string; slug: string }>> {
  try {
    await assertAdminAuth();

    const fieldErrors = validateProductFields(data);
    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, error: "Validation failed.", fieldErrors };
    }

    const cleanSlug = data.slug.trim().toLowerCase();
    const isUnique = await checkSlugUniqueness(cleanSlug);
    if (!isUnique) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: { slug: `Slug '${cleanSlug}' is already in use by another product.` },
      };
    }

    const db = await connectToDatabase();
    if (!db) {
      return { success: false, error: "Database connection unavailable." };
    }

    // Verify Category exists
    let categoryDoc = null;
    if (data.categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      categoryDoc = await CategoryModel.findById(data.categoryId);
    } else {
      categoryDoc = await CategoryModel.findOne({ slug: data.categoryId });
    }

    if (!categoryDoc) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: { categoryId: "Selected category does not exist." },
      };
    }

    const formattedImages = (data.images || []).map((img, idx) => ({
      url: img.url.trim(),
      altText: img.altText?.trim() || data.name.trim(),
      sortOrder: img.sortOrder ?? idx,
      isPrimary: img.isPrimary ?? idx === 0,
    }));

    const formattedFeatures = (data.features || []).map((f, idx) => ({
      title: f.title.trim(),
      description: f.description?.trim() || "",
      sortOrder: f.sortOrder ?? idx,
    }));

    const newProduct = new ProductModel({
      name: data.name.trim(),
      slug: cleanSlug,
      shortDescription: data.shortDescription.trim(),
      description: data.description.trim(),
      status: data.status,
      productType: data.productType,
      isFree: Boolean(data.isFree),
      price: data.isFree ? 0 : data.price,
      compareAtPrice: data.compareAtPrice && data.compareAtPrice > 0 ? data.compareAtPrice : undefined,
      currency: data.currency || "USD",
      featured: Boolean(data.featured),
      demoUrl: data.demoUrl?.trim() || "",
      documentationUrl: data.documentationUrl?.trim() || "",
      requirements: (data.requirements || []).map((r) => r.trim()).filter(Boolean),
      version: data.version?.trim() || "1.0.0",
      category: categoryDoc._id,
      tags: data.tagIds || [],
      images: formattedImages,
      features: formattedFeatures,
      seoTitle: data.seoTitle?.trim() || "",
      seoDescription: data.seoDescription?.trim() || "",
      badge: data.badge?.trim() || "",
    });

    await newProduct.save();

    await logAdminAction("CREATE_PRODUCT", "Product", newProduct._id.toString(), {
      name: newProduct.name,
      slug: newProduct.slug,
      status: newProduct.status,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/sitemap.xml");

    return {
      success: true,
      data: { productId: newProduct._id.toString(), slug: newProduct.slug },
    };
  } catch (err: any) {
    console.error("Error in createProductAction:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while creating the product.",
    };
  }
}

/**
 * Server Action: Update Product
 */
export async function updateProductAction(
  productId: string,
  data: ProductFormData
): Promise<ActionResult<{ productId: string; slug: string }>> {
  try {
    await assertAdminAuth();

    if (!productId) {
      return { success: false, error: "Product ID is required." };
    }

    const fieldErrors = validateProductFields(data);
    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, error: "Validation failed.", fieldErrors };
    }

    const cleanSlug = data.slug.trim().toLowerCase();
    const isUnique = await checkSlugUniqueness(cleanSlug, productId);
    if (!isUnique) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: { slug: `Slug '${cleanSlug}' is already in use by another product.` },
      };
    }

    const db = await connectToDatabase();
    if (!db) {
      return { success: false, error: "Database connection unavailable." };
    }

    let productDoc = null;
    if (productId.match(/^[0-9a-fA-F]{24}$/)) {
      productDoc = await ProductModel.findById(productId);
    } else {
      productDoc = await ProductModel.findOne({ slug: productId });
    }

    if (!productDoc) {
      return { success: false, error: "Product not found." };
    }

    // Verify Category
    let categoryDoc = null;
    if (data.categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      categoryDoc = await CategoryModel.findById(data.categoryId);
    } else {
      categoryDoc = await CategoryModel.findOne({ slug: data.categoryId });
    }

    if (!categoryDoc) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: { categoryId: "Selected category does not exist." },
      };
    }

    const formattedImages = (data.images || []).map((img, idx) => ({
      url: img.url.trim(),
      altText: img.altText?.trim() || data.name.trim(),
      sortOrder: img.sortOrder ?? idx,
      isPrimary: img.isPrimary ?? idx === 0,
    }));

    const formattedFeatures = (data.features || []).map((f, idx) => ({
      title: f.title.trim(),
      description: f.description?.trim() || "",
      sortOrder: f.sortOrder ?? idx,
    }));

    productDoc.name = data.name.trim();
    productDoc.slug = cleanSlug;
    productDoc.shortDescription = data.shortDescription.trim();
    productDoc.description = data.description.trim();
    productDoc.status = data.status;
    productDoc.productType = data.productType;
    productDoc.isFree = Boolean(data.isFree);
    productDoc.price = data.isFree ? 0 : data.price;
    productDoc.compareAtPrice = data.compareAtPrice && data.compareAtPrice > 0 ? data.compareAtPrice : undefined;
    productDoc.currency = data.currency || "USD";
    productDoc.featured = Boolean(data.featured);
    productDoc.demoUrl = data.demoUrl?.trim() || "";
    productDoc.documentationUrl = data.documentationUrl?.trim() || "";
    productDoc.requirements = (data.requirements || []).map((r) => r.trim()).filter(Boolean);
    productDoc.version = data.version?.trim() || "1.0.0";
    productDoc.category = categoryDoc._id;
    productDoc.tags = (data.tagIds || []) as any;
    productDoc.images = formattedImages;
    productDoc.features = formattedFeatures;
    productDoc.seoTitle = data.seoTitle?.trim() || "";
    productDoc.seoDescription = data.seoDescription?.trim() || "";
    productDoc.badge = data.badge?.trim() || "";

    await productDoc.save();

    await logAdminAction("UPDATE_PRODUCT", "Product", productDoc._id.toString(), {
      name: productDoc.name,
      slug: productDoc.slug,
      status: productDoc.status,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productDoc._id.toString()}`);
    revalidatePath("/products");
    revalidatePath(`/products/${productDoc.slug}`);
    revalidatePath("/sitemap.xml");

    return {
      success: true,
      data: { productId: productDoc._id.toString(), slug: productDoc.slug },
    };
  } catch (err: any) {
    console.error("Error in updateProductAction:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while updating the product.",
    };
  }
}

/**
 * Server Action: Archive Product (Status transition to archived)
 */
export async function archiveProductAction(productId: string): Promise<ActionResult<{ productId: string }>> {
  try {
    await assertAdminAuth();

    if (!productId) {
      return { success: false, error: "Product ID is required." };
    }

    const db = await connectToDatabase();
    if (!db) {
      return { success: false, error: "Database connection unavailable." };
    }

    let productDoc = null;
    if (productId.match(/^[0-9a-fA-F]{24}$/)) {
      productDoc = await ProductModel.findById(productId);
    } else {
      productDoc = await ProductModel.findOne({ slug: productId });
    }

    if (!productDoc) {
      return { success: false, error: "Product not found." };
    }

    productDoc.status = "archived";
    await productDoc.save();

    await logAdminAction("ARCHIVE_PRODUCT", "Product", productDoc._id.toString(), {
      name: productDoc.name,
      slug: productDoc.slug,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/sitemap.xml");

    return {
      success: true,
      data: { productId: productDoc._id.toString() },
    };
  } catch (err: any) {
    console.error("Error in archiveProductAction:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while archiving the product.",
    };
  }
}

/**
 * Server Action: Create Category
 */
export async function createCategoryAction(data: CategoryFormData): Promise<ActionResult<{ categoryId: string; slug: string }>> {
  try {
    await assertAdminAuth();

    const fieldErrors: Record<string, string> = {};
    if (!data.name || data.name.trim().length === 0) {
      fieldErrors.name = "Category name is required.";
    }

    if (!data.slug || data.slug.trim().length === 0) {
      fieldErrors.slug = "Category slug is required.";
    } else if (!SLUG_REGEX.test(data.slug.trim())) {
      fieldErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, error: "Validation failed.", fieldErrors };
    }

    const db = await connectToDatabase();
    if (!db) {
      return { success: false, error: "Database connection unavailable." };
    }

    const cleanSlug = data.slug.trim().toLowerCase();
    const existing = await CategoryModel.findOne({ slug: cleanSlug });
    if (existing) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: { slug: `Category slug '${cleanSlug}' already exists.` },
      };
    }

    const newCategory = new CategoryModel({
      name: data.name.trim(),
      slug: cleanSlug,
      description: data.description?.trim() || "",
      seoTitle: data.seoTitle?.trim() || "",
      seoDescription: data.seoDescription?.trim() || "",
    });

    await newCategory.save();

    await logAdminAction("CREATE_CATEGORY", "Category", newCategory._id.toString(), {
      name: newCategory.name,
      slug: newCategory.slug,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");

    return {
      success: true,
      data: { categoryId: newCategory._id.toString(), slug: newCategory.slug },
    };
  } catch (err: any) {
    console.error("Error in createCategoryAction:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while creating the category.",
    };
  }
}

/**
 * Server Action: Create Tag
 */
export async function createTagAction(data: TagFormData): Promise<ActionResult<{ tagId: string; slug: string }>> {
  try {
    await assertAdminAuth();

    const fieldErrors: Record<string, string> = {};
    if (!data.name || data.name.trim().length === 0) {
      fieldErrors.name = "Tag name is required.";
    }

    if (!data.slug || data.slug.trim().length === 0) {
      fieldErrors.slug = "Tag slug is required.";
    } else if (!SLUG_REGEX.test(data.slug.trim())) {
      fieldErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, error: "Validation failed.", fieldErrors };
    }

    const db = await connectToDatabase();
    if (!db) {
      return { success: false, error: "Database connection unavailable." };
    }

    const cleanSlug = data.slug.trim().toLowerCase();
    const existing = await TagModel.findOne({ slug: cleanSlug });
    if (existing) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: { slug: `Tag slug '${cleanSlug}' already exists.` },
      };
    }

    const newTag = new TagModel({
      name: data.name.trim(),
      slug: cleanSlug,
      description: data.description?.trim() || "",
    });

    await newTag.save();

    await logAdminAction("CREATE_TAG", "Tag", newTag._id.toString(), {
      name: newTag.name,
      slug: newTag.slug,
    });

    revalidatePath("/admin/tags");

    return {
      success: true,
      data: { tagId: newTag._id.toString(), slug: newTag.slug },
    };
  } catch (err: any) {
    console.error("Error in createTagAction:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while creating the tag.",
    };
  }
}

/**
 * Server Action: Create Product Version record
 */
export async function createProductVersionAction(
  productId: string,
  data: VersionFormData
): Promise<ActionResult<{ versionId: string }>> {
  try {
    await assertAdminAuth();

    if (!productId) {
      return { success: false, error: "Product ID is required." };
    }

    if (!data.version || data.version.trim().length === 0) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: { version: "Version string is required." },
      };
    }

    const db = await connectToDatabase();
    if (!db) {
      return { success: false, error: "Database connection unavailable." };
    }

    let productDoc = null;
    if (productId.match(/^[0-9a-fA-F]{24}$/)) {
      productDoc = await ProductModel.findById(productId);
    } else {
      productDoc = await ProductModel.findOne({ slug: productId });
    }

    if (!productDoc) {
      return { success: false, error: "Product not found." };
    }

    const cleanVersion = data.version.trim();
    const newVersionDoc = new ProductVersionModel({
      product: productDoc._id,
      version: cleanVersion,
      releaseNotes: data.releaseNotes?.trim() || "",
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : new Date(),
    });

    await newVersionDoc.save();

    // Update current product version field as well
    productDoc.version = cleanVersion;
    await productDoc.save();

    await logAdminAction("CREATE_PRODUCT_VERSION", "ProductVersion", newVersionDoc._id.toString(), {
      productId: productDoc._id.toString(),
      version: cleanVersion,
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productDoc._id.toString()}`);

    return {
      success: true,
      data: { versionId: newVersionDoc._id.toString() },
    };
  } catch (err: any) {
    console.error("Error in createProductVersionAction:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while creating product version.",
    };
  }
}
