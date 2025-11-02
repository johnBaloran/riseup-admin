// src/app/api/v1/players/[id]/recalculate-stats/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Recalculate player average stats API endpoint ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import Player from "@/models/Player";
import { connectDB } from "@/lib/db/mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "manage_players")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const player = await Player.findById(params.id).select("allStats");

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const playedGames = player.allStats.filter((stat: any) => {
      return (
        stat.points > 0 ||
        stat.rebounds > 0 ||
        stat.assists > 0 ||
        stat.steals > 0 ||
        stat.blocks > 0
      );
    });

    if (playedGames.length === 0) {
      player.averageStats = {
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        threesMade: 0,
        twosMade: 0,
        freeThrowsMade: 0,
      };
    } else {
      const totalStats = playedGames.reduce(
        (acc: any, stat: any) => {
          acc.points += stat.points;
          acc.rebounds += stat.rebounds;
          acc.assists += stat.assists;
          acc.steals += stat.steals;
          acc.blocks += stat.blocks;
          acc.threesMade += stat.threesMade;
          acc.twosMade += stat.twosMade;
          acc.freeThrowsMade += stat.freeThrowsMade;
          return acc;
        },
        {
          points: 0,
          rebounds: 0,
          assists: 0,
          steals: 0,
          blocks: 0,
          threesMade: 0,
          twosMade: 0,
          freeThrowsMade: 0,
        }
      );

      player.averageStats = {
        points: totalStats.points / playedGames.length,
        rebounds: totalStats.rebounds / playedGames.length,
        assists: totalStats.assists / playedGames.length,
        steals: totalStats.steals / playedGames.length,
        blocks: totalStats.blocks / playedGames.length,
        threesMade: totalStats.threesMade / playedGames.length,
        twosMade: totalStats.twosMade / playedGames.length,
        freeThrowsMade: totalStats.freeThrowsMade / playedGames.length,
      };
    }

    await player.save();

    return NextResponse.json({ success: true, averageStats: player.averageStats });
  } catch (error: any) {
    console.error("Error recalculating stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to recalculate stats" },
      { status: 500 }
    );
  }
}
