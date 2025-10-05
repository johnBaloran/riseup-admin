// src/lib/db/queries/teams.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team data access functions ONLY
 */

import { connectDB } from "../mongodb";
import Team from "@/models/Team";
import Division from "@/models/Division";
import Player from "@/models/Player";

/**
 * Get teams with pagination and filters
 */
export async function getTeams({
  cityId,
  page = 1,
  limit = 12,
  paymentFilter = "all",
  divisionId,
  locationId,
  search,
  viewMode = "card",
}: {
  cityId: string;
  page?: number;
  limit?: number;
  paymentFilter?: "all" | "paid" | "unpaid";
  divisionId?: string;
  locationId?: string;
  search?: string;
  viewMode?: "card" | "list";
}) {
  await connectDB();

  const skip = (page - 1) * limit;

  // Build filter
  const filter: any = {};

  // Filter by city through division
  if (cityId) {
    const divisions = await Division.find({ city: cityId }).select("_id");
    filter.division = { $in: divisions.map((d) => d._id) };
  }

  if (divisionId) filter.division = divisionId;
  if (search) {
    filter.$or = [
      { teamName: { $regex: search, $options: "i" } },
      { teamCode: { $regex: search, $options: "i" } },
    ];
  }

  // Get teams with populated data
  const teamsQuery = Team.find(filter)
    .populate({
      path: "division",
      populate: [
        { path: "location", select: "name" },
        { path: "city", select: "cityName region" },
      ],
    })
    .populate("teamCaptain", "playerName")
    .populate("players", "playerName jerseyNumber")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const [teams, total] = await Promise.all([
    teamsQuery,
    Team.countDocuments(filter),
  ]);

  // Calculate payment status for each team
  const teamsWithPaymentStatus = await Promise.all(
    teams.map(async (team: any) => {
      const paymentStatus = await calculateTeamPaymentStatus(
        team._id.toString()
      );
      return { ...team, paymentStatus };
    })
  );

  // Filter by payment status if needed
  let filteredTeams = teamsWithPaymentStatus;
  if (paymentFilter === "paid") {
    filteredTeams = teamsWithPaymentStatus.filter(
      (t) => t.paymentStatus === "paid"
    );
  } else if (paymentFilter === "unpaid") {
    filteredTeams = teamsWithPaymentStatus.filter(
      (t) => t.paymentStatus === "unpaid"
    );
  }

  return {
    teams: filteredTeams,
    pagination: {
      total: filteredTeams.length,
      page,
      limit,
      totalPages: Math.ceil(filteredTeams.length / limit),
    },
  };
}

/**
 * Calculate team payment status
 */
async function calculateTeamPaymentStatus(
  teamId: string
): Promise<"paid" | "unpaid" | "no-players"> {
  await connectDB();

  const PaymentMethod = (await import("@/models/PaymentMethod")).default;

  const team = await Team.findById(teamId).populate("players").lean();

  if (!team || team.players.length === 0) return "no-players";

  // Check if all players have completed payment
  const playerIds = team.players.map((p: any) => p._id);

  const paidCount = await PaymentMethod.countDocuments({
    player: { $in: playerIds },
    status: "COMPLETED",
  });

  return paidCount === team.players.length ? "paid" : "unpaid";
}

/**
 * Get team by ID
 */
export async function getTeamById(id: string) {
  await connectDB();
  return Team.findById(id)
    .populate({
      path: "division",
      populate: [
        { path: "location", select: "name" },
        { path: "city", select: "cityName region" },
        { path: "level", select: "name grade" },
      ],
    })
    .populate("teamCaptain", "playerName jerseyNumber")
    .populate("players", "playerName jerseyNumber")
    .populate("games")
    .lean();
}

/**
 * Create new team
 */
export async function createTeam(data: {
  teamName: string;
  teamNameShort: string;
  teamCode: string;
  division: string;
}) {
  await connectDB();

  const team = await Team.create({
    ...data,
    teamCode: data.teamCode.toUpperCase(),
    createdManually: true,
    wins: 0,
    losses: 0,
    pointDifference: 0,
    players: [],
    games: [],
  });

  return team.toObject();
}

/**
 * Update team
 */
export async function updateTeam(
  id: string,
  data: {
    teamName?: string;
    teamNameShort?: string;
    teamCode?: string;
    division?: string;
    teamCaptain?: string | null;
    primaryColor?: string;
    secondaryColor?: string;
    tertiaryColor?: string;
    jerseyEdition?: string;
    isCustomJersey?: boolean;
  }
) {
  await connectDB();

  const updateData: any = { ...data };
  if (data.teamCode) {
    updateData.teamCode = data.teamCode.toUpperCase();
  }

  return Team.findByIdAndUpdate(id, updateData, { new: true }).lean();
}

/**
 * Delete team
 */
export async function deleteTeam(id: string) {
  await connectDB();

  const team = await Team.findById(id);

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.players.length > 0) {
    throw new Error(
      "Cannot delete team with players. Remove all players first."
    );
  }

  if (team.games.length > 0) {
    throw new Error("Cannot delete team with game history.");
  }

  await Team.findByIdAndDelete(id);
}

/**
 * Check if team code exists in division
 */
export async function teamCodeExistsInDivision(
  teamCode: string,
  divisionId: string,
  excludeTeamId?: string
): Promise<boolean> {
  await connectDB();

  const query: any = {
    teamCode: teamCode.toUpperCase(),
    division: divisionId,
  };

  if (excludeTeamId) {
    query._id = { $ne: excludeTeamId };
  }

  const count = await Team.countDocuments(query);
  return count > 0;
}

/**
 * Get team stats
 */
export async function getTeamStats(teamId: string) {
  await connectDB();

  const team = await Team.findById(teamId).lean();

  if (!team) return null;

  return {
    wins: team.wins,
    losses: team.losses,
    pointDifference: team.pointDifference,
    record: `${team.wins}-${team.losses}`,
  };
}
