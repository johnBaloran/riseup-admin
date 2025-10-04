// src/app/api/v1/league/locations/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Locations API endpoint ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  locationHasActiveDivisions,
} from "@/lib/db/queries/locations";
import {
  createLocationSchema,
  updateLocationSchema,
} from "@/lib/validations/location";
import { z } from "zod";

/**
 * GET /api/v1/league/locations
 * Get all locations (EXECUTIVE only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_locations")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("cityId");

    let locations;
    if (cityId) {
      const { getLocationsByCity } = await import("@/lib/db/queries/locations");
      locations = await getLocationsByCity(cityId);
    } else {
      locations = await getAllLocations();
    }

    return NextResponse.json(
      { success: true, data: locations },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/league/locations
 * Create location (EXECUTIVE only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_locations")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createLocationSchema.parse(body);

    const location = await createLocation(validatedData);

    return NextResponse.json(
      { success: true, data: location },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating location:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create location" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/league/locations
 * Update location (EXECUTIVE only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_locations")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateLocationSchema.parse(body);

    const { id, ...updateData } = validatedData;

    const location = await updateLocation(id, updateData);

    if (!location) {
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: location },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating location:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update location" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/league/locations
 * Delete location (EXECUTIVE only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_locations")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Location ID is required" },
        { status: 400 }
      );
    }

    // Check if location has active divisions
    const hasActiveDivisions = await locationHasActiveDivisions(id);
    if (hasActiveDivisions) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete location with active divisions",
        },
        { status: 400 }
      );
    }

    await deleteLocation(id);

    return NextResponse.json(
      { success: true, message: "Location deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting location:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete location" },
      { status: 500 }
    );
  }
}
