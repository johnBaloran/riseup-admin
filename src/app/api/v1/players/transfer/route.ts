// src/app/api/v1/players/transfer/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db/mongodb";
import Player from "@/models/Player";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "manage_teams")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { sourcePlayerId, targetPlayerId, transferOptions } = body;

    if (!sourcePlayerId || !targetPlayerId) {
      return NextResponse.json(
        { error: "Source and target player IDs are required" },
        { status: 400 }
      );
    }

    if (sourcePlayerId === targetPlayerId) {
      return NextResponse.json(
        { error: "Source and target players must be different" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get both players
    const [sourcePlayer, targetPlayer] = await Promise.all([
      Player.findById(sourcePlayerId),
      Player.findById(targetPlayerId),
    ]);

    if (!sourcePlayer || !targetPlayer) {
      return NextResponse.json(
        { error: "One or both players not found" },
        { status: 404 }
      );
    }

    // Build swap objects for both players
    const sourceUpdates: any = {};
    const targetUpdates: any = {};

    // Swap allStats
    if (transferOptions.allStats) {
      sourceUpdates.allStats = targetPlayer.allStats || [];
      targetUpdates.allStats = sourcePlayer.allStats || [];
    }

    // Swap averageStats
    if (transferOptions.averageStats) {
      sourceUpdates.averageStats = targetPlayer.averageStats || {
        points: 0,
        rebounds: 0,
        assists: 0,
        blocks: 0,
        steals: 0,
        threesMade: 0,
        twosMade: 0,
        freeThrowsMade: 0,
      };
      targetUpdates.averageStats = sourcePlayer.averageStats || {
        points: 0,
        rebounds: 0,
        assists: 0,
        blocks: 0,
        steals: 0,
        threesMade: 0,
        twosMade: 0,
        freeThrowsMade: 0,
      };
    }

    // Swap jersey number
    if (transferOptions.jerseyNumber) {
      sourceUpdates.jerseyNumber = targetPlayer.jerseyNumber;
      targetUpdates.jerseyNumber = sourcePlayer.jerseyNumber;
    }

    // Swap jersey size
    if (transferOptions.jerseySize) {
      sourceUpdates.jerseySize = targetPlayer.jerseySize;
      targetUpdates.jerseySize = sourcePlayer.jerseySize;
    }

    // Swap jersey name
    if (transferOptions.jerseyName) {
      sourceUpdates.jerseyName = targetPlayer.jerseyName;
      targetUpdates.jerseyName = sourcePlayer.jerseyName;
    }

    // Update both players
    await Promise.all([
      Player.findByIdAndUpdate(sourcePlayerId, sourceUpdates),
      Player.findByIdAndUpdate(targetPlayerId, targetUpdates),
    ]);

    return NextResponse.json({
      success: true,
      message: "Player data swapped successfully",
      swapped: Object.keys(sourceUpdates),
    });
  } catch (error: any) {
    console.error("Transfer player data error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to transfer player data" },
      { status: 500 }
    );
  }
}
