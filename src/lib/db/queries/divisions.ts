// src/lib/db/queries/divisions.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Division data access functions ONLY
 */

import { PopulatedDivision } from "@/types/division";
import { connectDB } from "../mongodb";
import Division from "@/models/Division";

/**
 * Get divisions with pagination and filters
 */
export async function getDivisions({
  cityId,
  page = 1,
  limit = 12,
  activeFilter = "all",
  locationId,
  levelId,
  day,
  search,
}: {
  cityId: string;
  page?: number;
  limit?: number;
  activeFilter?: "all" | "active" | "inactive" | "registration";
  locationId?: string;
  levelId?: string;
  day?: string;
  search?: string;
}) {
  await connectDB();

  const skip = (page - 1) * limit;

  // Build filter
  const filter: any = { city: cityId };

  if (activeFilter === "active") filter.active = true;
  if (activeFilter === "inactive") filter.active = false;
  if (activeFilter === "registration") filter.register = true;
  if (locationId) filter.location = locationId;
  if (levelId) filter.level = levelId;
  if (day) filter.day = day;
  if (search) filter.divisionName = { $regex: search, $options: "i" };

  // Get divisions and total count in parallel
  const [divisions, total] = await Promise.all([
    Division.find(filter)
      .populate("location")
      .populate("level")
      .sort({ startDate: -1 }) // Latest first
      .skip(skip)
      .limit(limit)
      .lean<PopulatedDivision[]>(), // force the result shape
    Division.countDocuments(filter),
  ]);

  return {
    divisions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get division by ID
 */
export async function getDivisionById(id: string) {
  await connectDB();
  return Division.findById(id)
    .populate("city", "cityName region")
    .populate("location", "name")
    .populate("level", "name grade")
    .populate("prices.earlyBird")
    .populate("prices.regular")
    .populate("prices.installment")
    .populate("prices.regularInstallment")
    .populate("prices.firstInstallment")
    .populate("prices.free")
    .lean();
}

/**
 * Create new division
 */
export async function createDivision(data: {
  divisionName: string;
  description: string;
  city: string;
  location: string;
  level: string;
  day: string;
  startDate?: string;
  startTime?: string;
  endTime?: string;
  prices: {
    earlyBird: string;
    regular: string;
    installment: string;
    regularInstallment: string;
    firstInstallment: string;
    free: string;
  };
  active: boolean;
  register: boolean;
}) {
  await connectDB();

  const division = await Division.create({
    ...data,
    startDate: data.startDate ? new Date(data.startDate) : undefined,
  });

  return division.toObject();
}

/**
 * Update division
 */
export async function updateDivision(
  id: string,
  data: {
    divisionName?: string;
    description?: string;
    location?: string;
    level?: string;
    day?: string;
    startDate?: string;
    startTime?: string;
    endTime?: string;
    active?: boolean;
    register?: boolean;
  }
) {
  await connectDB();

  const updateData: any = { ...data };
  if (data.startDate) {
    updateData.startDate = new Date(data.startDate);
  }

  return Division.findByIdAndUpdate(id, updateData, { new: true }).lean();
}

/**
 * Check for location conflicts
 */
export async function checkLocationConflict(
  locationId: string,
  day: string,
  startTime: string,
  endTime: string,
  excludeDivisionId?: string
): Promise<{ hasConflict: boolean; conflictingDivision?: any }> {
  await connectDB();

  const query: any = {
    location: locationId,
    day,
    startTime: { $exists: true },
    endTime: { $exists: true },
  };

  if (excludeDivisionId) {
    query._id = { $ne: excludeDivisionId };
  }

  const divisions = await Division.find(query)
    .select("divisionName startTime endTime")
    .lean();

  // Check for time overlap
  for (const div of divisions) {
    if (timeOverlaps(startTime, endTime, div.startTime, div.endTime)) {
      return {
        hasConflict: true,
        conflictingDivision: div,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Helper: Check if two time ranges overlap
 */
function timeOverlaps(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseTime(start1);
  const e1 = parseTime(end1);
  const s2 = parseTime(start2);
  const e2 = parseTime(end2);

  return s1 < e2 && e1 > s2;
}

/**
 * Helper: Convert time string to minutes
 */
function parseTime(time: string): number {
  const [timePart, period] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Get team count for division
 */
export async function getDivisionTeamCount(
  divisionId: string
): Promise<number> {
  await connectDB();

  const Team = (await import("@/models/Team")).default;
  return Team.countDocuments({ division: divisionId });
}
