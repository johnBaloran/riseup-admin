// src/lib/db/queries/games.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Game data access functions ONLY
 *
 * DRY Principle
 * Centralized game queries - used by API routes
 *
 * Error Handling
 * Graceful error messages for debugging
 */

import { connectDB } from "../mongodb";
import Game, { IGame } from "@/models/Game";
import Team from "@/models/Team";
import Division from "@/models/Division";
import Player from "@/models/Player";
import {
  getGameWeek,
  getGameWeekType,
  isGamePublished,
} from "@/lib/utils/schedule";

// ===== READ OPERATIONS =====

/**
 * Get game by ID with populated references
 */
export async function getGameById(id: string) {
  await connectDB();

  return Game.findById(id)
    .populate({
      path: "homeTeam",
      select: "teamName teamCode teamNameShort players",
      populate: {
        path: "players",
        select: "playerName jerseyNumber team",
      },
    })
    .populate({
      path: "awayTeam",
      select: "teamName teamCode teamNameShort players",
      populate: {
        path: "players",
        select: "playerName jerseyNumber team",
      },
    })
    .populate(
      "division",
      "divisionName location city day startDate seasonConfig"
    )
    .populate("playerOfTheGame", "playerName")
    .populate("players", "playerName jerseyNumber")
    .lean();
}

/**
 * Get games by division with filters
 */
export async function getGamesByDivision({
  divisionId,
  week,
  weekType,
  published,
  status,
}: {
  divisionId: string;
  week?: number;
  weekType?: string;
  published?: boolean;
  status?: boolean;
}) {
  await connectDB();

  const filter: any = { division: divisionId };

  if (week !== undefined) filter.week = week;
  if (weekType) filter.weekType = weekType;
  if (published !== undefined) filter.published = published;
  if (status !== undefined) filter.status = status;

  return Game.find(filter)
    .populate("homeTeam", "teamName teamCode teamNameShort")
    .populate("awayTeam", "teamName teamCode teamNameShort")
    .sort({ date: 1, time: 1 })
    .lean();
}

/**
 * Get games for a specific week
 * WITH BACKWARD COMPATIBILITY - falls back to date-based search
 */
export async function getGamesByWeek(divisionId: string, weekNumber: number) {
  await connectDB();

  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  // Try to find games with week field first
  let games = await Game.find({
    division: divisionId,
    week: weekNumber,
  })
    .populate("homeTeam", "teamName teamCode teamNameShort")
    .populate("awayTeam", "teamName teamCode teamNameShort")
    .sort({ time: 1 })
    .lean();

  // If no games found with week field, fall back to date-based search
  if (games.length === 0 && division.startDate) {
    const { calculateWeekDate } = await import("@/lib/utils/schedule");
    const weekStartDate = calculateWeekDate(
      division.startDate,
      weekNumber,
      division.day
    );
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 1);

    games = await Game.find({
      division: divisionId,
      date: {
        $gte: weekStartDate,
        $lt: weekEndDate,
      },
    })
      .populate("homeTeam", "teamName teamCode teamNameShort")
      .populate("awayTeam", "teamName teamCode teamNameShort")
      .sort({ time: 1 })
      .lean();
  }

  return games;
}

/**
 * Get all games for multiple divisions (for schedule overview)
 */
export async function getGamesByDivisions(divisionIds: string[]) {
  await connectDB();

  return Game.find({
    division: { $in: divisionIds },
  })
    .populate("homeTeam", "teamName teamCode")
    .populate("awayTeam", "teamName teamCode")
    .populate("division", "divisionName")
    .sort({ date: 1, time: 1 })
    .lean();
}

/**
 * Get games by date range
 */
export async function getGamesByDateRange(
  divisionId: string,
  startDate: Date,
  endDate: Date
) {
  await connectDB();

  return Game.find({
    division: divisionId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .populate("homeTeam", "teamName teamCode teamNameShort")
    .populate("awayTeam", "teamName teamCode teamNameShort")
    .sort({ date: 1, time: 1 })
    .lean();
}

/**
 * Get upcoming games for a division
 */
export async function getUpcomingGames(divisionId: string, limit: number = 5) {
  await connectDB();

  return Game.find({
    division: divisionId,
    date: { $gte: new Date() },
    status: false,
  })
    .populate("homeTeam", "teamName teamCode")
    .populate("awayTeam", "teamName teamCode")
    .sort({ date: 1, time: 1 })
    .limit(limit)
    .lean();
}

/**
 * Get games for a specific team
 */
export async function getGamesByTeam(teamId: string) {
  await connectDB();

  return Game.find({
    $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
  })
    .populate("homeTeam", "teamName teamCode")
    .populate("awayTeam", "teamName teamCode")
    .populate("division", "divisionName")
    .sort({ date: -1 })
    .lean();
}

// ===== CREATE OPERATIONS =====

/**
 * Create a single game
 */
export async function createGame(data: {
  gameName?: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  division: string;
  week?: number;
  weekType?: "REGULAR" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  published?: boolean;
  dateOverride?: boolean;
  isPlayoffGame?: boolean;
  youtubeLink?: string;
}) {
  await connectDB();

  // Validate teams exist and are in the division
  const [homeTeam, awayTeam] = await Promise.all([
    Team.findById(data.homeTeam),
    Team.findById(data.awayTeam),
  ]);

  if (!homeTeam || !awayTeam) {
    throw new Error("One or both teams not found");
  }

  if (
    homeTeam.division.toString() !== data.division ||
    awayTeam.division.toString() !== data.division
  ) {
    throw new Error("Teams must be in the same division");
  }

  // Auto-generate gameName if not provided
  const gameName = data.gameName || `${homeTeam.teamName} vs. ${awayTeam.teamName}`;

  // Create game
  const game = await Game.create({
    ...data,
    gameName,
    date: new Date(data.date),
    homeTeamScore: 0,
    awayTeamScore: 0,
    status: false,
    started: false,
    gamePhotosCount: 0,
    players: [],
    calculatedDate: data.dateOverride ? undefined : new Date(data.date),
  });

  // Add game to teams
  await Promise.all([
    Team.findByIdAndUpdate(data.homeTeam, {
      $addToSet: { games: game._id },
    }),
    Team.findByIdAndUpdate(data.awayTeam, {
      $addToSet: { games: game._id },
    }),
  ]);

  // Add game to division
  await Division.findByIdAndUpdate(data.division, {
    $addToSet: { games: game._id },
  });

  return game.toObject();
}

/**
 * Create multiple games at once (bulk create)
 */
export async function createGames(
  games: Array<{
    gameName?: string;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    division: string;
    week?: number;
    weekType?: "REGULAR" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
    published?: boolean;
    dateOverride?: boolean;
    isPlayoffGame?: boolean;
  }>
) {
  await connectDB();

  const createdGames = [];

  for (const gameData of games) {
    const game = await createGame(gameData);
    createdGames.push(game);
  }

  return createdGames;
}

// ===== UPDATE OPERATIONS =====

/**
 * Update a game
 */
export async function updateGame(
  id: string,
  data: {
    gameName?: string;
    date?: string;
    time?: string;
    homeTeam?: string;
    awayTeam?: string;
    homeTeamScore?: number;
    awayTeamScore?: number;
    status?: boolean;
    started?: boolean;
    week?: number;
    weekType?: "REGULAR" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
    published?: boolean;
    dateOverride?: boolean;
    youtubeLink?: string;
    playerOfTheGame?: string | null;
    isPlayoffGame?: boolean;
  }
) {
  await connectDB();

  const game = await Game.findById(id);
  if (!game) throw new Error("Game not found");

  // If teams are being changed, update team references
  if (data.homeTeam && data.homeTeam !== game.homeTeam.toString()) {
    // Remove from old team
    await Team.findByIdAndUpdate(game.homeTeam, {
      $pull: { games: game._id },
    });
    // Add to new team
    await Team.findByIdAndUpdate(data.homeTeam, {
      $addToSet: { games: game._id },
    });
  }

  if (data.awayTeam && data.awayTeam !== game.awayTeam.toString()) {
    // Remove from old team
    await Team.findByIdAndUpdate(game.awayTeam, {
      $pull: { games: game._id },
    });
    // Add to new team
    await Team.findByIdAndUpdate(data.awayTeam, {
      $addToSet: { games: game._id },
    });
  }

  // Update game
  const updateData: any = { ...data };
  if (data.date) {
    updateData.date = new Date(data.date);

    // Update calculatedDate if date was manually changed
    if (data.dateOverride) {
      updateData.calculatedDate = game.date; // Store original calculated date
    }
  }

  return Game.findByIdAndUpdate(id, updateData, { new: true })
    .populate("homeTeam", "teamName teamCode teamNameShort")
    .populate("awayTeam", "teamName teamCode teamNameShort")
    .lean();
}

/**
 * Publish games (make visible to players)
 */
export async function publishGames(gameIds: string[]) {
  await connectDB();

  await Game.updateMany(
    { _id: { $in: gameIds } },
    { $set: { published: true } }
  );

  return { published: gameIds.length };
}

/**
 * Unpublish games (hide from players)
 */
export async function unpublishGames(gameIds: string[]) {
  await connectDB();

  await Game.updateMany(
    { _id: { $in: gameIds } },
    { $set: { published: false } }
  );

  return { unpublished: gameIds.length };
}

// ===== DELETE OPERATIONS =====

/**
 * Delete a game with cascading cleanup
 */
export async function deleteGame(gameId: string) {
  await connectDB();

  const game = await Game.findById(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  // Step 1: Find players affected by this game BEFORE removing stats
  const affectedPlayers = await Player.find({
    "allStats.game": gameId,
  }).select("_id");

  // Step 2: Remove game stats from players' allStats array
  await Player.updateMany(
    { "allStats.game": gameId },
    { $pull: { allStats: { game: gameId } } }
  );

  // Step 3: Recalculate averageStats for affected players only
  for (const player of affectedPlayers) {
    await recalculatePlayerAverageStats(player._id.toString());
  }

  // Step 4: Remove game from both home team and away team games arrays
  await Team.updateMany({ games: gameId }, { $pull: { games: gameId } });

  // Step 5: Remove game from division's games array
  await Division.findByIdAndUpdate(game.division, {
    $pull: { games: gameId },
  });

  // Step 6: If game was completed, adjust team records
  if (game.status === true) {
    await adjustTeamRecords(game, "REVERSE");
  }

  // Step 7: Delete the game
  await Game.findByIdAndDelete(gameId);

  return { deleted: true };
}

/**
 * Helper: Recalculate player's average stats after deletion
 */
async function recalculatePlayerAverageStats(playerId: string) {
  const player = await Player.findById(playerId);

  if (!player || !player.allStats || player.allStats.length === 0) {
    // No stats, reset to zero
    await Player.findByIdAndUpdate(playerId, {
      averageStats: {
        points: 0,
        rebounds: 0,
        assists: 0,
        blocks: 0,
        steals: 0,
        threesMade: 0,
        twosMade: 0,
        freeThrowsMade: 0,
      },
    });
    return;
  }

  const totalGames = player.allStats.length;

  // Calculate totals
  const totals = player.allStats.reduce(
    (acc, stat: any) => ({
      points: acc.points + (stat.points || 0),
      rebounds: acc.rebounds + (stat.rebounds || 0),
      assists: acc.assists + (stat.assists || 0),
      blocks: acc.blocks + (stat.blocks || 0),
      steals: acc.steals + (stat.steals || 0),
      threesMade: acc.threesMade + (stat.threesMade || 0),
      twosMade: acc.twosMade + (stat.twosMade || 0),
      freeThrowsMade: acc.freeThrowsMade + (stat.freeThrowsMade || 0),
    }),
    {
      points: 0,
      rebounds: 0,
      assists: 0,
      blocks: 0,
      steals: 0,
      threesMade: 0,
      twosMade: 0,
      freeThrowsMade: 0,
    }
  );

  // Calculate averages (rounded to 1 decimal place)
  const averages = {
    points: Math.round((totals.points / totalGames) * 10) / 10,
    rebounds: Math.round((totals.rebounds / totalGames) * 10) / 10,
    assists: Math.round((totals.assists / totalGames) * 10) / 10,
    blocks: Math.round((totals.blocks / totalGames) * 10) / 10,
    steals: Math.round((totals.steals / totalGames) * 10) / 10,
    threesMade: Math.round((totals.threesMade / totalGames) * 10) / 10,
    twosMade: Math.round((totals.twosMade / totalGames) * 10) / 10,
    freeThrowsMade: Math.round((totals.freeThrowsMade / totalGames) * 10) / 10,
  };

  // Update player
  await Player.findByIdAndUpdate(playerId, {
    averageStats: averages,
  });
}

/**
 * Helper: Adjust team records after game completion or deletion
 */
async function adjustTeamRecords(game: IGame, action: "REVERSE" | "APPLY") {
  const multiplier = action === "REVERSE" ? -1 : 1;

  const homeWon = game.homeTeamScore > game.awayTeamScore;
  const pointDiff = Math.abs(game.homeTeamScore - game.awayTeamScore);

  // Update home team
  await Team.findByIdAndUpdate(game.homeTeam, {
    $inc: {
      wins: homeWon ? multiplier : 0,
      losses: !homeWon ? multiplier : 0,
      pointDifference: pointDiff * multiplier * (homeWon ? 1 : -1),
    },
  });

  // Update away team
  await Team.findByIdAndUpdate(game.awayTeam, {
    $inc: {
      wins: !homeWon ? multiplier : 0,
      losses: homeWon ? multiplier : 0,
      pointDifference: pointDiff * multiplier * (!homeWon ? 1 : -1),
    },
  });
}

// ===== VALIDATION QUERIES =====

/**
 * Check if a team has a game at the same time
 */
export async function hasTeamConflict(
  teamId: string,
  date: Date,
  time: string,
  excludeGameId?: string
): Promise<boolean> {
  await connectDB();

  const query: any = {
    $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
    date,
    time,
  };

  if (excludeGameId) {
    query._id = { $ne: excludeGameId };
  }

  const count = await Game.countDocuments(query);
  return count > 0;
}

/**
 * Get team's game count for a specific week
 */
export async function getTeamGameCountForWeek(
  teamId: string,
  divisionId: string,
  week: number
): Promise<number> {
  await connectDB();

  return Game.countDocuments({
    division: divisionId,
    week,
    $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
  });
}

/**
 * Check if matchup already exists in the same week
 */
export async function hasMatchupConflict(
  divisionId: string,
  week: number,
  homeTeam: string,
  awayTeam: string,
  excludeGameId?: string
): Promise<boolean> {
  await connectDB();

  const query: any = {
    division: divisionId,
    week,
    $or: [
      { homeTeam, awayTeam },
      { homeTeam: awayTeam, awayTeam: homeTeam }, // Reverse matchup
    ],
  };

  if (excludeGameId) {
    query._id = { $ne: excludeGameId };
  }

  const count = await Game.countDocuments(query);
  return count > 0;
}
