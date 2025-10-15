// src/app/api/v1/scorekeeper/overview/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Scorekeeper overview data ONLY
 *
 * RESTful Design
 * GET /api/v1/scorekeeper/overview - Get all games from active/register divisions
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getScorekeeperOverview } from "@/lib/db/queries/scorekeeper";

/**
 * GET /api/v1/scorekeeper/overview
 * Get scorekeeper overview with games from active/register divisions
 * Query params:
 * - locationId: Filter by location
 * - divisionId: Filter by specific division
 * - date: Filter by date (YYYY-MM-DD)
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId") || undefined;
    const divisionId = searchParams.get("divisionId") || undefined;
    const date = searchParams.get("date") || undefined;

    // Fetch overview data
    const data = await getScorekeeperOverview({
      locationId,
      divisionId,
      date,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching scorekeeper overview:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch scorekeeper overview" },
      { status: 500 }
    );
  }
}
