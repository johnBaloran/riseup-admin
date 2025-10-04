// src/app/api/v1/[cityId]/locations/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Locations API endpoint ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { getLocationsByCity } from "@/lib/db/queries/locations";

/**
 * GET /api/v1/[cityId]/locations
 * Fetch locations for a specific city
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch locations
    const locations = await getLocationsByCity(params.cityId);

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
