// src/app/api/v1/teams/[teamId]/route.ts

/**
 * API route for individual team operations
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db/mongodb";
import Team from "@/models/Team";
import Game from "@/models/Game";

/**
 * DELETE /api/v1/teams/[teamId]
 * Delete a team (only if it has no players and no game references)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "manage_teams")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const team = await Team.findById(params.teamId);

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if team has players
    if (team.players && team.players.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete team with players. Please remove all players first." },
        { status: 400 }
      );
    }

    // Check if team is referenced in any games
    const gameCount = await Game.countDocuments({
      $or: [{ homeTeam: params.teamId }, { awayTeam: params.teamId }],
    });

    if (gameCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete team. This team is referenced in ${gameCount} game(s). Please remove or reassign the games first.`,
        },
        { status: 400 }
      );
    }

    // Delete the team
    await Team.findByIdAndDelete(params.teamId);

    return NextResponse.json(
      { message: "Team deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/teams/[teamId]
 * Update a team
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "manage_teams")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    await connectDB();

    const team = await Team.findById(params.teamId);

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Update team fields
    const allowedUpdates = ["teamName", "teamCode", "teamCaptain", "division"];
    const updates: any = {};

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      params.teamId,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: "division", select: "divisionName" },
      { path: "teamCaptain", select: "playerName" },
    ]);

    return NextResponse.json(updatedTeam, { status: 200 });
  } catch (error: any) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
