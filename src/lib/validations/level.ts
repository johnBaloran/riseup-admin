// src/lib/validations/level.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Level validation schemas ONLY
 */

import { z } from "zod";

export const createLevelSchema = z.object({
  name: z.string().min(2, "Level name must be at least 2 characters"),
  grade: z.number().min(1, "Grade must be at least 1"),
});

export const updateLevelSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  grade: z.number().min(1).optional(),
});

export type CreateLevelInput = z.infer<typeof createLevelSchema>;
export type UpdateLevelInput = z.infer<typeof updateLevelSchema>;
