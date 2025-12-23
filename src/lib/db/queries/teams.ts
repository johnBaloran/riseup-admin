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
  page = 1,
  limit = 12,
  divisionId,
  locationId,
  search,
  viewMode = "card",
  activeFilter = "active",
  noCaptain = false,
  noPlayers = false,
}: {
  page?: number;
  limit?: number;
  divisionId?: string;
  locationId?: string;
  search?: string;
  viewMode?: "card" | "list";
  activeFilter?: "active" | "inactive" | "all" | "registration";
  noCaptain?: boolean;
  noPlayers?: boolean;
}) {
  await connectDB();

  const skip = (page - 1) * limit;

  // --- Step 1: Get valid divisions based on active filter ---
  const divisionFilter: any = {};

  // If a specific divisionId is provided, bypass active filter
  if (divisionId) {
    divisionFilter._id = divisionId;
  } else {
    // Only apply active filter when no specific division is requested
    if (activeFilter === "active") {
      divisionFilter.active = true;
    } else if (activeFilter === "inactive") {
      divisionFilter.active = false;
      divisionFilter.register = false;
    } else if (activeFilter === "registration") {
      divisionFilter.register = true;
    }
    // If "all", no active/register filter
  }

  if (locationId) divisionFilter.location = locationId;

  const validDivisions = await Division.find(divisionFilter).select("_id");
  const validDivisionIds = validDivisions.map((d) => d._id);

  if (!validDivisionIds.length) {
    // No divisions match, return empty result
    return {
      teams: [],
      pagination: { total: 0, page, limit, totalPages: 0 },
    };
  }

  // --- Step 2: Build team filter ---
  const filter: any = {
    division: { $in: validDivisionIds },
  };

  if (search) {
    filter.$or = [
      { teamName: { $regex: search, $options: "i" } },
      { teamCode: { $regex: search, $options: "i" } },
    ];
  }

  if (noCaptain) {
    filter.teamCaptain = { $in: [null] };
    filter.players = { $exists: true, $ne: [] }; // has players but no captain
  }

  if (noPlayers) {
    // Override players filter if noPlayers is set
    filter.players = { $size: 0 };
  }

  // --- Step 3: Query teams with pagination ---
  const [teams, total] = await Promise.all([
    Team.find(filter)
      .populate({
        path: "division",
        select: "divisionName startDate",
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
      .lean(),
    Team.countDocuments(filter),
  ]);

  // --- Step 4: Return result with pagination ---
  return {
    teams,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get team by ID
 */
export async function getTeamById(id: string) {
  await connectDB();
  return Team.findById(id)
    .populate({
      path: "division",
      select: "divisionName startDate",
      populate: [
        { path: "location", select: "name" },
        { path: "city", select: "cityName region" },
        { path: "level", select: "name grade" },
      ],
    })
    .populate("teamCaptain", "playerName jerseyNumber user")
    .populate("players", "playerName jerseyNumber user")
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
    teamCode: data.teamCode,
    createdManually: true,
    wins: 0,
    losses: 0,
    pointDifference: 0,
    players: [],
    games: [],
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

  // Add team to division's teams array
  await Division.findByIdAndUpdate(data.division, {
    $addToSet: { teams: team._id },
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
    updateData.teamCode = data.teamCode;
  }

  // Fetch team for division and captain change handling
  const team = await Team.findById(id);
  if (!team) {
    throw new Error("Team not found");
  }

  // If division is being changed, update division arrays and player divisions
  if (data.division) {
    const oldDivisionId = team.division.toString();
    const newDivisionId = data.division;

    // Only update if division actually changed
    if (oldDivisionId !== newDivisionId) {
      // Remove team from old division's teams array
      await Division.findByIdAndUpdate(oldDivisionId, {
        $pull: { teams: team._id },
      });

      // Add team to new division's teams array
      await Division.findByIdAndUpdate(newDivisionId, {
        $addToSet: { teams: team._id },
      });

      // Update all players in this team to the new division
      await Player.updateMany(
        { _id: { $in: team.players } },
        { $set: { division: newDivisionId } }
      );
    }
  }

  // If team captain is being changed, update player teamCaptain flags
  if (data.teamCaptain !== undefined) {
    const oldCaptainId = team.teamCaptain?.toString();
    const newCaptainId = data.teamCaptain;

    // Remove captain flag from old captain (if exists)
    if (oldCaptainId && oldCaptainId !== newCaptainId) {
      await Player.findByIdAndUpdate(oldCaptainId, {
        $set: { teamCaptain: false },
      });
    }

    // Set captain flag for new captain (if not null)
    if (newCaptainId) {
      await Player.findByIdAndUpdate(newCaptainId, {
        $set: { teamCaptain: true },
      });
    }
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

  // Remove team from division's teams array
  await Division.findByIdAndUpdate(team.division, {
    $pull: { teams: team._id },
  });

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
    teamCode: teamCode,
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

/**
 * Get teams grouped by division for player switching
 * Returns teams from divisions that are either active or have registration open
 */
export async function getTeamsForSwitching() {
  await connectDB();

  // Get divisions that are either active or have registration open
  const divisions = await Division.find({
    $or: [{ active: true }, { register: true }],
  })
    .populate("city", "cityName")
    .populate("location", "name")
    .populate("level", "name grade")
    .select(
      "divisionName city location level startDate day startTime endTime active register"
    )
    .sort({ startDate: -1 })
    .lean();

  const divisionIds = divisions.map((d: any) => d._id);

  // Get all teams from these divisions
  const teams = await Team.find({
    division: { $in: divisionIds },
  })
    .populate("division", "divisionName")
    .select("teamName teamNameShort teamCode division")
    .sort({ teamName: 1 })
    .lean();

  // Group teams by division
  const teamsByDivision = divisions.map((division: any) => ({
    division: division,
    teams: teams.filter(
      (team: any) => team.division._id.toString() === division._id.toString()
    ),
  }));

  return teamsByDivision;
}
