// src/lib/validations/city.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * City validation schemas ONLY
 */

/**
 * DRY Principle
 * Shared between API routes and form components
 */

import { z } from "zod";

export const createCitySchema = z.object({
  cityName: z.string().min(2, "City name must be at least 2 characters"),
  stripeAccountId: z.string().optional(),
  region: z.string().min(2, "Region is required"),
  country: z.string().min(2, "Country is required"),
  timezone: z.string().min(2, "Timezone is required"),
});

export const updateCitySchema = z.object({
  id: z.string(),
  cityName: z.string().min(2).optional(),
  stripeAccountId: z.string().optional(),
  region: z.string().min(2).optional(),
  country: z.string().min(2).optional(),
  timezone: z.string().min(2).optional(),
  active: z.boolean().optional(),
});

export type CreateCityInput = z.infer<typeof createCitySchema>;
export type UpdateCityInput = z.infer<typeof updateCitySchema>;
