// src/lib/validations/division.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Division validation schemas ONLY
 */

import { z } from "zod";

export const createDivisionSchema = z.object({
  divisionName: z
    .string()
    .min(2, "Division name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  city: z.string().min(1, "City is required"),
  location: z.string().min(1, "Location is required"),
  level: z.string().min(1, "Level is required"),
  day: z.enum([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]),
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  prices: z.object({
    earlyBird: z.string().min(1, "Early Bird price is required"),
    regular: z.string().min(1, "Regular price is required"),
    installment: z.string().min(1, "Early Bird installment price is required"),
    regularInstallment: z
      .string()
      .min(1, "Regular installment price is required"),
    firstInstallment: z.string().min(1, "Down payment price is required"),
    free: z.string().min(1, "Free price is required"),
  }),
  active: z.boolean(),
  register: z.boolean(),
});

export const updateDivisionSchema = z.object({
  id: z.string(),
  divisionName: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  location: z.string().optional(),
  level: z.string().optional(),
  day: z
    .enum([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ])
    .optional(),
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  active: z.boolean().optional(),
  register: z.boolean().optional(),
});

export type CreateDivisionInput = z.infer<typeof createDivisionSchema>;
export type UpdateDivisionInput = z.infer<typeof updateDivisionSchema>;
