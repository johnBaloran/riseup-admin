// src/app/api/v1/jerseys/player/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Handle player jersey detail updates ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { updatePlayerJerseyDetails } from "@/lib/db/queries/jerseys";
import { updatePlayerJerseySchema } from "@/lib/validations/jersey";

/**
 * PUT /api/v1/jerseys/player
 * Update player jersey details (number, size, name)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "manage_jerseys")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updatePlayerJerseySchema.parse(body);

    const player = await updatePlayerJerseyDetails(validatedData.playerId, {
      jerseyNumber: validatedData.jerseyNumber,
      jerseySize: validatedData.jerseySize,
      jerseyName: validatedData.jerseyName,
    });

    return NextResponse.json({
      message: "Player jersey details updated successfully",
      player,
    });
  } catch (error: any) {
    console.error("PUT /api/v1/jerseys/player error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update player jersey details" },
      { status: 500 }
    );
  }
}
