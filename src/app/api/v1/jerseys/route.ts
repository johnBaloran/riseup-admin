// src/app/api/v1/jerseys/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Handle jersey overview requests ONLY
 */

/**
 * Security - Permission-based access control
 * Only commissioners and executives can manage jerseys
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import {
  hasPermission,
  getAccessibleLocationIds,
} from "@/lib/auth/permissions";
import {
  getDivisionsByLocation,
  getTeamsWithJerseyDetails,
  getJerseyStats,
} from "@/lib/db/queries/jerseys";
import { getAllLocations } from "@/lib/db/queries/locations";

/**
 * GET /api/v1/jerseys
 * Get jersey management overview data
 * Query params:
 *  - locationId: Filter by location (optional)
 *  - divisionId: Get teams for specific division (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    if (!hasPermission(session, "manage_jerseys")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");
    const divisionId = searchParams.get("divisionId");

    // Get locations user has access to
    const allLocations = await getAllLocations();
    const accessibleLocationIds = getAccessibleLocationIds(
      session,
      allLocations.map((loc) => loc._id.toString())
    );

    // Filter by specific location if requested
    let filterLocationIds = accessibleLocationIds;
    if (locationId && locationId !== "all") {
      if (!accessibleLocationIds.includes(locationId)) {
        return NextResponse.json(
          { error: "Access denied to this location" },
          { status: 403 }
        );
      }
      filterLocationIds = [locationId];
    }

    // If requesting teams for a specific division
    if (divisionId) {
      const teams = await getTeamsWithJerseyDetails(divisionId);
      return NextResponse.json({ teams });
    }

    // Get overview data
    const [divisions, stats, locations] = await Promise.all([
      getDivisionsByLocation(filterLocationIds),
      getJerseyStats(filterLocationIds),
      Promise.resolve(
        allLocations.filter((loc) =>
          filterLocationIds.includes(loc._id.toString())
        )
      ),
    ]);

    return NextResponse.json({
      divisions,
      stats,
      locations,
    });
  } catch (error: any) {
    console.error("GET /api/v1/jerseys error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch jersey data" },
      { status: 500 }
    );
  }
}
