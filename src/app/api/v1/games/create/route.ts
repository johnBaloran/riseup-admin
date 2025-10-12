// src/app/api/v1/games/create/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Game creation API endpoint ONLY
 *
 * RESTful Design
 * POST /api/v1/games/create - Create single or multiple games
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { createGame, createGames } from "@/lib/db/queries/games";
import {
  createGameSchema,
  bulkCreateGamesSchema,
  validatePlayoffStructure,
} from "@/lib/validations/game";
import { hasPermission } from "@/lib/auth/permissions";

/**
 * POST /api/v1/games/create
 * Create one or more games
 *
 * Body (single game):
 * {
 *   gameName: string,
 *   date: string,
 *   time: string,
 *   homeTeam: string,
 *   awayTeam: string,
 *   division: string,
 *   week?: number,
 *   weekType?: string,
 *   published?: boolean
 * }
 *
 * Body (bulk create):
 * {
 *   divisionId: string,
 *   week: number,
 *   weekType: string,
 *   games: [...games]
 * }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Determine if this is bulk create or single create
    const isBulkCreate = "games" in body && Array.isArray(body.games);

    if (isBulkCreate) {
      // Validate bulk create
      const validated = bulkCreateGamesSchema.parse(body);

      // Validate playoff structure if applicable
      if (validated.weekType !== "REGULAR") {
        const structureValidation = validatePlayoffStructure(
          validated.weekType,
          validated.games.length
        );

        if (!structureValidation.valid) {
          return NextResponse.json(
            { error: structureValidation.message },
            { status: 400 }
          );
        }
      }

      // Add division, week, and weekType to each game
      const gamesWithMeta = validated.games.map((game) => ({
        ...game,
        division: validated.divisionId,
        week: validated.week,
        weekType: validated.weekType,
        isPlayoffGame: validated.weekType !== "REGULAR",
      }));

      // Create games
      const createdGames = await createGames(gamesWithMeta);

      return NextResponse.json(
        {
          success: true,
          games: createdGames,
          count: createdGames.length,
        },
        { status: 201 }
      );
    } else {
      // Single game creation
      const validated = createGameSchema.parse(body);

      const game = await createGame(validated);

      return NextResponse.json(
        {
          success: true,
          game,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Error creating game(s):", error);

    // Validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    // Business logic errors
    if (
      error.message.includes("not found") ||
      error.message.includes("same division")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to create game(s)" },
      { status: 500 }
    );
  }
}
