// src/app/api/v1/jerseys/design/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Handle jersey design updates ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  updateTeamJerseyEdition,
  updateTeamJerseyCustom,
  removeTeamJerseyDesign,
} from "@/lib/db/queries/jerseys";
import {
  updateJerseyEditionSchema,
  updateJerseyCustomSchema,
  removeJerseyDesignSchema,
} from "@/lib/validations/jersey";

/**
 * PUT /api/v1/jerseys/design
 * Update team jersey design (edition or custom)
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
    const { type } = body;

    if (type === "edition") {
      // Validate edition data
      const validatedData = updateJerseyEditionSchema.parse(body);

      const team = await updateTeamJerseyEdition(validatedData.teamId, {
        jerseyEdition: validatedData.jerseyEdition,
        primaryColor: validatedData.primaryColor,
        secondaryColor: validatedData.secondaryColor,
        tertiaryColor: validatedData.tertiaryColor,
      });

      return NextResponse.json({
        message: "Jersey edition updated successfully",
        team,
      });
    } else if (type === "custom") {
      // Validate custom data
      const validatedData = updateJerseyCustomSchema.parse(body);

      const team = await updateTeamJerseyCustom(
        validatedData.teamId,
        validatedData.imageData
      );

      return NextResponse.json({
        message: "Custom jersey updated successfully",
        team,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid design type. Must be 'edition' or 'custom'" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("PUT /api/v1/jerseys/design error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update jersey design" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/jerseys/design
 * Remove team jersey design
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "manage_jerseys")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = removeJerseyDesignSchema.parse(body);

    const team = await removeTeamJerseyDesign(validatedData.teamId);

    return NextResponse.json({
      message: "Jersey design removed successfully",
      team,
    });
  } catch (error: any) {
    console.error("DELETE /api/v1/jerseys/design error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to remove jersey design" },
      { status: 500 }
    );
  }
}
