// src/lib/utils/schedule.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Schedule calculation utilities ONLY
 *
 * DRY - Centralized schedule logic used across the app
 * KISS - Simple, focused functions
 */

import { IDivision, ISeasonConfig } from "@/models/Division";
import { IGame, GameWeekType } from "@/models/Game";

// ===== SEASON CONFIGURATION HELPERS =====

/**
 * Get season config with fallback for backward compatibility
 * Adapter Pattern - adapts old divisions to new structure
 */
export function getSeasonConfig(division: IDivision): ISeasonConfig {
  return (
    division.seasonConfig || {
      regularSeasonWeeks: 7,
      hasPlayoffs: true,
      playoffStructure: {
        hasQuarterfinals: true,
        hasSemifinals: true,
        hasFinals: true,
      },
    }
  );
}

/**
 * Calculate total weeks for a division
 */
export function getTotalWeeks(division: IDivision): number {
  const config = getSeasonConfig(division);
  let totalWeeks = config.regularSeasonWeeks;

  if (config.hasPlayoffs) {
    if (config.playoffStructure.hasQuarterfinals) totalWeeks++;
    if (config.playoffStructure.hasSemifinals) totalWeeks++;
    if (config.playoffStructure.hasFinals) totalWeeks++;
  }

  return totalWeeks;
}

/**
 * Get playoff week numbers for a division
 */
export function getPlayoffWeeks(division: IDivision): {
  quarterfinals?: number;
  semifinals?: number;
  finals?: number;
} {
  const config = getSeasonConfig(division);
  const regularWeeks = config.regularSeasonWeeks;
  const weeks: {
    quarterfinals?: number;
    semifinals?: number;
    finals?: number;
  } = {};

  if (!config.hasPlayoffs) return weeks;

  let playoffWeek = regularWeeks + 1;

  if (config.playoffStructure.hasQuarterfinals) {
    weeks.quarterfinals = playoffWeek;
    playoffWeek++;
  }

  if (config.playoffStructure.hasSemifinals) {
    weeks.semifinals = playoffWeek;
    playoffWeek++;
  }

  if (config.playoffStructure.hasFinals) {
    weeks.finals = playoffWeek;
  }

  return weeks;
}

// ===== DATE CALCULATION HELPERS =====

/**
 * Convert day name to number (0=Sunday, 1=Monday, etc.)
 */
function getDayNumber(dayName: string): number {
  const days: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return days[dayName] ?? 0;
}

/**
 * Calculate the date for a specific week
 * Based on division start date and day of week
 */
export function calculateWeekDate(
  divisionStartDate: Date,
  weekNumber: number,
  dayOfWeek: string
): Date {
  // Start from division start date
  const date = new Date(divisionStartDate);

  // Add weeks (weekNumber - 1 because week 1 is the start date week)
  date.setDate(date.getDate() + (weekNumber - 1) * 7);

  // Adjust to correct day of week
  const targetDay = getDayNumber(dayOfWeek);
  const currentDay = date.getDay();
  let diff = targetDay - currentDay;

  // Handle week wraparound
  if (diff < 0) diff += 7;

  date.setDate(date.getDate() + diff);

  return date;
}

/**
 * Format date for display (e.g., "Jan 9, 2025")
 */
export function formatWeekDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ===== GAME HELPERS (with backward compatibility) =====

/**
 * Get week number for a game (with fallback for legacy games)
 */
export function getGameWeek(game: IGame, division: IDivision): number {
  // If week is already set, use it
  if (game.week) return game.week;

  // Otherwise, calculate from date and division start date
  if (game.date && division.startDate) {
    const daysDiff = Math.floor(
      (game.date.getTime() - division.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return Math.floor(daysDiff / 7) + 1;
  }

  // Fallback: unknown
  return 0;
}

/**
 * Get week type for a game (with fallback for legacy games)
 */
export function getGameWeekType(
  game: IGame,
  division: IDivision
): GameWeekType {
  // If weekType is set, use it
  if (game.weekType) return game.weekType;

  // Otherwise, infer from week number
  const week = getGameWeek(game, division);
  const config = getSeasonConfig(division);
  const regularWeeks = config.regularSeasonWeeks;
  const playoffWeeks = getPlayoffWeeks(division);

  if (week <= regularWeeks) return "REGULAR";
  if (week === playoffWeeks.quarterfinals) return "QUARTERFINAL";
  if (week === playoffWeeks.semifinals) return "SEMIFINAL";
  if (week === playoffWeeks.finals) return "FINAL";

  return "REGULAR";
}

/**
 * Check if game is published (with fallback)
 */
export function isGamePublished(game: IGame): boolean {
  // If published field exists, use it
  if (game.published !== undefined) return game.published;

  // Fallback: all existing games are considered published
  return true;
}

// ===== WEEK STRUCTURE GENERATION =====

export interface WeekInfo {
  weekNumber: number;
  weekType: GameWeekType;
  label: string; // e.g., "Week 1", "Quarterfinals", etc.
  isRegular: boolean;
  isPlayoff: boolean;
}

/**
 * Generate week structure for a division
 */
export function generateWeekStructure(division: IDivision): WeekInfo[] {
  const config = getSeasonConfig(division);
  const weeks: WeekInfo[] = [];

  // Regular season weeks
  for (let i = 1; i <= config.regularSeasonWeeks; i++) {
    weeks.push({
      weekNumber: i,
      weekType: "REGULAR",
      label: `Week ${i}`,
      isRegular: true,
      isPlayoff: false,
    });
  }

  // Playoff weeks
  if (config.hasPlayoffs) {
    const playoffWeeks = getPlayoffWeeks(division);

    if (playoffWeeks.quarterfinals) {
      weeks.push({
        weekNumber: playoffWeeks.quarterfinals,
        weekType: "QUARTERFINAL",
        label: "Quarterfinals",
        isRegular: false,
        isPlayoff: true,
      });
    }

    if (playoffWeeks.semifinals) {
      weeks.push({
        weekNumber: playoffWeeks.semifinals,
        weekType: "SEMIFINAL",
        label: "Semifinals",
        isRegular: false,
        isPlayoff: true,
      });
    }

    if (playoffWeeks.finals) {
      weeks.push({
        weekNumber: playoffWeeks.finals,
        weekType: "FINAL",
        label: "Finals",
        isRegular: false,
        isPlayoff: true,
      });
    }
  }

  return weeks;
}

/**
 * Get current week based on today's date
 * Accounts for the actual day of week that games are played
 */
export function getCurrentWeek(division: IDivision): number {
  if (!division.startDate) return 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for comparison

  const totalWeeks = getTotalWeeks(division);

  // Find which week we're in by checking each week's date
  for (let week = 1; week <= totalWeeks; week++) {
    const weekDate = calculateWeekDate(division.startDate, week, division.day);
    weekDate.setHours(0, 0, 0, 0);

    // If we haven't reached this week's game day yet, we're in the previous week
    if (today < weekDate) {
      return Math.max(1, week - 1);
    }

    // If this is the last week and we've passed its date, we're in this week
    if (week === totalWeeks && today >= weekDate) {
      return week;
    }

    // Check if we're between this week and next week
    if (week < totalWeeks) {
      const nextWeekDate = calculateWeekDate(
        division.startDate,
        week + 1,
        division.day
      );
      nextWeekDate.setHours(0, 0, 0, 0);

      if (today >= weekDate && today < nextWeekDate) {
        return week;
      }
    }
  }

  // Fallback: return week 1
  return 1;
}
