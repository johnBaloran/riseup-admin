// src/lib/db/queries/scorekeeper.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Scorekeeper-specific data access functions ONLY
 *
 * Handles all database operations related to:
 * - Player statistics updates
 * - Team statistics updates
 * - Game scoring and completion
 * - Player of the game selection
 */

import { connectDB } from "../mongodb";
import Game from "@/models/Game";
import Team from "@/models/Team";
import Player from "@/models/Player";
import mongoose from "mongoose";

// ===== HELPER FUNCTIONS =====

/**
 * Calculate average statistics from an array of stats
 */
function calculateAverageStats(stats: any[]) {
  if (!stats || stats.length === 0) {
    return {
      points: 0,
      rebounds: 0,
      assists: 0,
      blocks: 0,
      steals: 0,
      threesMade: 0,
      twosMade: 0,
      freeThrowsMade: 0,
      fouls: 0,
    };
  }

  const totalGames = stats.length;
  const totals = stats.reduce(
    (acc, stat) => ({
      points: acc.points + (stat.points || 0),
      rebounds: acc.rebounds + (stat.rebounds || 0),
      assists: acc.assists + (stat.assists || 0),
      blocks: acc.blocks + (stat.blocks || 0),
      steals: acc.steals + (stat.steals || 0),
      threesMade: acc.threesMade + (stat.threesMade || 0),
      twosMade: acc.twosMade + (stat.twosMade || 0),
      freeThrowsMade: acc.freeThrowsMade + (stat.freeThrowsMade || 0),
      fouls: acc.fouls + (stat.fouls || 0),
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
      fouls: 0,
    }
  );

  return {
    points: Math.round((totals.points / totalGames) * 10) / 10,
    rebounds: Math.round((totals.rebounds / totalGames) * 10) / 10,
    assists: Math.round((totals.assists / totalGames) * 10) / 10,
    blocks: Math.round((totals.blocks / totalGames) * 10) / 10,
    steals: Math.round((totals.steals / totalGames) * 10) / 10,
    threesMade: Math.round((totals.threesMade / totalGames) * 10) / 10,
    twosMade: Math.round((totals.twosMade / totalGames) * 10) / 10,
    freeThrowsMade: Math.round((totals.freeThrowsMade / totalGames) * 10) / 10,
    fouls: Math.round((totals.fouls / totalGames) * 10) / 10,
  };
}

// ===== PLAYER STATISTICS =====

/**
 * Update player game statistics
 * Handles both regular stats and point scoring
 */
export async function updatePlayerGameStats({
  gameId,
  playerId,
  statistics,
  updateScores,
}: {
  gameId: string;
  playerId: string;
  statistics: any;
  updateScores?: { home: number; away: number };
}) {
  await connectDB();

  // Find player
  const player = await Player.findById(playerId);
  if (!player) {
    throw new Error("Player not found");
  }

  // Update or add statistics
  const existingStatsIndex = player.allStats.findIndex(
    (stat: any) => stat.game.toString() === gameId
  );

  if (existingStatsIndex !== -1) {
    player.allStats[existingStatsIndex] = statistics;
  } else {
    player.allStats.push(statistics);
  }

  // Recalculate average stats (filter out games with 0 points)
  const nonZeroStats = player.allStats.filter(
    (stat: any) => stat.points !== undefined
  );
  player.averageStats = calculateAverageStats(nonZeroStats);

  // Save player
  await player.save();

  // Update game scores if provided
  let updatedScores = null;
  if (updateScores) {
    const game = await Game.findByIdAndUpdate(
      gameId,
      {
        $set: {
          homeTeamScore: updateScores.home,
          awayTeamScore: updateScores.away,
          started: true,
        },
      },
      { new: true }
    );

    if (game) {
      updatedScores = {
        home: game.homeTeamScore,
        away: game.awayTeamScore,
      };
    }
  }

  return {
    player: player.toObject(),
    scores: updatedScores,
  };
}

// ===== TEAM STATISTICS =====

/**
 * Update team game statistics
 * Aggregates all player stats for each team
 */
export async function updateTeamGameStats({
  gameId,
  homeTeamStats,
  awayTeamStats,
}: {
  gameId: string;
  homeTeamStats: {
    teamId: string;
    points: number;
    rebounds: number;
    assists: number;
    blocks: number;
    steals: number;
    threesMade: number;
    twosMade: number;
    freeThrowsMade: number;
  };
  awayTeamStats: {
    teamId: string;
    points: number;
    rebounds: number;
    assists: number;
    blocks: number;
    steals: number;
    threesMade: number;
    twosMade: number;
    freeThrowsMade: number;
  };
}) {
  await connectDB();

  // Fetch teams with populated games
  const [homeTeam, awayTeam] = await Promise.all([
    Team.findById(homeTeamStats.teamId).populate({
      path: "games",
      select:
        "gameName date homeTeam awayTeam homeTeamScore awayTeamScore status division",
    }),
    Team.findById(awayTeamStats.teamId).populate({
      path: "games",
      select:
        "gameName date homeTeam awayTeam homeTeamScore awayTeamScore status division",
    }),
  ]);

  if (!homeTeam || !awayTeam) {
    throw new Error("Teams not found");
  }

  // Initialize seasonStatistics if it doesn't exist
  if (!homeTeam.seasonStatistics) {
    homeTeam.seasonStatistics = [];
  }
  if (!awayTeam.seasonStatistics) {
    awayTeam.seasonStatistics = [];
  }

  // Update or add team statistics for this game
  const homeStatsToSave = {
    ...homeTeamStats,
    gameId,
    game: new mongoose.Types.ObjectId(gameId),
  };

  const awayStatsToSave = {
    ...awayTeamStats,
    gameId,
    game: new mongoose.Types.ObjectId(gameId),
  };

  // Check if stats already exist for this game
  const existingHomeStatsIndex = homeTeam.seasonStatistics.findIndex(
    (stat: any) =>
      stat.gameId?.toString() === gameId || stat.game?.toString() === gameId
  );

  const existingAwayStatsIndex = awayTeam.seasonStatistics.findIndex(
    (stat: any) =>
      stat.gameId?.toString() === gameId || stat.game?.toString() === gameId
  );

  // Update or add stats
  if (existingHomeStatsIndex !== -1) {
    homeTeam.seasonStatistics[existingHomeStatsIndex] = homeStatsToSave;
  } else {
    homeTeam.seasonStatistics.push(homeStatsToSave);
  }

  if (existingAwayStatsIndex !== -1) {
    awayTeam.seasonStatistics[existingAwayStatsIndex] = awayStatsToSave;
  } else {
    awayTeam.seasonStatistics.push(awayStatsToSave);
  }

  // Recalculate average stats (filter out games with 0 points)
  const homeNonZeroStats = homeTeam.seasonStatistics.filter(
    (stat: any) => stat.points !== 0
  );
  const awayNonZeroStats = awayTeam.seasonStatistics.filter(
    (stat: any) => stat.points !== 0
  );

  homeTeam.averageStats = calculateAverageStats(homeNonZeroStats);
  awayTeam.averageStats = calculateAverageStats(awayNonZeroStats);

  // Save teams
  await Promise.all([homeTeam.save(), awayTeam.save()]);

  return {
    homeTeam: homeTeam.toObject(),
    awayTeam: awayTeam.toObject(),
  };
}

// ===== GAME COMPLETION =====

/**
 * Calculate team win/loss records based on all completed games
 */
async function calculateTeamRecord(team: any) {
  let wins = 0;
  let losses = 0;
  let pointDifference = 0;

  team.games.forEach((game: any) => {
    if (game.status === true) {
      const isHomeTeam = game.homeTeam.toString() === team._id.toString();
      const teamScore = isHomeTeam ? game.homeTeamScore : game.awayTeamScore;
      const opponentScore = isHomeTeam
        ? game.awayTeamScore
        : game.homeTeamScore;

      if (teamScore > opponentScore) {
        wins++;
      } else {
        losses++;
      }

      pointDifference += teamScore - opponentScore;
    }
  });

  return { wins, losses, pointDifference };
}

/**
 * Determine player of the game automatically
 * Based on total stats (points + rebounds + assists + steals + blocks)
 */
function determinePlayerOfTheGame(game: any): any | null {
  const winningTeam =
    game.homeTeamScore > game.awayTeamScore ? game.homeTeam : game.awayTeam;

  let playerOfTheGame = null;
  let maxTotalStats = 0;

  winningTeam.players.forEach((player: any) => {
    const playerStats = player.allStats.find(
      (stat: any) => stat.game.toString() === game._id.toString()
    );

    if (playerStats) {
      const totalStats =
        (playerStats.points || 0) +
        (playerStats.rebounds || 0) +
        (playerStats.assists || 0) +
        (playerStats.steals || 0) +
        (playerStats.blocks || 0);

      if (totalStats > maxTotalStats) {
        maxTotalStats = totalStats;
        playerOfTheGame = player;
      }
    }
  });

  return playerOfTheGame;
}

/**
 * Finish game and calculate final standings
 */
export async function finishGame({
  gameId,
  homeTeamId,
  awayTeamId,
}: {
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
}) {
  await connectDB();

  // Fetch game with populated teams and players
  const game = await Game.findById(gameId)
    .populate({
      path: "homeTeam",
      select: "teamName teamNameShort wins losses averageStats",
      populate: {
        path: "players",
        select: "playerName averageStats jerseyNumber allStats",
      },
    })
    .populate({
      path: "awayTeam",
      select: "teamName teamNameShort wins losses averageStats",
      populate: {
        path: "players",
        select: "playerName averageStats jerseyNumber allStats",
      },
    });

  if (!game) {
    throw new Error("Game not found");
  }

  // Mark game as complete
  game.status = true;
  await game.save();

  // Fetch teams with populated games for record calculation
  const [homeTeam, awayTeam] = await Promise.all([
    Team.findById(homeTeamId).populate({
      path: "games",
      select:
        "gameName date homeTeam awayTeam status division homeTeamScore awayTeamScore",
    }),
    Team.findById(awayTeamId).populate({
      path: "games",
      select:
        "gameName date homeTeam awayTeam status division homeTeamScore awayTeamScore",
    }),
  ]);

  if (!homeTeam || !awayTeam) {
    throw new Error("Teams not found");
  }

  // Calculate team records
  const homeTeamRecord = await calculateTeamRecord(homeTeam);
  const awayTeamRecord = await calculateTeamRecord(awayTeam);

  // Update team records
  homeTeam.wins = homeTeamRecord.wins;
  homeTeam.losses = homeTeamRecord.losses;
  homeTeam.pointDifference = homeTeamRecord.pointDifference;

  awayTeam.wins = awayTeamRecord.wins;
  awayTeam.losses = awayTeamRecord.losses;
  awayTeam.pointDifference = awayTeamRecord.pointDifference;

  // Save teams
  await Promise.all([homeTeam.save(), awayTeam.save()]);

  // Determine game winner
  const gameWinner =
    game.homeTeamScore > game.awayTeamScore
      ? homeTeam
      : game.awayTeamScore > game.homeTeamScore
      ? awayTeam
      : null;

  // Determine player of the game
  const playerOfTheGame = determinePlayerOfTheGame(game);

  // Update player of the game in game document
  if (playerOfTheGame) {
    game.playerOfTheGame = playerOfTheGame._id;
    await game.save();
  }

  return {
    gameWinner: gameWinner ? gameWinner.toObject() : null,
    playerOfTheGame: playerOfTheGame ? playerOfTheGame.toObject() : null,
    homeTeam: homeTeam.toObject(),
    awayTeam: awayTeam.toObject(),
  };
}

/**
 * Finish default game (forfeit/walkover)
 * Awards 20-0 score to winning team
 */
export async function finishDefaultGame({
  gameId,
  homeTeamId,
  awayTeamId,
  winnerTeamId,
}: {
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
  winnerTeamId: string;
}) {
  await connectDB();

  // Determine scores
  const homeWon = winnerTeamId === homeTeamId;
  const homeTeamScore = homeWon ? 20 : 0;
  const awayTeamScore = homeWon ? 0 : 20;

  // Update game
  const game = await Game.findByIdAndUpdate(
    gameId,
    {
      $set: {
        homeTeamScore,
        awayTeamScore,
        status: true,
        started: true,
      },
    },
    { new: true }
  );

  if (!game) {
    throw new Error("Game not found");
  }

  // Add empty team statistics
  const statistics = {
    points: 0,
    rebounds: 0,
    assists: 0,
    blocks: 0,
    steals: 0,
    threesMade: 0,
    twosMade: 0,
    freeThrowsMade: 0,
  };

  await updateTeamGameStats({
    gameId,
    homeTeamStats: {
      ...statistics,
      teamId: homeTeamId,
    },
    awayTeamStats: {
      ...statistics,
      teamId: awayTeamId,
    },
  });

  // Recalculate team records
  const [homeTeam, awayTeam] = await Promise.all([
    Team.findById(homeTeamId).populate({
      path: "games",
      select:
        "gameName date homeTeam awayTeam status division homeTeamScore awayTeamScore",
    }),
    Team.findById(awayTeamId).populate({
      path: "games",
      select:
        "gameName date homeTeam awayTeam status division homeTeamScore awayTeamScore",
    }),
  ]);

  if (!homeTeam || !awayTeam) {
    throw new Error("Teams not found");
  }

  const homeTeamRecord = await calculateTeamRecord(homeTeam);
  const awayTeamRecord = await calculateTeamRecord(awayTeam);

  homeTeam.wins = homeTeamRecord.wins;
  homeTeam.losses = homeTeamRecord.losses;
  homeTeam.pointDifference = homeTeamRecord.pointDifference;

  awayTeam.wins = awayTeamRecord.wins;
  awayTeam.losses = awayTeamRecord.losses;
  awayTeam.pointDifference = awayTeamRecord.pointDifference;

  await Promise.all([homeTeam.save(), awayTeam.save()]);

  return {
    game: game.toObject(),
    homeTeam: homeTeam.toObject(),
    awayTeam: awayTeam.toObject(),
  };
}

// ===== PLAYER OF THE GAME =====

/**
 * Update player of the game manually
 */
export async function updatePlayerOfTheGame({
  gameId,
  playerId,
}: {
  gameId: string;
  playerId: string;
}) {
  await connectDB();

  const game = await Game.findByIdAndUpdate(
    gameId,
    {
      $set: {
        playerOfTheGame: playerId,
      },
    },
    { new: true }
  ).populate("playerOfTheGame", "playerName jerseyNumber");

  if (!game) {
    throw new Error("Game not found");
  }

  return {
    game: game.toObject(),
  };
}

// ===== GET SCOREKEEPER DATA =====

/**
 * Get game data for scorekeeper interface
 */
export async function getScorekeeperGameData(gameId: string) {
  await connectDB();

  const game = await Game.findById(gameId)
    .populate({
      path: "homeTeam",
      select: "teamName teamNameShort seasonStatistics",
      populate: {
        path: "players",
        select: "playerName jerseyNumber allStats team teamId",
      },
    })
    .populate({
      path: "awayTeam",
      select: "teamName teamNameShort seasonStatistics",
      populate: {
        path: "players",
        select: "playerName jerseyNumber allStats team teamId",
      },
    })
    .populate("playerOfTheGame", "playerName jerseyNumber")
    .lean();

  if (!game) {
    throw new Error("Game not found");
  }

  // Combine all players with teamId
  const homeTeamPlayers = (game.homeTeam as any).players.map((player: any) => ({
    ...player,
    teamId: (game.homeTeam as any)._id,
  }));

  const awayTeamPlayers = (game.awayTeam as any).players.map((player: any) => ({
    ...player,
    teamId: (game.awayTeam as any)._id,
  }));

  const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];

  return {
    currentGame: game,
    allPlayers,
  };
}

/**
 * Get scorekeeper overview with games from active/register divisions
 */
export async function getScorekeeperOverview({
  locationId,
  divisionId,
  date,
}: {
  locationId?: string;
  divisionId?: string;
  date?: string;
} = {}) {
  await connectDB();

  // Get active or registration divisions
  const divisionFilter: any = {
    $or: [{ active: true }, { register: true }],
  };

  if (divisionId) {
    divisionFilter._id = divisionId;
  }

  const Division = (await import("@/models/Division")).default;
  const divisions = await Division.find(divisionFilter)
    .populate("location", "name address")
    .populate("city", "cityName")
    .select("divisionName day startTime endTime location city")
    .lean();

  if (divisions.length === 0) {
    return {
      divisions: [],
      games: [],
    };
  }

  // Get division IDs
  const divisionIds = divisions.map((d: any) => d._id);

  // Build game filter
  const gameFilter: any = {
    division: { $in: divisionIds },
  };

  // Filter by location if provided
  if (locationId) {
    const divisionsInLocation = divisions
      .filter((d: any) => d.location?._id.toString() === locationId)
      .map((d: any) => d._id);
    gameFilter.division = { $in: divisionsInLocation };
  }

  // Filter by date if provided
  if (date) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    gameFilter.date = { $gte: startOfDay, $lte: endOfDay };
  } else {
    // Default: show today's and future games
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    gameFilter.date = { $gte: today };
  }

  // Get games
  const games = await Game.find(gameFilter)
    .populate("homeTeam", "teamName teamNameShort")
    .populate("awayTeam", "teamName teamNameShort")
    .populate("division", "divisionName day location")
    .sort({ date: 1, time: 1 })
    .limit(50) // Reasonable limit
    .lean();

  // Group games by division
  const gamesByDivision = games.reduce((acc: any, game: any) => {
    const divId = game.division._id.toString();
    if (!acc[divId]) {
      acc[divId] = [];
    }
    acc[divId].push(game);
    return acc;
  }, {});

  // Combine data
  const divisionsWithGames = divisions.map((division: any) => ({
    ...division,
    games: gamesByDivision[division._id.toString()] || [],
  }));

  return {
    divisions: divisionsWithGames,
    stats: {
      totalDivisions: divisions.length,
      totalGames: games.length,
      upcomingGames: games.filter((g: any) => !g.status).length,
      completedGames: games.filter((g: any) => g.status).length,
    },
  };
}
