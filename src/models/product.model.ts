import { Schema, model } from "mongoose";

interface ISpecifications {
  cpu?: string;
  operatingSystem?: string;
  ram?: string;
  gpu?: string;
  storage?: string;
  batteryCapacity?: string;
  screen?: string;
  keyboard?: string;
  bluetooth?: string;
  camera?: string;
  weight?: string;
  color?: Array<string>;
  size?: string;
  material?: string;
  core?: number;
  simSlot?: number;
  cable?: boolean;
  earphone?: boolean;
  model?: string;
  connection?: string;
  connectionDistance?: string;
  switch?: string;
  type?: string;
  numberOfKeys?: string;
  ledLight?: string;
  otherFunction?: string;
  DPI?: string;
  led?: string;
  batteryTime?: string;
  frequency?: string;
  impedance?: string;
  compatible?: string;
  micrphone?: string;
  language?: string;
  numberOfUser?: number;
  operationSystem?: string;
  pen?: boolean;
  materialKeycaps?: string;
}

export class Product {
  id!: string;
  productID?: string;
  productName?: string;
  categoryId?: number;
  productPrice!: number;
  productDiscount?: number;
  productImage?: string[];
  productBrand?: string;
  productRegion?: string;
  ratingPoint?: number;
  numberReview?: number;
  warrantyPeriod?: number;
  description?: string;
  productTags?: string[];
  specifications!: ISpecifications;
  deletedAt?: Date; //Soft delete
}

export const ProductSchema = new Schema<Product>(
  {
    productID: { type: String, required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productDiscount: { type: Number, required: true },
    categoryId: { type: Number, required: true },
    productImage: { type: [String], required: true },
    productBrand: { type: String, required: true },
    productRegion: { type: String, required: false },
    ratingPoint: { type: Number, required: false },
    numberReview: { type: Number, required: false },
    warrantyPeriod: { type: Number, required: true },
    description: { type: String, required: false },
    productTags: { type: [String], required: true },
    specifications: { type: Object, required: true },
    deletedAt: { type: Date, default: null }, //Soft delete
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

ProductSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export const ProductModel = model<Product>("product", ProductSchema);
