// src/lib/db/queries/dashboard.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Dashboard statistics queries ONLY
 */

import { connectDB } from "../mongodb";
import Division from "@/models/Division";
import Team from "@/models/Team";
import Player from "@/models/Player";
import Game from "@/models/Game";

export async function getDashboardStats(locationIds: string[]) {
  await connectDB();

  const filter =
    locationIds.length > 0
      ? { location: { $in: locationIds } }
      : {};

  const [divisions, teams, players, games] = await Promise.all([
    Division.countDocuments({ ...filter, active: true }),
    Team.countDocuments(filter),
    Player.countDocuments({ division: { $exists: true } }),
    Game.countDocuments(filter),
  ]);

  return {
    divisions,
    teams,
    players,
    games,
  };
}

export async function getUpcomingGames(locationIds: string[]) {
  await connectDB();

  const filter =
    locationIds.length > 0
      ? { location: { $in: locationIds } }
      : {};

  return Game.find({
    ...filter,
    date: { $gte: new Date() },
    status: false,
  })
    .populate("homeTeam", "teamName")
    .populate("awayTeam", "teamName")
    .sort({ date: 1 })
    .limit(5)
    .lean();
}
