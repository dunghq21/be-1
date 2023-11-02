import { Schema, model } from "mongoose";

export interface Category {
  categoryId: number;
  categoryName: string;
  categoryImage: string;
}

export const CategorySchema = new Schema<Category>(
  {
    categoryId: { type: Number, required: true },
    categoryName: { type: String, required: true },
    categoryImage: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

export const CategoryModel = model<Category>("category", CategorySchema);
