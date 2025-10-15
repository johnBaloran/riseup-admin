// src/app/api/v1/scorekeeper/[gameId]/player-stats/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player statistics updates during scoring ONLY
 *
 * RESTful Design
 * PATCH /api/v1/scorekeeper/:gameId/player-stats - Update player stats
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { updatePlayerGameStats } from "@/lib/db/queries/scorekeeper";

/**
 * PATCH /api/v1/scorekeeper/:gameId/player-stats
 * Update player statistics (points, rebounds, assists, etc.)
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

    const { chosenPlayer, statistics, points, updatedTotalScores } = body;

    // Validate required fields
    if (!chosenPlayer || !statistics) {
      return NextResponse.json(
        { error: "Missing required fields: chosenPlayer, statistics" },
        { status: 400 }
      );
    }

    // Update player stats
    const result = await updatePlayerGameStats({
      gameId,
      playerId: chosenPlayer,
      statistics,
      updateScores: points && updatedTotalScores ? updatedTotalScores : undefined,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error updating player stats:", error);

    if (error.message === "Player not found") {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update player stats" },
      { status: 500 }
    );
  }
}
