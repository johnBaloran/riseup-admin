// src/lib/db/queries/prices.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Price data access functions ONLY
 */

import { connectDB } from "../mongodb";
import Price from "@/models/Price";

/**
 * Get all prices with city populated (sorted by city, then type, then amount)
 */
export async function getAllPrices() {
  await connectDB();
  return Price.find().populate("city").sort({ city: 1, type: 1, amount: 1 }).lean();
}

/**
 * Get prices by type
 */
export async function getPricesByType(type: string) {
  await connectDB();
  return Price.find({ type }).sort({ amount: 1 }).lean();
}

/**
 * Get price by ID
 */
export async function getPriceById(id: string) {
  await connectDB();
  return Price.findById(id).lean();
}

/**
 * Create new price
 */
export async function createPrice(data: {
  name: string;
  priceId: string;
  city?: string;
  amount: number;
  type: string;
}) {
  await connectDB();

  const price = await Price.create(data);

  return price.toObject();
}

/**
 * Check if Stripe price ID exists
 */
export async function stripePriceIdExists(priceId: string): Promise<boolean> {
  await connectDB();

  const count = await Price.countDocuments({ priceId });
  return count > 0;
}

/**
 * Get division count using this price
 */
export async function getPriceDivisionCount(priceId: string): Promise<number> {
  await connectDB();

  const Division = (await import("@/models/Division")).default;

  const count = await Division.countDocuments({
    $or: [
      { "prices.earlyBird": priceId },
      { "prices.regular": priceId },
      { "prices.installment": priceId },
      { "prices.firstInstallment": priceId },
      { "prices.free": priceId },
    ],
  });

  return count;
}
