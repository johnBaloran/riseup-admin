// src/app/api/v1/scorekeeper/[gameId]/player-of-game/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player of the game selection ONLY
 *
 * RESTful Design
 * PATCH /api/v1/scorekeeper/:gameId/player-of-game - Update player of the game
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { updatePlayerOfTheGame } from "@/lib/db/queries/scorekeeper";

/**
 * PATCH /api/v1/scorekeeper/:gameId/player-of-game
 * Manually select player of the game
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

    const { playerId } = body;

    // Validate required fields
    if (!playerId) {
      return NextResponse.json(
        { error: "Missing required field: playerId" },
        { status: 400 }
      );
    }

    // Update player of the game
    const result = await updatePlayerOfTheGame({
      gameId,
      playerId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error updating player of the game:", error);

    if (error.message === "Game not found") {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update player of the game" },
      { status: 500 }
    );
  }
}
