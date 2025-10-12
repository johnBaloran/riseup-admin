// src/app/api/v1/games/overview/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Schedule overview API endpoint ONLY
 *
 * RESTful Design
 * GET /api/v1/games/overview - Get scheduling overview
 *
 * Authentication
 * Protected route - requires valid session
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { getScheduleOverview } from "@/lib/db/queries/schedule";
import { scheduleOverviewQuerySchema } from "@/lib/validations/game";
import { hasPermission } from "@/lib/auth/permissions";

/**
 * GET /api/v1/games/overview
 * Get schedule overview for all divisions
 *
 * Query params:
 * - locationId (optional): Filter by location
 * - cityId (optional): Filter by city
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Permission check
    if (!hasPermission(session, "view_games")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    // Parse and validate query params
    const { searchParams } = new URL(request.url);
    const queryParams = {
      locationId: searchParams.get("locationId") || undefined,
      cityId: searchParams.get("cityId") || undefined,
    };

    const validatedParams = scheduleOverviewQuerySchema.parse(queryParams);

    // Get overview data
    const overview = await getScheduleOverview(validatedParams);

    return NextResponse.json(overview, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching schedule overview:", error);

    // Validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: error.message || "Failed to fetch schedule overview" },
      { status: 500 }
    );
  }
}
