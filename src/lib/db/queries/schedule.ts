// src/lib/db/queries/schedule.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Schedule-specific queries and statistics ONLY
 *
 * DRY Principle
 * Centralized schedule analytics and overview data
 */

import { connectDB } from "../mongodb";
import Division from "@/models/Division";
import Game from "@/models/Game";
import Team from "@/models/Team";
import Location from "@/models/Location";
import {
  getTotalWeeks,
  generateWeekStructure,
  getCurrentWeek,
  getSeasonConfig,
} from "@/lib/utils/schedule";

// ===== SCHEDULE OVERVIEW =====

export interface DivisionScheduleStatus {
  divisionId: string;
  divisionName: string;
  location: {
    id: string;
    name: string;
    address: string;
  };
  city: {
    id: string;
    name: string;
  };
  day: string;
  timeRange: string;
  teamCount: number;
  totalWeeks: number;
  scheduledWeeks: number;
  currentWeek: number;
  status: "not-started" | "in-progress" | "complete";
  nextGame?: {
    homeTeam: string;
    awayTeam: string;
    week: number;
  };
}

/**
 * Get schedule overview for all divisions (or filtered by location)
 */
export async function getScheduleOverview({
  locationId,
  cityId,
}: {
  locationId?: string;
  cityId?: string;
} = {}) {
  await connectDB();

  const filter: any = {
    $or: [{ active: true }, { register: true }],
  };

  if (locationId) filter.location = locationId;
  if (cityId) filter.city = cityId;

  const divisions = await Division.find(filter)
    .populate("location", "name address")
    .populate("city", "cityName")
    .populate("teams")
    .lean();

  const divisionStatuses: DivisionScheduleStatus[] = [];

  for (const division of divisions) {
    const totalWeeks = getTotalWeeks(division);
    const currentWeek = getCurrentWeek(division);

    // Count how many weeks have games
    const gamesGroupedByWeek = await Game.aggregate([
      { $match: { division: division._id } },
      { $group: { _id: "$week" } },
    ]);

    const scheduledWeeks = gamesGroupedByWeek.length;

    // Determine status
    let status: "not-started" | "in-progress" | "complete";
    if (scheduledWeeks === 0) {
      status = "not-started";
    } else if (scheduledWeeks < totalWeeks) {
      status = "in-progress";
    } else {
      status = "complete";
    }

    // Get next game for current week
    const nextGame = await Game.findOne({
      division: division._id,
      week: currentWeek,
      published: true,
    })
      .populate("homeTeam", "teamName teamCode")
      .populate("awayTeam", "teamName teamCode")
      .sort({ time: 1 })
      .lean();

    const location = division.location as any;
    const city = division.city as any;

    divisionStatuses.push({
      divisionId: division._id.toString(),
      divisionName: division.divisionName,
      location: {
        id: location._id.toString(),
        name: location.name,
        address: location.address,
      },
      city: {
        id: city._id.toString(),
        name: city.cityName,
      },
      day: division.day,
      timeRange: `${division.startTime} - ${division.endTime}`,
      teamCount: division.teams.length,
      totalWeeks,
      scheduledWeeks,
      currentWeek,
      status,
      nextGame: nextGame
        ? {
            homeTeam: (nextGame.homeTeam as any).teamCode,
            awayTeam: (nextGame.awayTeam as any).teamCode,
            week: nextGame.week || currentWeek,
          }
        : undefined,
    });
  }

  // Group by location
  const grouped = divisionStatuses.reduce((acc, div) => {
    const locId = div.location.id;
    if (!acc[locId]) {
      acc[locId] = {
        location: div.location,
        divisions: [],
      };
    }
    acc[locId].divisions.push(div);
    return acc;
  }, {} as Record<string, { location: any; divisions: DivisionScheduleStatus[] }>);

  return {
    locations: Object.values(grouped),
    stats: {
      totalDivisions: divisionStatuses.length,
      needAttention: divisionStatuses.filter(
        (d) => d.status === "not-started" || d.status === "in-progress"
      ).length,
      fullyScheduled: divisionStatuses.filter((d) => d.status === "complete")
        .length,
      totalTeams: divisionStatuses.reduce((sum, d) => sum + d.teamCount, 0),
    },
  };
}

// ===== DIVISION SCHEDULE DETAILS =====

export interface WeekSchedule {
  weekNumber: number;
  weekType: "REGULAR" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  label: string;
  date: Date;
  isRegular: boolean;
  isPlayoff: boolean;
  games: Array<{
    id: string;
    gameName: string;
    time: string;
    homeTeam: {
      id: string;
      name: string;
      code: string;
    };
    awayTeam: {
      id: string;
      name: string;
      code: string;
    };
    published: boolean;
    status: boolean;
  }>;
  isComplete: boolean;
  isCurrent: boolean;
}

/**
 * Get detailed schedule for a division
 */
export async function getDivisionSchedule(divisionId: string) {
  await connectDB();

  const division = await Division.findById(divisionId)
    .populate("location", "name address")
    .populate("city", "cityName region")
    .populate("teams", "teamName teamCode teamNameShort")
    .lean();

  if (!division) {
    throw new Error("Division not found");
  }

  const weekStructure = generateWeekStructure(division);
  const currentWeek = getCurrentWeek(division);
  const totalWeeks = getTotalWeeks(division);

  // Get all games for division
  const games = await Game.find({ division: divisionId })
    .populate("homeTeam", "teamName teamCode teamNameShort")
    .populate("awayTeam", "teamName teamCode teamNameShort")
    .sort({ week: 1, time: 1 })
    .lean();

  // Group games by week
  const gamesByWeek: Record<number, any[]> = {};
  games.forEach((game) => {
    const week = game.week || 0;
    if (!gamesByWeek[week]) gamesByWeek[week] = [];
    gamesByWeek[week].push(game);
  });

  // Build week schedule
  const weekSchedules: WeekSchedule[] = weekStructure.map((week) => {
    const weekGames = gamesByWeek[week.weekNumber] || [];

    return {
      weekNumber: week.weekNumber,
      weekType: week.weekType,
      label: week.label,
      date: week.date,
      isRegular: week.weekType === "REGULAR",
      isPlayoff: week.weekType !== "REGULAR",
      games: weekGames.map((game) => ({
        id: game._id.toString(),
        gameName: game.gameName,
        time: game.time,
        homeTeam: {
          id: (game.homeTeam as any)._id.toString(),
          name: (game.homeTeam as any).teamName,
          code: (game.homeTeam as any).teamCode,
        },
        awayTeam: {
          id: (game.awayTeam as any)._id.toString(),
          name: (game.awayTeam as any).teamName,
          code: (game.awayTeam as any).teamCode,
        },
        published: game.published ?? true,
        status: game.status,
      })),
      isComplete: weekGames.length > 0 && weekGames.every((g) => g.status),
      isCurrent: week.weekNumber === currentWeek,
    };
  });

  return {
    division: {
      id: division._id.toString(),
      name: division.divisionName,
      location: division.location,
      city: division.city,
      day: division.day,
      timeRange: `${division.startTime} - ${division.endTime}`,
      teamCount: division.teams.length,
    },
    teams: (division.teams as any[]).map((team) => ({
      id: team._id.toString(),
      name: team.teamName,
      code: team.teamCode,
      shortName: team.teamNameShort,
    })),
    weeks: weekSchedules,
    currentWeek,
    totalWeeks,
  };
}

// ===== TEAM SCHEDULE TRACKING =====

export interface TeamScheduleCount {
  teamId: string;
  teamCode: string;
  teamName: string;
  gameCount: number;
}

/**
 * Get game counts per team for a specific week
 */
export async function getTeamScheduleCounts(
  divisionId: string,
  week: number
): Promise<TeamScheduleCount[]> {
  await connectDB();

  const division = await Division.findById(divisionId).populate(
    "teams",
    "teamCode teamName"
  );

  if (!division) {
    throw new Error("Division not found");
  }

  const teams = division.teams as any[];

  const counts: TeamScheduleCount[] = [];

  for (const team of teams) {
    const gameCount = await Game.countDocuments({
      division: divisionId,
      week,
      $or: [{ homeTeam: team._id }, { awayTeam: team._id }],
    });

    counts.push({
      teamId: team._id.toString(),
      teamCode: team.teamCode,
      teamName: team.teamName,
      gameCount,
    });
  }

  return counts;
}

// ===== WEEK STATUS =====

export type WeekStatus = "not-started" | "draft" | "published" | "complete";

/**
 * Get status for a specific week
 */
export async function getWeekStatus(
  divisionId: string,
  week: number
): Promise<WeekStatus> {
  await connectDB();

  const games = await Game.find({
    division: divisionId,
    week,
  }).lean();

  if (games.length === 0) return "not-started";

  const allPublished = games.every((g) => g.published !== false);
  const allComplete = games.every((g) => g.status === true);

  if (allComplete) return "complete";
  if (allPublished) return "published";
  return "draft";
}

// ===== SCHEDULE PROGRESS =====

/**
 * Calculate schedule completion percentage for a division
 */
export async function getScheduleProgress(divisionId: string) {
  await connectDB();

  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  const totalWeeks = getTotalWeeks(division);

  // Count unique weeks with games
  const weeksWithGames = await Game.distinct("week", {
    division: divisionId,
  });

  const scheduledWeeks = weeksWithGames.length;
  const percentage = Math.round((scheduledWeeks / totalWeeks) * 100);

  return {
    scheduledWeeks,
    totalWeeks,
    percentage,
  };
}

// ===== CONFLICT DETECTION =====

/**
 * Find all scheduling conflicts for a division
 */
export async function findScheduleConflicts(divisionId: string) {
  await connectDB();

  const games = await Game.find({ division: divisionId })
    .populate("homeTeam", "teamCode")
    .populate("awayTeam", "teamCode")
    .lean();

  const conflicts: Array<{
    type: "time-conflict" | "duplicate-matchup";
    games: string[];
    description: string;
  }> = [];

  // Check for time conflicts (same team playing at same time)
  for (let i = 0; i < games.length; i++) {
    for (let j = i + 1; j < games.length; j++) {
      const game1 = games[i];
      const game2 = games[j];

      // Same time and date
      if (
        game1.time === game2.time &&
        game1.date.getTime() === game2.date.getTime()
      ) {
        const teams1 = [
          game1.homeTeam._id.toString(),
          game1.awayTeam._id.toString(),
        ];
        const teams2 = [
          game2.homeTeam._id.toString(),
          game2.awayTeam._id.toString(),
        ];

        const hasCommonTeam = teams1.some((t) => teams2.includes(t));

        if (hasCommonTeam) {
          conflicts.push({
            type: "time-conflict",
            games: [game1._id.toString(), game2._id.toString()],
            description: `Same team playing at ${
              game1.time
            } on ${game1.date.toLocaleDateString()}`,
          });
        }
      }
    }
  }

  return conflicts;
}
