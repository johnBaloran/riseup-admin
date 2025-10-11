// src/lib/db/queries/jerseys.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Jersey management data access functions ONLY
 */

import { connectDB } from "../mongodb";
import Team from "@/models/Team";
import Division from "@/models/Division";
import Player from "@/models/Player";
import Location from "@/models/Location";

/**
 * Get jersey overview data for dashboard
 * Filtered by location(s) accessible to the user
 */
export async function getJerseyOverview(locationIds: string[]) {
  await connectDB();

  const filter =
    locationIds.length > 0 ? { location: { $in: locationIds } } : {};

  // Get all divisions with their teams
  const divisions = await Division.find(filter)
    .populate("location", "name")
    .populate("level", "name")
    .populate({
      path: "teams",
      populate: {
        path: "players",
        select: "jerseyNumber jerseySize paymentStatus user",
      },
    })
    .sort({ day: 1, divisionName: 1 })
    .lean();

  return divisions;
}

/**
 * Get divisions grouped by location for jersey management
 */
export async function getDivisionsByLocation(locationIds: string[]) {
  await connectDB();

  const filter =
    locationIds.length > 0 ? { location: { $in: locationIds } } : {};

  const divisions = await Division.find(filter)
    .populate("location", "name city")
    .populate("level", "name grade")
    .select("divisionName location day level jerseyDeadline teams")
    .sort({ location: 1, day: 1 })
    .lean();

  // Get team counts
  const divisionIds = divisions.map((d) => d._id);
  const teamCounts = await Team.aggregate([
    { $match: { division: { $in: divisionIds } } },
    { $group: { _id: "$division", count: { $sum: 1 } } },
  ]);

  const teamCountMap = new Map(
    teamCounts.map((tc) => [tc._id.toString(), tc.count])
  );

  return divisions.map((div) => ({
    ...div,
    teamCount: teamCountMap.get(div._id.toString()) || 0,
  }));
}

/**
 * Get teams with jersey details for a division
 */
export async function getTeamsWithJerseyDetails(divisionId: string) {
  await connectDB();

  const teams = await Team.find({ division: divisionId })
    .populate({
      path: "players",
      select:
        "playerName jerseyNumber jerseySize jerseyName user paymentStatus",
    })
    .select(
      "teamName primaryColor secondaryColor tertiaryColor isCustomJersey jerseyEdition jerseyImages players genericJerseys"
    )
    .lean();

  return teams;
}

/**
 * Get single team with full jersey details
 */
export async function getTeamJerseyDetails(teamId: string) {
  await connectDB();

  const team = await Team.findById(teamId)
    .populate({
      path: "division",
      select: "divisionName day jerseyDeadline",
      populate: [
        { path: "location", select: "name" },
        { path: "level", select: "name" },
      ],
    })
    .populate({
      path: "players",
      select:
        "playerName jerseyNumber jerseySize jerseyName user paymentStatus",
    })
    .lean();

  return team;
}

/**
 * Update team jersey design (edition)
 */
export async function updateTeamJerseyEdition(
  teamId: string,
  data: {
    jerseyEdition: string;
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
  }
) {
  await connectDB();

  return Team.findByIdAndUpdate(
    teamId,
    {
      isCustomJersey: false,
      jerseyImages: [],
      jerseyEdition: data.jerseyEdition,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      tertiaryColor: data.tertiaryColor,
    },
    { new: true }
  ).lean();
}

/**
 * Update team jersey design (custom image)
 */
export async function updateTeamJerseyCustom(
  teamId: string,
  imageData: {
    id: string;
    url: string;
    publicId: string;
  }
) {
  await connectDB();

  return Team.findByIdAndUpdate(
    teamId,
    {
      isCustomJersey: true,
      jerseyEdition: null,
      primaryColor: null,
      secondaryColor: null,
      tertiaryColor: null,
      jerseyImages: [imageData],
    },
    { new: true }
  ).lean();
}

/**
 * Remove team jersey design
 */
export async function removeTeamJerseyDesign(teamId: string) {
  await connectDB();

  return Team.findByIdAndUpdate(
    teamId,
    {
      isCustomJersey: false,
      jerseyEdition: null,
      primaryColor: null,
      secondaryColor: null,
      tertiaryColor: null,
      jerseyImages: [],
    },
    { new: true }
  ).lean();
}

/**
 * Update player jersey details
 */
export async function updatePlayerJerseyDetails(
  playerId: string,
  data: {
    jerseyNumber?: number | null;
    jerseySize?: string | null;
    jerseyName?: string | null;
  }
) {
  await connectDB();

  return Player.findByIdAndUpdate(playerId, data, { new: true }).lean();
}

/**
 * Add generic jersey to team
 */
export async function addGenericJersey(
  teamId: string,
  jerseyData: {
    jerseyNumber?: number;
    jerseySize?: string;
    jerseyName?: string;
  }
) {
  await connectDB();

  return Team.findByIdAndUpdate(
    teamId,
    {
      $push: { genericJerseys: jerseyData },
    },
    { new: true }
  ).lean();
}

/**
 * Update generic jersey
 */
export async function updateGenericJersey(
  teamId: string,
  genericIndex: number,
  jerseyData: {
    jerseyNumber?: number;
    jerseySize?: string;
    jerseyName?: string;
  }
) {
  await connectDB();

  const updateKey = (
    Object.keys(jerseyData) as Array<keyof typeof jerseyData>
  ).reduce((acc, key) => {
    acc[`genericJerseys.${genericIndex}.${key}`] = jerseyData[key];
    return acc;
  }, {} as any);

  return Team.findByIdAndUpdate(
    teamId,
    { $set: updateKey },
    { new: true }
  ).lean();
}

/**
 * Remove generic jersey from team
 */
export async function removeGenericJersey(
  teamId: string,
  genericIndex: number
) {
  await connectDB();

  const team = await Team.findById(teamId);
  if (!team) throw new Error("Team not found");

  team.genericJerseys.splice(genericIndex, 1);
  await team.save();

  return team.toObject();
}

/**
 * Get jersey statistics for dashboard
 */
export async function getJerseyStats(locationIds: string[]) {
  await connectDB();

  const filter =
    locationIds.length > 0 ? { location: { $in: locationIds } } : {};

  const divisions = await Division.find(filter).select("_id").lean();
  const divisionIds = divisions.map((d) => d._id);

  if (!divisionIds.length) {
    return {
      totalTeams: 0,
      teamsWithDesign: 0,
      teamsWithoutDesign: 0,
      completeTeams: 0,
    };
  }

  const teams = await Team.find({ division: { $in: divisionIds } })
    .populate("players", "jerseyNumber jerseySize")
    .lean();

  const totalTeams = teams.length;

  const teamsWithDesign = teams.filter(
    (t) => t.isCustomJersey || t.jerseyEdition
  ).length;

  const teamsWithoutDesign = teams.filter(
    (t) => !t.isCustomJersey && !t.jerseyEdition
  ).length;

  const completeTeams = teams.filter((t) => {
    const hasDesign = t.isCustomJersey || t.jerseyEdition;
    const allPlayersReady =
      t.players.length > 0 &&
      t.players.every(
        (p: any) => p.jerseyNumber != null && p.jerseySize != null
      );
    return hasDesign && allPlayersReady;
  }).length;

  return {
    totalTeams,
    teamsWithDesign,
    teamsWithoutDesign,
    completeTeams,
  };
}
