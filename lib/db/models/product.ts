import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ProductStatusType = "draft" | "coming_soon" | "published" | "archived" | "in_development" | "available";
export type ProductKindType = "template" | "software" | "ebook" | "course" | "resource" | "tool" | "bundle";

export interface IProductImage {
  url: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface IProductFeature {
  title: string;
  description?: string;
  sortOrder?: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ProductStatusType;
  productType: ProductKindType;
  isFree: boolean;
  price: number;
  compareAtPrice?: number;
  currency: string;
  featured: boolean;
  demoUrl?: string;
  documentationUrl?: string;
  requirements?: string[];
  version: string;
  category: Types.ObjectId;
  tags: Types.ObjectId[];
  images: IProductImage[];
  features: IProductFeature[];
  seoTitle?: string;
  seoDescription?: string;
  badge?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    altText: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductFeatureSchema = new Schema<IProductFeature>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    shortDescription: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "coming_soon", "published", "archived", "in_development", "available"],
      default: "draft",
      index: true,
    },
    productType: {
      type: String,
      enum: ["template", "software", "ebook", "course", "resource", "tool", "bundle"],
      default: "software",
      index: true,
    },
    isFree: { type: Boolean, default: false, index: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number },
    currency: { type: String, default: "USD" },
    featured: { type: Boolean, default: false, index: true },
    demoUrl: { type: String, default: "" },
    documentationUrl: { type: String, default: "" },
    requirements: { type: [String], default: [] },
    version: { type: String, default: "1.0.0" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag", index: true }],
    images: [ProductImageSchema],
    features: [ProductFeatureSchema],
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    badge: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Compound indexes to optimize catalog filter & sort queries
ProductSchema.index({ status: 1, createdAt: -1 });
ProductSchema.index({ status: 1, category: 1 });
ProductSchema.index({ status: 1, productType: 1 });
ProductSchema.index({ status: 1, isFree: 1 });
ProductSchema.index({ status: 1, featured: 1 });
ProductSchema.index({ status: 1, price: 1 });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
