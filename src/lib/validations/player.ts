// src/lib/validations/player.ts - Update jersey sizes

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player validation schemas ONLY
 */

import { z } from "zod";

export const createPlayerSchema = z.object({
  playerName: z.string().min(2, "Player name must be at least 2 characters"),
  division: z.string().min(1, "Division is required"),
  team: z.string().optional(),
  jerseyNumber: z
    .number()
    .min(0, "Jersey number must be 0 or greater")
    .max(99, "Jersey number must be 99 or less")
    .optional()
    .nullable(),
  jerseySize: z
    .enum(["S", "M", "L", "XL", "2XL"]) // Updated to match actual sizes
    .optional(),
  jerseyName: z
    .string()
    .max(15, "Jersey name must be 15 characters or less")
    .optional(),
  instagram: z.string().optional(),
  user: z.string().optional(),
});

export const updatePlayerSchema = z.object({
  id: z.string(),
  playerName: z.string().min(2).optional(),
  division: z.string().optional(),
  team: z.string().nullable().optional(),
  jerseyNumber: z.number().min(0).max(99).nullable().optional(),
  jerseySize: z
    .enum(["S", "M", "L", "XL", "2XL"]) // Updated to match actual sizes
    .optional()
    .nullable(),
  jerseyName: z.string().max(15).optional().nullable(),
  instagram: z.string().optional().nullable(),
  user: z.string().nullable().optional(),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
