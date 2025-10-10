// src/app/api/v1/[cityId]/players/[id]/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Single player API endpoint ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { updatePlayer, deletePlayer } from "@/lib/db/queries/players";
import { updatePlayerSchema } from "@/lib/validations/player";
import { z } from "zod";

/**
 * PATCH /api/v1/[cityId]/players/[id]
 * Update player
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { cityId: string; id: string } }
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
    const validatedData = updatePlayerSchema.parse(body);

    const { id, ...updateData } = validatedData;

    const player = await updatePlayer(params.id, updateData);

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
 * DELETE /api/v1/[cityId]/players/[id]
 * Delete player
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cityId: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_players")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    await deletePlayer(params.id);

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
