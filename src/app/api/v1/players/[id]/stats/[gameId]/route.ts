// src/app/api/v1/players/[id]/stats/[gameId]/route.ts

/**
 * API route for player game stats operations
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db/mongodb";
import Player from "@/models/Player";

/**
 * Recalculate player's average stats from all game stats
 */
async function recalculateAverageStats(playerId: string) {
  const player = await Player.findById(playerId);

  if (!player || !player.allStats || player.allStats.length === 0) {
    // If no stats, set all averages to 0
    await Player.findByIdAndUpdate(playerId, {
      averageStats: {
        points: 0,
        rebounds: 0,
        assists: 0,
        blocks: 0,
        steals: 0,
        threesMade: 0,
        twosMade: 0,
        freeThrowsMade: 0,
      },
    });
    return;
  }

  const gamesPlayed = player.allStats.length;
  const totals = {
    points: 0,
    rebounds: 0,
    assists: 0,
    blocks: 0,
    steals: 0,
    threesMade: 0,
    twosMade: 0,
    freeThrowsMade: 0,
  };

  // Sum up all stats
  player.allStats.forEach((stat: any) => {
    totals.points += stat.points || 0;
    totals.rebounds += stat.rebounds || 0;
    totals.assists += stat.assists || 0;
    totals.blocks += stat.blocks || 0;
    totals.steals += stat.steals || 0;
    totals.threesMade += stat.threesMade || 0;
    totals.twosMade += stat.twosMade || 0;
    totals.freeThrowsMade += stat.freeThrowsMade || 0;
  });

  // Calculate averages
  const averages = {
    points: Number((totals.points / gamesPlayed).toFixed(1)),
    rebounds: Number((totals.rebounds / gamesPlayed).toFixed(1)),
    assists: Number((totals.assists / gamesPlayed).toFixed(1)),
    blocks: Number((totals.blocks / gamesPlayed).toFixed(1)),
    steals: Number((totals.steals / gamesPlayed).toFixed(1)),
    threesMade: Number((totals.threesMade / gamesPlayed).toFixed(1)),
    twosMade: Number((totals.twosMade / gamesPlayed).toFixed(1)),
    freeThrowsMade: Number((totals.freeThrowsMade / gamesPlayed).toFixed(1)),
  };

  // Update player with new averages
  await Player.findByIdAndUpdate(playerId, { averageStats: averages });
}

/**
 * PATCH /api/v1/players/[id]/stats/[gameId]
 * Update a player's game stat
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; gameId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "manage_players")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    await connectDB();

    const player = await Player.findById(params.id);

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Find the stat for this game
    const statIndex = player.allStats.findIndex((stat: any) => {
      const statGameId = stat.game?._id?.toString() || stat.game?.toString();
      return statGameId === params.gameId;
    });

    if (statIndex === -1) {
      return NextResponse.json(
        { error: "Stat for this game not found" },
        { status: 404 }
      );
    }

    // Update the stat fields directly to preserve the game reference
    player.allStats[statIndex].points =
      body.points ?? player.allStats[statIndex].points;
    player.allStats[statIndex].rebounds =
      body.rebounds ?? player.allStats[statIndex].rebounds;
    player.allStats[statIndex].assists =
      body.assists ?? player.allStats[statIndex].assists;
    player.allStats[statIndex].steals =
      body.steals ?? player.allStats[statIndex].steals;
    player.allStats[statIndex].blocks =
      body.blocks ?? player.allStats[statIndex].blocks;
    player.allStats[statIndex].threesMade =
      body.threesMade ?? player.allStats[statIndex].threesMade;
    player.allStats[statIndex].twosMade =
      body.twosMade ?? player.allStats[statIndex].twosMade;
    player.allStats[statIndex].freeThrowsMade =
      body.freeThrowsMade ?? player.allStats[statIndex].freeThrowsMade;

    await player.save();

    // Recalculate average stats
    await recalculateAverageStats(params.id);

    return NextResponse.json(
      { message: "Stat updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating player stat:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/players/[id]/stats/[gameId]
 * Delete a player's game stat
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; gameId: string } }
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

    const player = await Player.findById(params.id);

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Find and remove the stat for this game
    const statIndex = player.allStats.findIndex((stat: any) => {
      const statGameId = stat.game?._id?.toString() || stat.game?.toString();
      return statGameId === params.gameId;
    });

    // if (statIndex === -1) {
    //   console.log("Stat not found. Looking for gameId:", params.gameId);
    //   console.log(
    //     "Available game IDs:",
    //     player.allStats.map(
    //       (s: any) => s.game?._id?.toString() || s.game?.toString()
    //     )
    //   );
    //   return NextResponse.json(
    //     { error: "Stat for this game not found" },
    //     { status: 404 }
    //   );
    // }

    player.allStats.splice(statIndex, 1);
    await player.save();

    // Recalculate average stats
    await recalculateAverageStats(params.id);

    return NextResponse.json(
      { message: "Stat deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting player stat:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
