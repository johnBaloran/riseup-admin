// src/lib/validations/jersey.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Jersey validation schemas ONLY
 */

import { z } from "zod";

export const updateJerseyEditionSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  jerseyEdition: z.string().min(1, "Jersey edition is required"),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  tertiaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
});

export const updateJerseyCustomSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  imageData: z.object({
    id: z.string(),
    url: z.string().url(),
    publicId: z.string(),
  }),
});

export const removeJerseyDesignSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
});

export const updatePlayerJerseySchema = z.object({
  playerId: z.string().min(1, "Player ID is required"),
  jerseyNumber: z.number().min(0).max(99).nullable().optional(),
  jerseySize: z.enum(["S", "M", "L", "XL", "2XL"]).nullable().optional(),
  jerseyName: z.string().max(15).nullable().optional(),
});

export const addGenericJerseySchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  jerseyNumber: z.number().min(0).max(99).optional(),
  jerseySize: z.enum(["S", "M", "L", "XL", "2XL"]).optional(),
  jerseyName: z.string().max(15).optional(),
});

export const updateGenericJerseySchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  genericIndex: z.number().min(0, "Index must be non-negative"),
  jerseyNumber: z.number().min(0).max(99).optional(),
  jerseySize: z.enum(["S", "M", "L", "XL", "2XL"]).optional(),
  jerseyName: z.string().max(15).optional(),
});

export const removeGenericJerseySchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  genericIndex: z.number().min(0, "Index must be non-negative"),
});

export type UpdateJerseyEditionInput = z.infer<
  typeof updateJerseyEditionSchema
>;
export type UpdateJerseyCustomInput = z.infer<typeof updateJerseyCustomSchema>;
export type RemoveJerseyDesignInput = z.infer<typeof removeJerseyDesignSchema>;
export type UpdatePlayerJerseyInput = z.infer<typeof updatePlayerJerseySchema>;
export type AddGenericJerseyInput = z.infer<typeof addGenericJerseySchema>;
export type UpdateGenericJerseyInput = z.infer<
  typeof updateGenericJerseySchema
>;
export type RemoveGenericJerseyInput = z.infer<
  typeof removeGenericJerseySchema
>;
