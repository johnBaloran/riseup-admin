// src/lib/validations/game.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Game validation schemas ONLY
 *
 * DRY Principle
 * Shared between API routes and form components
 *
 * Type Safety
 * Zod provides runtime validation + TypeScript types
 */

import { z } from "zod";

// ===== ENUMS =====

export const gameWeekTypeEnum = z.enum([
  "REGULAR",
  "QUARTERFINAL",
  "SEMIFINAL",
  "FINAL",
]);

// ===== BASE GAME SCHEMA =====

/**
 * Base game fields validation
 * Used as foundation for create/update schemas
 */
const baseGameSchema = z.object({
  gameName: z
    .string()
    .min(2, "Game name must be at least 2 characters")
    .max(100, "Game name must not exceed 100 characters")
    .trim(),

  date: z.string().refine(
    (dateString) => {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    },
    { message: "Invalid date format" }
  ),

  time: z
    .string()
    .min(1, "Time is required")
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Time must be in HH:MM format (24-hour)"
    ),

  homeTeam: z.string().min(1, "Home team is required"),

  awayTeam: z.string().min(1, "Away team is required"),

  division: z.string().min(1, "Division is required"),

  week: z
    .number()
    .int()
    .min(1, "Week must be at least 1")
    .max(20, "Week cannot exceed 20")
    .optional(),

  weekType: gameWeekTypeEnum.optional(),

  published: z.boolean().optional(),

  dateOverride: z.boolean().optional(),

  isPlayoffGame: z.boolean().optional(),
});

// ===== CREATE GAME SCHEMA =====

/**
 * Schema for creating a new game
 * All required fields must be present
 */
export const createGameSchema = baseGameSchema
  .extend({
    // Additional fields specific to creation
    youtubeLink: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // Validation: Home team cannot be the same as away team
      return data.homeTeam !== data.awayTeam;
    },
    {
      message: "Home team and away team cannot be the same",
      path: ["awayTeam"],
    }
  );

// ===== UPDATE GAME SCHEMA =====

/**
 * Schema for updating an existing game
 * All fields are optional (partial update)
 */
export const updateGameSchema = z
  .object({
    id: z.string().min(1, "Game ID is required"),
    gameName: z
      .string()
      .min(2, "Game name must be at least 2 characters")
      .max(100, "Game name must not exceed 100 characters")
      .trim()
      .optional(),

    date: z
      .string()
      .refine(
        (dateString) => {
          const date = new Date(dateString);
          return !isNaN(date.getTime());
        },
        { message: "Invalid date format" }
      )
      .optional(),

    time: z
      .string()
      .min(1, "Time is required")
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Time must be in HH:MM format (24-hour)"
      )
      .optional(),

    homeTeam: z.string().min(1, "Home team is required").optional(),

    awayTeam: z.string().min(1, "Away team is required").optional(),

    homeTeamScore: z.number().int().min(0).optional(),

    awayTeamScore: z.number().int().min(0).optional(),

    status: z.boolean().optional(),

    started: z.boolean().optional(),

    week: z.number().int().min(1).max(20).optional(),

    weekType: gameWeekTypeEnum.optional(),

    published: z.boolean().optional(),

    dateOverride: z.boolean().optional(),

    youtubeLink: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),

    playerOfTheGame: z.string().optional().nullable(),

    isPlayoffGame: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Validation: If both homeTeam and awayTeam are provided, they must be different
      if (data.homeTeam && data.awayTeam) {
        return data.homeTeam !== data.awayTeam;
      }
      return true;
    },
    {
      message: "Home team and away team cannot be the same",
      path: ["awayTeam"],
    }
  );

// ===== BULK CREATE GAMES SCHEMA =====

/**
 * Schema for creating multiple games at once
 * Used when scheduling a full week
 */
export const bulkCreateGamesSchema = z.object({
  divisionId: z.string().min(1, "Division ID is required"),
  week: z.number().int().min(1, "Week must be at least 1"),
  weekType: gameWeekTypeEnum,
  games: z
    .array(createGameSchema.innerType().omit({ division: true }))
    .min(1, "At least one game is required")
    .max(20, "Cannot create more than 20 games at once"),
});

// ===== DELETE GAME SCHEMA =====

/**
 * Schema for deleting a game
 */
export const deleteGameSchema = z.object({
  id: z.string().min(1, "Game ID is required"),
  confirmed: z.boolean().refine((val) => val === true, {
    message: "Deletion must be confirmed",
  }),
});

// ===== PUBLISH GAMES SCHEMA =====

/**
 * Schema for publishing draft games
 */
export const publishGamesSchema = z.object({
  gameIds: z
    .array(z.string())
    .min(1, "At least one game ID is required")
    .max(50, "Cannot publish more than 50 games at once"),
});

// ===== QUERY SCHEMAS =====

/**
 * Schema for fetching games with filters
 */
export const getGamesQuerySchema = z.object({
  divisionId: z.string().optional(),
  week: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1))
    .optional(),
  weekType: gameWeekTypeEnum.optional(),
  published: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  status: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  homeTeam: z.string().optional(),
  awayTeam: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Schema for schedule overview query
 */
export const scheduleOverviewQuerySchema = z.object({
  cityId: z.string().optional(),
  locationId: z.string().optional(),
});

// ===== TYPE EXPORTS =====

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
export type BulkCreateGamesInput = z.infer<typeof bulkCreateGamesSchema>;
export type DeleteGameInput = z.infer<typeof deleteGameSchema>;
export type PublishGamesInput = z.infer<typeof publishGamesSchema>;
export type GetGamesQuery = z.infer<typeof getGamesQuerySchema>;
export type ScheduleOverviewQuery = z.infer<typeof scheduleOverviewQuerySchema>;

// ===== VALIDATION HELPERS =====

/**
 * Validate time conflict between games
 * Used in business logic layer
 */
export function validateTimeConflict(
  game1: { time: string; homeTeam: string; awayTeam: string },
  game2: { time: string; homeTeam: string; awayTeam: string }
): boolean {
  // Same time
  if (game1.time !== game2.time) return false;

  // Check if any team is playing in both games
  const game1Teams = [game1.homeTeam, game1.awayTeam];
  const game2Teams = [game2.homeTeam, game2.awayTeam];

  return game1Teams.some((team) => game2Teams.includes(team));
}

/**
 * Validate playoff game structure
 * Ensures correct number of games for playoff type
 */
export function validatePlayoffStructure(
  weekType: z.infer<typeof gameWeekTypeEnum>,
  gameCount: number
): { valid: boolean; expectedCount: number; message?: string } {
  const expectedCounts: Record<string, number> = {
    QUARTERFINAL: 4, // 8 teams → 4 games
    SEMIFINAL: 2, // 4 teams → 2 games
    FINAL: 1, // 2 teams → 1 game
  };

  const expected = expectedCounts[weekType];

  if (!expected) {
    return { valid: true, expectedCount: 0 }; // Regular season has no limit
  }

  if (gameCount !== expected) {
    return {
      valid: false,
      expectedCount: expected,
      message: `${weekType} should have exactly ${expected} game(s), but ${gameCount} provided`,
    };
  }

  return { valid: true, expectedCount: expected };
}

/**
 * Validate game date is within season bounds
 */
export function validateGameDateInSeason(
  gameDate: Date,
  divisionStartDate: Date,
  totalWeeks: number
): { valid: boolean; message?: string } {
  const seasonEndDate = new Date(divisionStartDate);
  seasonEndDate.setDate(seasonEndDate.getDate() + totalWeeks * 7);

  if (gameDate < divisionStartDate) {
    return {
      valid: false,
      message: "Game date cannot be before division start date",
    };
  }

  if (gameDate > seasonEndDate) {
    return {
      valid: false,
      message: "Game date cannot be after season end date",
    };
  }

  return { valid: true };
}
