// src/app/api/v1/scorekeeper/[gameId]/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Scorekeeper game data retrieval ONLY
 *
 * RESTful Design
 * GET /api/v1/scorekeeper/:gameId - Get game data for scorekeeper interface
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getScorekeeperGameData } from "@/lib/db/queries/scorekeeper";

/**
 * GET /api/v1/scorekeeper/:gameId
 * Get game data for scorekeeper interface
 */
export async function GET(
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

    // Fetch game data
    const data = await getScorekeeperGameData(gameId);

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching scorekeeper data:", error);

    if (error.message === "Game not found") {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch game data" },
      { status: 500 }
    );
  }
}
