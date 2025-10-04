// src/lib/validations/location.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Location validation schemas ONLY
 */

import { z } from "zod";

export const createLocationSchema = z.object({
  name: z.string().min(2, "Location name must be at least 2 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  coordinates: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
    .optional(),
});

export const updateLocationSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  address: z.string().min(5).optional(),
  city: z.string().optional(),
  coordinates: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
    .optional(),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
