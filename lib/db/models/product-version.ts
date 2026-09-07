import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProductVersion extends Document {
  product: Types.ObjectId;
  version: string;
  releaseNotes?: string;
  releaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVersionSchema = new Schema<IProductVersion>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    version: { type: String, required: true, trim: true },
    releaseNotes: { type: String, default: "" },
    releaseDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

ProductVersionSchema.index({ product: 1, releaseDate: -1 });
ProductVersionSchema.index({ product: 1, version: 1 }, { unique: true });

export const ProductVersion: Model<IProductVersion> =
  mongoose.models.ProductVersion ||
  mongoose.model<IProductVersion>("ProductVersion", ProductVersionSchema);
