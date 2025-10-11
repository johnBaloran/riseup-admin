// src/app/api/v1/jerseys/team/[teamId]/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Handle team jersey detail requests ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getTeamJerseyDetails } from "@/lib/db/queries/jerseys";

/**
 * GET /api/v1/jerseys/team/[teamId]
 * Get full team jersey details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "manage_jerseys")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const team = await getTeamJerseyDetails(params.teamId);

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ team });
  } catch (error: any) {
    console.error("GET /api/v1/jerseys/team/[teamId] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch team jersey details" },
      { status: 500 }
    );
  }
}
