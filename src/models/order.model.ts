import { model, Schema, Types } from "mongoose";
import { OrderStatus } from "../constants/order_status";
import { Product, ProductSchema } from "./product.model";

export interface OrderItem {
  product: Product;
  price: number;
  quantity: number;
}

export const OrderItemSchema = new Schema<OrderItem>({
  product: { type: ProductSchema, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

export class Order {
  id!: string;
  items!: OrderItem[];
  totalPrice!: number;
  name!: string;
  phone!: string;
  city!: string;
  district!: string;
  ward!: string;
  street!: string;
  paymentId!: string;
  status!: OrderStatus;
  user!: Types.ObjectId;
  createdAt!: Date;
  updatedAt!: Date;
}

const orderSchema = new Schema<Order>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    street: { type: String, required: true },
    paymentId: { type: String },
    totalPrice: { type: Number, required: true },
    items: { type: [OrderItemSchema], required: true },
    status: { type: String, default: OrderStatus.NEW },
    user: { type: Schema.Types.ObjectId, required: true },
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

export const OrderModel = model("order", orderSchema);
