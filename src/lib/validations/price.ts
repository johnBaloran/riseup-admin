// src/lib/validations/price.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Price validation schemas ONLY
 */

import { z } from "zod";

export const createPriceSchema = z.object({
  name: z.string().min(2, "Price name must be at least 2 characters"),
  priceId: z
    .string()
    .min(5, "Stripe price ID is required")
    .startsWith("price_", "Must be a valid Stripe price ID"),
  amount: z.number().min(0, "Amount must be 0 or greater"),
  type: z.enum([
    "earlyBird",
    "regular",
    "installment",
    "regularInstallment",
    "firstInstallment",
    "free",
  ]),
});

export type CreatePriceInput = z.infer<typeof createPriceSchema>;
