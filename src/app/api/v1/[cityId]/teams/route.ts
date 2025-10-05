// src/app/api/v1/[cityId]/teams/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Teams API endpoint ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  teamCodeExistsInDivision,
} from "@/lib/db/queries/teams";
import { createTeamSchema, updateTeamSchema } from "@/lib/validations/team";
import { z } from "zod";
import Team from "@/models/Team";

/**
 * GET /api/v1/[cityId]/teams
 * Get teams with pagination (EXECUTIVE + COMMISSIONER)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "view_teams")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const paymentFilter = (searchParams.get("tab") as any) || "all";
    const divisionId = searchParams.get("division") || undefined;
    const locationId = searchParams.get("location") || undefined;
    const search = searchParams.get("search") || undefined;
    const viewMode = (searchParams.get("view") as any) || "card";

    const result = await getTeams({
      cityId: params.cityId,
      page,
      paymentFilter,
      divisionId,
      locationId,
      search,
      viewMode,
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/[cityId]/teams
 * Create team (EXECUTIVE + COMMISSIONER)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { cityId: string } }
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
    const validatedData = createTeamSchema.parse(body);

    // Check if team code exists in division
    const codeExists = await teamCodeExistsInDivision(
      validatedData.teamCode,
      validatedData.division
    );

    if (codeExists) {
      return NextResponse.json(
        { success: false, error: "Team code already exists in this division" },
        { status: 409 }
      );
    }

    const team = await createTeam(validatedData);

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating team:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create team" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/[cityId]/teams
 * Update team (EXECUTIVE + COMMISSIONER)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { cityId: string } }
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
    const validatedData = updateTeamSchema.parse(body);

    const { id, ...updateData } = validatedData;

    // Check team code uniqueness if being updated
    if (updateData.teamCode && updateData.division) {
      const team = await Team.findById(id);
      const codeExists = await teamCodeExistsInDivision(
        updateData.teamCode,
        updateData.division,
        id
      );

      if (codeExists) {
        return NextResponse.json(
          {
            success: false,
            error: "Team code already exists in this division",
          },
          { status: 409 }
        );
      }
    }

    const team = await updateTeam(id, updateData);

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: team }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating team:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update team" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/[cityId]/teams
 * Delete team (EXECUTIVE + COMMISSIONER)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cityId: string } }
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
    const teamId = searchParams.get("id");

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "Team ID is required" },
        { status: 400 }
      );
    }

    await deleteTeam(teamId);

    return NextResponse.json(
      { success: true, message: "Team deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete team" },
      { status: 500 }
    );
  }
}
