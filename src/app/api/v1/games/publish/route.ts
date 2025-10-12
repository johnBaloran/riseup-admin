// src/app/api/v1/games/publish/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Game publishing API endpoint ONLY
 *
 * RESTful Design
 * POST   /api/v1/games/publish - Publish games (make visible)
 * DELETE /api/v1/games/publish - Unpublish games (make draft)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { publishGames, unpublishGames } from "@/lib/db/queries/games";
import { publishGamesSchema } from "@/lib/validations/game";
import { hasPermission } from "@/lib/auth/permissions";

/**
 * POST /api/v1/games/publish
 * Publish games (make visible to players)
 *
 * Body:
 * {
 *   gameIds: string[]
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

    // Validate
    const validated = publishGamesSchema.parse(body);

    // Publish games
    const result = await publishGames(validated.gameIds);

    return NextResponse.json(
      {
        success: true,
        message: `Published ${result.published} game(s)`,
        count: result.published,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error publishing games:", error);

    // Validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to publish games" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/games/publish
 * Unpublish games (make draft/hidden)
 *
 * Body:
 * {
 *   gameIds: string[]
 * }
 */
export async function DELETE(request: NextRequest) {
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

    // Validate
    const validated = publishGamesSchema.parse(body);

    // Unpublish games
    const result = await unpublishGames(validated.gameIds);

    return NextResponse.json(
      {
        success: true,
        message: `Unpublished ${result.unpublished} game(s)`,
        count: result.unpublished,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error unpublishing games:", error);

    // Validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to unpublish games" },
      { status: 500 }
    );
  }
}
