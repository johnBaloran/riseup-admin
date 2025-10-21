// src/lib/db/queries/locations.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Location data access functions ONLY
 */

import { connectDB } from "../mongodb";
import Location from "@/models/Location";
import Division from "@/models/Division";
import { LeanLocation } from "@/types/location";

/**
 * Get all locations
 */
export async function getAllLocations() {
  await connectDB();
  return Location.find().sort({ name: 1 }).lean();
}

/**
 * Get active locations only
 */
export async function getActiveLocations() {
  await connectDB();
  return Location.find({ active: true }).sort({ name: 1 }).lean();
}

/**
 * Get locations by city
 */
export async function getLocationsByCity(cityId: string) {
  await connectDB();

  // First get city to find its locations
  const City = (await import("@/models/City")).default;
  const city = await City.findById(cityId)
    .populate("locations")
    .lean<{ locations: LeanLocation[] }>();

  if (!city) return [];

  return city.locations || [];
}

/**
 * Get location by ID
 */
export async function getLocationById(id: string) {
  await connectDB();
  return Location.findById(id).lean();
}

/**
 * Create new location
 */
export async function createLocation(data: {
  name: string;
  address: string;
  city: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
}) {
  await connectDB();

  const location = await Location.create(data);

  // Add location to city's locations array
  const City = (await import("@/models/City")).default;
  await City.findByIdAndUpdate(data.city, {
    $push: { locations: location._id },
  });

  return location.toObject();
}

/**
 * Update location
 */
export async function updateLocation(
  id: string,
  data: {
    name?: string;
    address?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  }
) {
  await connectDB();
  return Location.findByIdAndUpdate(id, data, { new: true }).lean();
}

/**
 * Delete location
 */
export async function deleteLocation(id: string) {
  await connectDB();

  // Remove from city's locations array
  const location = await Location.findById(id);
  if (location) {
    const City = (await import("@/models/City")).default;
    await City.updateMany({ locations: id }, { $pull: { locations: id } });
  }

  return Location.findByIdAndDelete(id);
}

/**
 * Check if location has active divisions
 */
export async function locationHasActiveDivisions(
  locationId: string
): Promise<boolean> {
  await connectDB();
  const count = await Division.countDocuments({
    location: locationId,
    active: true,
  });
  return count > 0;
}

/**
 * Get division count for location
 */
export async function getLocationDivisionCount(
  locationId: string
): Promise<number> {
  await connectDB();
  return Division.countDocuments({ location: locationId });
}
