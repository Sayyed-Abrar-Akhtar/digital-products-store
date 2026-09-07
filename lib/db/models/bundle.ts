import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ProductStatusType } from "./product";

export interface IBundle extends Document {
  name: string;
  slug: string;
  description: string;
  products: Types.ObjectId[];
  price: number;
  compareAtPrice?: number;
  currency: string;
  status: ProductStatusType;
  badge?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BundleSchema = new Schema<IBundle>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product", required: true }],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["draft", "coming_soon", "published", "archived"],
      default: "draft",
      index: true,
    },
    badge: { type: String, default: "" },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export const Bundle: Model<IBundle> =
  mongoose.models.Bundle || mongoose.model<IBundle>("Bundle", BundleSchema);
