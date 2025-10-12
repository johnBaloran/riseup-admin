// src/app/api/v1/games/week/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Week schedule API endpoint ONLY
 *
 * RESTful Design
 * GET /api/v1/games/week - Get games for specific week
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { getGamesByWeek } from "@/lib/db/queries/games";
import { getTeamScheduleCounts } from "@/lib/db/queries/schedule";
import { hasPermission } from "@/lib/auth/permissions";
import { z } from "zod";

const weekQuerySchema = z.object({
  divisionId: z.string().min(1, "Division ID is required"),
  week: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1, "Week must be at least 1")),
});

/**
 * GET /api/v1/games/week?divisionId=xxx&week=1
 * Get games for a specific week
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const queryParams = {
      divisionId: searchParams.get("divisionId") || "",
      week: searchParams.get("week") || "1",
    };

    const validated = weekQuerySchema.parse(queryParams);

    // Get games for week
    const [games, teamCounts] = await Promise.all([
      getGamesByWeek(validated.divisionId, validated.week),
      getTeamScheduleCounts(validated.divisionId, validated.week),
    ]);

    return NextResponse.json(
      {
        games,
        teamCounts,
        week: validated.week,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching week schedule:", error);

    // Validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      );
    }

    if (error.message === "Division not found") {
      return NextResponse.json(
        { error: "Division not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch week schedule" },
      { status: 500 }
    );
  }
}
