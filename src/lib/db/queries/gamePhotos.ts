// src/lib/db/queries/gamePhotos.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Game photo data access functions ONLY
 */

import { connectDB } from "../mongodb";
import GamePhoto from "@/models/GamePhoto";
import Game from "@/models/Game";
import Admin from "@/models/Admin";
import Division from "@/models/Division";
import City from "@/models/City";

/**
 * Get games with photo status organized by city
 */
export async function getGamesWithPhotoStatus({
  cityId,
  locationId,
  photoStatus,
  day,
  levelId,
}: {
  cityId?: string;
  locationId?: string;
  photoStatus?: "hasPhotos" | "needsPhotos" | "all";
  day?: string;
  levelId?: string;
}) {
  await connectDB();

  // Build division filter
  const divisionFilter: any = {
    active: true, // Only active divisions
  };

  if (cityId) divisionFilter.city = cityId;
  if (locationId) divisionFilter.location = locationId;
  if (day) divisionFilter.day = day;
  if (levelId) divisionFilter.level = levelId;

  // Get divisions
  const divisions = await Division.find(divisionFilter)
    .populate("city", "cityName")
    .populate("location", "name address")
    .populate("level", "name grade")
    .select("divisionName city location level day games")
    .lean();

  const divisionIds = divisions.map((d) => d._id);

  // Get all games for these divisions with photo counts
  const games = await Game.find({
    division: { $in: divisionIds },
    status: true, // Only completed games
  })
    .populate("homeTeam", "teamName teamCode")
    .populate("awayTeam", "teamName teamCode")
    .populate("division", "divisionName day")
    .sort({ date: -1 })
    .lean();

  // Filter by photo status if specified
  let filteredGames = games;
  if (photoStatus === "hasPhotos") {
    filteredGames = games.filter((game) => (game.gamePhotosCount || 0) > 0);
  } else if (photoStatus === "needsPhotos") {
    filteredGames = games.filter((game) => (game.gamePhotosCount || 0) === 0);
  }

  // Get photographers for each game
  const gamesWithPhotographers = await Promise.all(
    filteredGames.map(async (game: any) => {
      // Get unique photographers for this game
      const photos = await GamePhoto.find({ game: game._id })
        .select("photographer")
        .lean();

      const photographerIds = Array.from(
        new Set(photos.map((p: any) => p.photographer?.toString()).filter(Boolean))
      );

      const photographers = await Admin.find({ _id: { $in: photographerIds } })
        .select("name")
        .lean();

      return {
        ...game,
        photographers,
      };
    })
  );

  // Organize games by division
  const gamesByDivision = divisions.map((division) => ({
    division: {
      _id: division._id,
      divisionName: division.divisionName,
      day: division.day,
      city: division.city,
      location: division.location,
      level: division.level,
    },
    games: gamesWithPhotographers.filter(
      (game) => game.division._id.toString() === division._id.toString()
    ),
  }));

  // Filter out divisions with no games
  return gamesByDivision.filter((group) => group.games.length > 0);
}

/**
 * Get all photos for a specific game
 */
export async function getGamePhotos(gameId: string) {
  await connectDB();

  // Get photos without populate first
  const photos = await GamePhoto.find({ game: gameId })
    .sort({ uploadedAt: -1 })
    .lean();

  // Manually populate photographer data
  const photosWithPhotographer = await Promise.all(
    photos.map(async (photo: any) => {
      if (photo.photographer) {
        const admin = await Admin.findById(photo.photographer).select("name email").lean();
        return {
          ...photo,
          photographer: admin,
        };
      }
      return photo;
    })
  );

  return photosWithPhotographer;
}

/**
 * Create a new game photo
 */
export async function createGamePhoto(data: {
  publicId: string;
  url: string;
  thumbnail: string;
  game: string;
  photographer?: string;
  tags?: string[];
  isHighlight?: boolean;
}) {
  await connectDB();

  // Check if photo already exists
  const existing = await GamePhoto.findOne({ publicId: data.publicId });
  if (existing) {
    throw new Error("Photo already exists");
  }

  const photo = await GamePhoto.create({
    ...data,
    uploadedAt: new Date(),
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
  id: string,
  data: {
    tags?: string[];
    isHighlight?: boolean;
  }
) {
  await connectDB();

  return GamePhoto.findByIdAndUpdate(id, data, { new: true }).lean();
}

/**
 * Delete a game photo
 */
export async function deleteGamePhoto(id: string) {
  await connectDB();

  const photo = await GamePhoto.findById(id);

  if (!photo) {
    throw new Error("Photo not found");
  }

  // Decrement game photo count
  await Game.findByIdAndUpdate(photo.game, {
    $inc: { gamePhotosCount: -1 },
  });

  await GamePhoto.findByIdAndDelete(id);

  return { deleted: true };
}
