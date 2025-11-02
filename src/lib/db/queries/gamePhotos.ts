// src/lib/db/queries/gamePhotos.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Game photo data access functions ONLY
 */

import { connectDB } from "../mongodb";
import GamePhoto from "@/models/GamePhoto";
import Person from "@/models/Person";
import Game from "@/models/Game";
import Division from "@/models/Division";

/**
 * Get all photos for a given personId
 */
export async function getPhotosByPersonId(personId: string) {
  await connectDB();

  if (!personId) {
    return [];
  }

  const photos = await GamePhoto.find({
    "detectedFaces.personId": personId,
  })
    .sort({ uploadedAt: -1 })
    .lean();

  return photos;
}

/**
 * Get all photos for a given playerId
 * Queries all persons linked to the player, then fetches all photos containing those persons
 */
export async function getPhotosByPlayerId(playerId: string) {
  await connectDB();

  if (!playerId) {
    return [];
  }

  // Step 1: Get all persons linked to this player
  const persons = await Person.find({ playerId }).lean();

  if (persons.length === 0) {
    return [];
  }

  // Step 2: Get all personIds
  const personIds = persons.map((p) => p._id.toString());

  // Step 3: Query all photos where any detectedFace has one of these personIds
  const photos = await GamePhoto.find({
    "detectedFaces.personId": { $in: personIds },
  })
    .populate("game", "gameName date homeTeam awayTeam")
    .sort({ uploadedAt: -1 })
    .lean();

  // Step 4: Deduplicate photos (a photo might have multiple faces of the same player)
  const uniquePhotos = Array.from(
    new Map(photos.map((photo) => [photo._id.toString(), photo])).values()
  );

  return uniquePhotos;
}

/**
 * Get games with photo status and filters - PAGINATED
 * Used for photos management page
 * Returns games grouped by division with pagination
 */
export async function getGamesWithPhotoStatus({
  cityId,
  locationId,
  photoStatus,
  day,
  levelId,
  divisionStatus = "active",
  search,
  page = 1,
  limit = 10,
}: {
  cityId?: string;
  locationId?: string;
  photoStatus?: "hasPhotos" | "needsPhotos" | "all";
  day?: string;
  levelId?: string;
  divisionStatus?: "all" | "active" | "inactive";
  search?: string;
  page?: number;
  limit?: number;
}) {
  await connectDB();

  // Build division filter
  const divisionFilter: any = {};
  if (cityId) divisionFilter.city = cityId;
  if (locationId) divisionFilter.location = locationId;
  if (day) divisionFilter.day = day;
  if (levelId) divisionFilter.level = levelId;

  // Filter by division status
  if (divisionStatus === "active") {
    divisionFilter.active = true;
  } else if (divisionStatus === "inactive") {
    divisionFilter.active = false;
  }
  // If "all", don't add active filter

  // Get divisions matching the filter
  const divisions = await Division.find(divisionFilter)
    .populate("city", "cityName")
    .populate("location", "name")
    .populate("level", "name grade")
    .lean();

  // Filter out divisions with incomplete data to ensure consistent shape
  const validDivisions = divisions.filter((division: any) => {
    return (
      division.divisionName &&
      division.day &&
      division.city &&
      division.location &&
      division.level
    );
  });

  if (validDivisions.length === 0) {
    return {
      games: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalGames: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  const divisionIds = validDivisions.map((d) => d._id);

  // Build game filter
  const gameFilter: any = {
    division: { $in: divisionIds },
    status: true, // Only completed games
  };

  // Add search filter for game names
  if (search) {
    gameFilter.gameName = { $regex: search, $options: "i" }; // Case-insensitive search
  }

  // Get total count for pagination
  const totalGames = await Game.countDocuments(gameFilter);

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalGames / limit);

  // Get paginated games - sort by most recent first
  const games = await Game.find(gameFilter)
    .populate("homeTeam", "teamName teamCode")
    .populate("awayTeam", "teamName teamCode")
    .populate("division", "divisionName")
    .sort({ date: -1 }) // Most recent games first
    .skip(skip)
    .limit(limit)
    .lean();

  // For each game, get photo count efficiently
  const gameIds = games.map((g: any) => g._id);
  const photoCounts = await GamePhoto.aggregate([
    { $match: { game: { $in: gameIds } } },
    { $group: { _id: "$game", count: { $sum: 1 } } },
  ]);

  const photoCountMap = new Map(
    photoCounts.map((pc) => [pc._id.toString(), pc.count])
  );

  const gamesWithPhotoCount = games.map((game: any) => ({
    ...game,
    gamePhotosCount: photoCountMap.get(game._id.toString()) || 0,
  }));

  // Filter by photo status if specified
  let filteredGames = gamesWithPhotoCount;
  if (photoStatus === "hasPhotos") {
    filteredGames = gamesWithPhotoCount.filter(
      (game) => game.gamePhotosCount > 0
    );
  } else if (photoStatus === "needsPhotos") {
    filteredGames = gamesWithPhotoCount.filter(
      (game) => game.gamePhotosCount === 0
    );
  }

  // Group games by division
  const divisionGroups = validDivisions.map((division) => {
    const divisionGames = filteredGames.filter(
      (game: any) => game.division._id.toString() === division._id.toString()
    );

    return {
      division,
      games: divisionGames,
    };
  });

  // Filter out divisions with no games
  const groupsWithGames = divisionGroups.filter(
    (group) => group.games.length > 0
  );

  return {
    games: groupsWithGames,
    pagination: {
      currentPage: page,
      totalPages,
      totalGames,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Get all photos for a specific game
 */
export async function getGamePhotos(gameId: string) {
  await connectDB();

  return GamePhoto.find({ game: gameId })
    .populate("photographer", "name")
    .sort({ uploadedAt: -1 })
    .lean();
}

/**
 * Create a new game photo
 */
export async function createGamePhoto(data: {
  url: string;
  publicId: string;
  thumbnail: string;
  game: string;
  photographer?: string;
  tags?: string[];
  isHighlight?: boolean;
}) {
  await connectDB();

  const photo = await GamePhoto.create({
    ...data,
    tags: data.tags || [],
    isHighlight: data.isHighlight || false,
    detectedFaces: [],
    faceProcessingStatus: "pending",
  });

  // Increment game photo count
  await Game.findByIdAndUpdate(data.game, {
    $inc: { gamePhotosCount: 1 },
  });

  return photo.toObject();
}

/**
 * Update a game photo
 */
export async function updateGamePhoto(
  photoId: string,
  data: {
    tags?: string[];
    isHighlight?: boolean;
    photographer?: string;
  }
) {
  await connectDB();

  return GamePhoto.findByIdAndUpdate(photoId, data, { new: true }).lean();
}

/**
 * Delete a game photo
 */
export async function deleteGamePhoto(photoId: string) {
  await connectDB();

  const photo = await GamePhoto.findById(photoId);

  if (!photo) {
    throw new Error("Photo not found");
  }

  // Decrement game photo count
  await Game.findByIdAndUpdate(photo.game, {
    $inc: { gamePhotosCount: -1 },
  });

  await GamePhoto.findByIdAndDelete(photoId);

  return { deleted: true };
}
