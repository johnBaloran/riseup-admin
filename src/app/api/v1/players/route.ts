// src/app/api/v1/players/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Players API endpoint ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "@/lib/db/queries/players";
import {
  createPlayerSchema,
  updatePlayerSchema,
} from "@/lib/validations/player";
import { z } from "zod";

/**
 * GET /api/v1/players
 * Get players with filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "view_players")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const divisionId = searchParams.get("division") || undefined;
    const locationId = searchParams.get("location") || undefined;
    const teamId = searchParams.get("team") || undefined;
    const activeFilter = (searchParams.get("tab") as any) || "active";
    const freeAgentsOnly = searchParams.get("freeAgents") === "true";
    const hasUserAccount = searchParams.get("hasUser")
      ? searchParams.get("hasUser") === "true"
      : undefined;
    const search = searchParams.get("search") || undefined;
    const unlinked = searchParams.get("unlinked") === "true";

    const result = await getPlayers({
      page,
      limit,
      divisionId,
      locationId,
      teamId,
      activeFilter,
      freeAgentsOnly,
      hasUserAccount,
      search,
      unlinked,
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/players
 * Create player
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_players")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createPlayerSchema.parse(body);

    const player = await createPlayer(validatedData);

    return NextResponse.json({ success: true, data: player }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating player:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create player" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/players
 * Update player
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_players")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updatePlayerSchema.parse(body);

    const { id, ...updateData } = validatedData;

    const player = await updatePlayer(id, updateData);

    if (!player) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: player }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating player:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update player" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/players?id=xxx
 * Delete player
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_players")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("id");

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: "Player ID is required" },
        { status: 400 }
      );
    }

    await deletePlayer(playerId);

    return NextResponse.json(
      { success: true, message: "Player deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete player" },
      { status: 500 }
    );
  }
}
