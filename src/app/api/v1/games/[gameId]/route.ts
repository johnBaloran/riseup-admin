// src/app/api/v1/games/[gameId]/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Individual game CRUD operations ONLY
 *
 * RESTful Design
 * GET    /api/v1/games/:gameId - Get game details
 * PATCH  /api/v1/games/:gameId - Update game
 * DELETE /api/v1/games/:gameId - Delete game
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { getGameById, updateGame, deleteGame } from "@/lib/db/queries/games";
import { updateGameSchema, deleteGameSchema } from "@/lib/validations/game";
import { hasPermission } from "@/lib/auth/permissions";

/**
 * GET /api/v1/games/:gameId
 * Get game details by ID
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
    if (!hasPermission(session, "view_games")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    const { gameId } = params;

    const game = await getGameById(gameId);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json(game, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching game:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch game" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/games/:gameId
 * Update game details
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

    // Validate
    const validated = updateGameSchema.parse({
      id: gameId,
      ...body,
    });

    // Update game
    const updatedGame = await updateGame(gameId, validated);

    if (!updatedGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        game: updatedGame,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating game:", error);

    // Validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    if (error.message === "Game not found") {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update game" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/games/:gameId
 * Delete game with cascading cleanup
 */
export async function DELETE(
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

    // Validate deletion (requires confirmation)
    const validated = deleteGameSchema.parse({
      id: gameId,
      confirmed: body.confirmed,
    });

    // Delete game
    await deleteGame(gameId);

    return NextResponse.json(
      {
        success: true,
        message: "Game deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting game:", error);

    // Validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    if (error.message === "Game not found") {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete game" },
      { status: 500 }
    );
  }
}
