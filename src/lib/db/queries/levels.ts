// src/lib/db/queries/levels.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Level data access functions ONLY
 */

import { connectDB } from "../mongodb";
import Level from "@/models/Level";

/**
 * Get all levels (sorted by grade ascending - 1 is highest)
 */
export async function getAllLevels(activeFilter?: string | null, activeOnly?: boolean) {
  await connectDB();

  const filter: any = {};

  if (activeOnly) {
    // For division forms - only show active levels
    filter.active = true;
  } else if (activeFilter === "active") {
    filter.active = true;
  } else if (activeFilter === "inactive") {
    filter.active = false;
  }
  // If activeFilter is null/undefined, show all

  return Level.find(filter).sort({ grade: 1 }).lean();
}

/**
 * Get level by ID
 */
export async function getLevelById(id: string) {
  await connectDB();
  return Level.findById(id).lean();
}

/**
 * Create new level
 */
export async function createLevel(data: { name: string; grade: number; active?: boolean }) {
  await connectDB();

  const level = await Level.create(data);

  return level.toObject();
}

/**
 * Update level
 */
export async function updateLevel(
  id: string,
  data: {
    name?: string;
    grade?: number;
    active?: boolean;
  }
) {
  await connectDB();
  return Level.findByIdAndUpdate(id, data, { new: true }).lean();
}

/**
 * Check if level name exists
 */
export async function levelNameExists(
  name: string,
  excludeId?: string
): Promise<boolean> {
  await connectDB();

  const query: any = { name };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const count = await Level.countDocuments(query);
  return count > 0;
}

/**
 * Check if grade exists
 */
export async function gradeExists(
  grade: number,
  excludeId?: string
): Promise<boolean> {
  await connectDB();

  const query: any = { grade };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const count = await Level.countDocuments(query);
  return count > 0;
}
