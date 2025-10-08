// src/lib/db/queries/cities.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * City data access functions ONLY
 */

import { connectDB } from "../mongodb";
import City from "@/models/City";
import Location from "@/models/Location";

/**
 * Get all cities (active and inactive)
 */
export async function getAllCities() {
  await connectDB();
  return City.find().populate("locations", "name").sort({ cityName: 1 }).lean();
}

/**
 * Get only active cities
 */
export async function getActiveCities() {
  await connectDB();
  return City.find({ active: true }).sort({ cityName: 1 }).lean();
}

/**
 * Get city by ID
 */
export async function getCityById(id: string) {
  await connectDB();
  return City.findById(id).populate("locations", "name address").lean();
}

/**
 * Create new city
 */
export async function createCity(data: {
  cityName: string;
  region: string;
  country: string;
  timezone: string;
}) {
  await connectDB();

  const city = await City.create({
    ...data,
    active: true,
  });

  return city.toObject();
}

/**
 * Update city
 */
export async function updateCity(
  id: string,
  data: {
    cityName?: string;
    region?: string;
    country?: string;
    timezone?: string;
    active?: boolean;
  }
) {
  await connectDB();

  return City.findByIdAndUpdate(id, data, { new: true }).lean();
}

/**
 * Delete city (hard delete)
 */
export async function deleteCity(id: string) {
  await connectDB();
  return City.findByIdAndDelete(id);
}

/**
 * Check if city name exists
 */
export async function cityNameExists(
  cityName: string,
  region: string,
  country: string,
  excludeId?: string
) {
  await connectDB();

  const query: any = { cityName, region, country };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const count = await City.countDocuments(query);
  return count > 0;
}
