// src/app/api/v1/teams/[teamId]/unpaid-players/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Get unpaid players for a team ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db/mongodb";
import Team from "@/models/Team";
import Player from "@/models/Player";

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "view_payments")) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    const { teamId } = params;

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "teamId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get team with players
    const team = await Team.findById(teamId)
      .populate({
        path: "players",
        select: "_id playerName paymentStatus",
      })
      .lean();

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    // Filter for unpaid players (those without hasPaid: true)
    const unpaidPlayers = (team.players || []).filter(
      (player: any) => !player.paymentStatus?.hasPaid
    );

    return NextResponse.json(
      {
        success: true,
        players: unpaidPlayers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching unpaid players:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch unpaid players",
      },
      { status: 500 }
    );
  }
}
