// src/app/api/v1/scorekeeper/[gameId]/team-stats/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team statistics updates during scoring ONLY
 *
 * RESTful Design
 * PATCH /api/v1/scorekeeper/:gameId/team-stats - Update team stats
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { updateTeamGameStats } from "@/lib/db/queries/scorekeeper";

/**
 * PATCH /api/v1/scorekeeper/:gameId/team-stats
 * Update team statistics (aggregated from player stats)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Permission check
    if (!hasPermission(session, "manage_games")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    const { gameId } = params;
    const body = await request.json();

    const { statistics } = body;

    // Validate required fields
    if (!statistics || !statistics.homeTeam || !statistics.awayTeam) {
      return NextResponse.json(
        { error: "Missing required fields: statistics.homeTeam, statistics.awayTeam" },
        { status: 400 }
      );
    }

    // Update team stats
    const result = await updateTeamGameStats({
      gameId,
      homeTeamStats: statistics.homeTeam,
      awayTeamStats: statistics.awayTeam,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error updating team stats:", error);

    if (error.message === "Teams not found") {
      return NextResponse.json({ error: "Teams not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update team stats" },
      { status: 500 }
    );
  }
}
