// src/app/api/v1/games/divisions/[divisionId]/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Division schedule API endpoint ONLY
 *
 * RESTful Design
 * GET /api/v1/games/divisions/:divisionId - Get division schedule
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { getDivisionSchedule } from "@/lib/db/queries/schedule";
import { hasPermission } from "@/lib/auth/permissions";

/**
 * GET /api/v1/games/divisions/:divisionId
 * Get complete schedule for a division
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { divisionId: string } }
) {
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

    const { divisionId } = params;

    if (!divisionId) {
      return NextResponse.json(
        { error: "Division ID is required" },
        { status: 400 }
      );
    }

    // Get division schedule
    const schedule = await getDivisionSchedule(divisionId);

    return NextResponse.json(schedule, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching division schedule:", error);

    if (error.message === "Division not found") {
      return NextResponse.json(
        { error: "Division not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch division schedule" },
      { status: 500 }
    );
  }
}
