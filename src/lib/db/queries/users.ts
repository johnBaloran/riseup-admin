// src/lib/db/queries/users.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * User data access functions ONLY
 */

import { connectDB } from "../mongodb";
import User from "@/models/User";
import Player from "@/models/Player";
import Division from "@/models/Division";
import City from "@/models/City";

/**
 * Get users who have played at least once in a city
 */
export async function getUsersByCity(
  cityId?: string,
  activeFilter: "active" | "inactive" | "all" = "all"
) {
  await connectDB();

  // Build aggregation pipeline to find users with players in divisions in the specified city
  const matchStage: any = {};
  if (cityId) {
    matchStage.city = cityId;
  }

  // Add active/inactive filter
  if (activeFilter === "active") {
    matchStage.$or = [{ active: true }, { register: true }];
  } else if (activeFilter === "inactive") {
    matchStage.active = false;
    matchStage.register = false;
  }

  // Get all divisions in the city (or all cities if no filter)
  const divisions = await Division.find(matchStage).select("_id");
  const divisionIds = divisions.map((d) => d._id);

  // Find all players in these divisions
  const players = await Player.find({
    division: { $in: divisionIds },
    user: { $exists: true, $ne: null },
  })
    .populate("user", "name email")
    .populate({
      path: "division",
      select: "divisionName city",
      populate: {
        path: "city",
        select: "cityName",
      },
    })
    .lean();

  // Group by user to get unique users with their cities
  const userMap = new Map();

  for (const player of players) {
    if (!player.user) continue;

    const userId = (player.user as any)._id.toString();
    const cityName = (player.division as any)?.city?.cityName;
    const cityId = (player.division as any)?.city?._id;

    if (!userMap.has(userId)) {
      userMap.set(userId, {
        _id: userId,
        name: (player.user as any).name,
        email: (player.user as any).email,
        cities: new Set(),
        cityIds: new Set(),
      });
    }

    if (cityName && cityId) {
      userMap.get(userId).cities.add(cityName);
      userMap.get(userId).cityIds.add(cityId.toString());
    }
  }

  // Convert to array and format cities
  const users = Array.from(userMap.values()).map((user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    cities: Array.from(user.cities).sort(),
    cityIds: Array.from(user.cityIds),
  }));

  return users;
}
