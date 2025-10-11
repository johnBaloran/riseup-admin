// src/app/api/v1/jerseys/generic/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Handle generic jersey management ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  addGenericJersey,
  updateGenericJersey,
  removeGenericJersey,
} from "@/lib/db/queries/jerseys";
import {
  addGenericJerseySchema,
  updateGenericJerseySchema,
  removeGenericJerseySchema,
} from "@/lib/validations/jersey";

/**
 * POST /api/v1/jerseys/generic
 * Add generic jersey to team
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "manage_jerseys")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = addGenericJerseySchema.parse(body);

    const team = await addGenericJersey(validatedData.teamId, {
      jerseyNumber: validatedData.jerseyNumber,
      jerseySize: validatedData.jerseySize,
      jerseyName: validatedData.jerseyName,
    });

    return NextResponse.json({
      message: "Generic jersey added successfully",
      team,
    });
  } catch (error: any) {
    console.error("POST /api/v1/jerseys/generic error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to add generic jersey" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/jerseys/generic
 * Update generic jersey
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
    const validatedData = updateGenericJerseySchema.parse(body);

    const team = await updateGenericJersey(
      validatedData.teamId,
      validatedData.genericIndex,
      {
        jerseyNumber: validatedData.jerseyNumber,
        jerseySize: validatedData.jerseySize,
        jerseyName: validatedData.jerseyName,
      }
    );

    return NextResponse.json({
      message: "Generic jersey updated successfully",
      team,
    });
  } catch (error: any) {
    console.error("PUT /api/v1/jerseys/generic error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update generic jersey" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/jerseys/generic
 * Remove generic jersey from team
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
    const validatedData = removeGenericJerseySchema.parse(body);

    const team = await removeGenericJersey(
      validatedData.teamId,
      validatedData.genericIndex
    );

    return NextResponse.json({
      message: "Generic jersey removed successfully",
      team,
    });
  } catch (error: any) {
    console.error("DELETE /api/v1/jerseys/generic error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to remove generic jersey" },
      { status: 500 }
    );
  }
}
