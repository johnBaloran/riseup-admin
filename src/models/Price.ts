// src/models/Price.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Price model - pricing data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IPrice extends mongoose.Document {
  name: string;
  priceId: string;
  amount: number;
  type:
    | "earlyBird"
    | "regular"
    | "installment"
    | "regularInstallment"
    | "firstInstallment"
    | "free";
  createdAt: Date;
  updatedAt: Date;
}

const priceSchema = new Schema<IPrice>(
  {
    name: {
      type: String,
      required: [true, "Price name is required"],
    },
    priceId: {
      type: String,
      required: [true, "Stripe price ID is required"],
      unique: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    type: {
      type: String,
      enum: [
        "earlyBird",
        "regular",
        "installment",
        "regularInstallment",
        "firstInstallment",
        "free",
      ],
      required: [true, "Price type is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
priceSchema.index({ priceId: 1 });
priceSchema.index({ type: 1 });

export default (mongoose.models.Price as mongoose.Model<IPrice>) ||
  mongoose.model<IPrice>("Price", priceSchema);
