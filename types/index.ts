export type ProductStatus = "coming_soon" | "in_development" | "available";

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  categorySlug: string;
  categoryName: string;
  tags: string[];
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: string[];
  demoUrl?: string;
  features: string[];
  requirements: string[];
  version: string;
  status: ProductStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  badge?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName?: string;
}

export interface Bundle {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalValue: number;
  includedProductSlugs: string[];
  badge?: string;
  status: ProductStatus;
}

export interface FreeResource {
  id: string;
  slug: string;
  title: string;
  description: string;
  format: string;
  category: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    role: string;
  };
  publishedAt: string;
  readTime: string;
}
