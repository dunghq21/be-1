import mongoose, { Schema, model } from "mongoose";
import { Cart, CartSchema } from "./cart.model";

export class User {
  id!: string;
  email!: string;
  password!: string;
  name!: string;
  address!: string;
  isAdmin!: boolean;
  cart!: Cart;
}

export const UserSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    isAdmin: { type: Boolean, required: true },
    cart: CartSchema,
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

export const UserModel = model<User>("user", UserSchema);
