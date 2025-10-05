// src/app/api/v1/[cityId]/players/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Players API endpoint ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getPlayers, createPlayer } from "@/lib/db/queries/players";
import { createPlayerSchema } from "@/lib/validations/player";
import { z } from "zod";

/**
 * GET /api/v1/[cityId]/players
 * Get players with filters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
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
    const divisionId = searchParams.get("division") || undefined;
    const teamId = searchParams.get("team") || undefined;
    const paymentFilter = (searchParams.get("payment") as any) || "all";
    const freeAgentsOnly = searchParams.get("freeAgents") === "true";
    const hasUserAccount = searchParams.get("hasUser")
      ? searchParams.get("hasUser") === "true"
      : undefined;
    const search = searchParams.get("search") || undefined;

    const result = await getPlayers({
      cityId: params.cityId,
      page,
      divisionId,
      teamId,
      paymentFilter,
      freeAgentsOnly,
      hasUserAccount,
      search,
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
 * POST /api/v1/[cityId]/players
 * Create player
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
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
