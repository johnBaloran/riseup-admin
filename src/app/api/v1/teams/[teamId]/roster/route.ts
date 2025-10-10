// src/app/api/v1/teams/[teamId]/roster/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team roster management API ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  addPlayerToTeam,
  removePlayerFromTeam,
  getFreeAgentsByDivision,
} from "@/lib/db/queries/players";
import { getTeamById } from "@/lib/db/queries/teams";

/**
 * GET /api/v1/teams/[teamId]/roster
 * Get free agents for team's division
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_teams")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const team = await getTeamById(params.teamId);

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    const divisionId =
      typeof team.division === "object" ? team.division._id : team.division;

    const freeAgents = await getFreeAgentsByDivision(divisionId.toString());

    return NextResponse.json(
      { success: true, data: freeAgents },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching free agents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch free agents" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/teams/[teamId]/roster
 * Add player to team roster
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_teams")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: "Player ID is required" },
        { status: 400 }
      );
    }

    await addPlayerToTeam(playerId, params.teamId);

    return NextResponse.json(
      { success: true, message: "Player added to team" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error adding player to team:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add player" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/teams/[teamId]/roster
 * Remove player from team roster
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_teams")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: "Player ID is required" },
        { status: 400 }
      );
    }

    await removePlayerFromTeam(playerId, params.teamId);

    return NextResponse.json(
      { success: true, message: "Player removed from team" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error removing player from team:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove player" },
      { status: 500 }
    );
  }
}
