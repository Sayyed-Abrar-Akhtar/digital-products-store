export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice?: number;
  isFree?: boolean;
  categorySlug: string;
  categoryName: string;
  tags: string[];
  features: string[];
  fileFormat: string;
  version: string;
  updatedAt: string;
  badge?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  productCountPlaceholder: number;
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
}

export interface FreeResource {
  id: string;
  slug: string;
  title: string;
  description: string;
  format: string;
  downloadUrlPlaceholder: string;
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
