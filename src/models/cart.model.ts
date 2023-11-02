import mongoose, { Schema } from "mongoose";
import { Product } from "./product.model";

export class CartItem {
	constructor(public product: Product) {}
	quantity: number = 1;
	price: number = this.product.productPrice;
}
export const CartItemSchema = new Schema<CartItem>(
	{
		product: {
			type: Object,
			ref: "Product",
			required: true,
		},
		quantity: {
			type: Number,
			default: 1,
		},
		price: {
			type: Number,
			required: true,
		},
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
export class Cart {
	items: CartItem[] = [];
	totalPrice: number = 0;
	totalCount: number = 0;
}

export const CartSchema = new Schema({
	items: { type: [CartItemSchema], required: true },
	totalPrice: { type: Number, required: true },
	totalCount: { type: Number, required: true },
});
