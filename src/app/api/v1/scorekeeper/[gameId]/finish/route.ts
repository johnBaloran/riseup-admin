// src/app/api/v1/scorekeeper/[gameId]/finish/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Game completion operations ONLY
 *
 * RESTful Design
 * POST /api/v1/scorekeeper/:gameId/finish - Finish game and calculate final standings
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { finishGame } from "@/lib/db/queries/scorekeeper";

/**
 * POST /api/v1/scorekeeper/:gameId/finish
 * Complete game and calculate final standings, player of the game
 */
export async function POST(
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

    const { homeTeamId, awayTeamId } = body;

    // Validate required fields
    if (!homeTeamId || !awayTeamId) {
      return NextResponse.json(
        { error: "Missing required fields: homeTeamId, awayTeamId" },
        { status: 400 }
      );
    }

    // Finish game
    const result = await finishGame({
      gameId,
      homeTeamId,
      awayTeamId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error finishing game:", error);

    if (error.message === "Game not found") {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (error.message === "Teams not found") {
      return NextResponse.json({ error: "Teams not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to finish game" },
      { status: 500 }
    );
  }
}
