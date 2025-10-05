// src/lib/validations/team.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team validation schemas ONLY
 */

import { z } from "zod";

export const createTeamSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters"),
  teamNameShort: z.string().min(2, "Short name must be at least 2 characters"),
  teamCode: z.string().min(2, "Team code must be at least 2 characters"),
  city: z.string().min(1, "City is required"),
  location: z.string().min(1, "Location is required"),
  division: z.string().min(1, "Division is required"),
});

export const updateTeamSchema = z.object({
  id: z.string(),
  teamName: z.string().min(2).optional(),
  teamNameShort: z.string().min(2).optional(),
  teamCode: z.string().min(2).optional(),
  division: z.string().optional(),
  teamCaptain: z.string().nullable().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  tertiaryColor: z.string().optional(),
  jerseyEdition: z.string().optional(),
  isCustomJersey: z.boolean().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
