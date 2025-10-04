// src/app/api/v1/league/levels/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Levels API endpoint ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getAllLevels,
  createLevel,
  updateLevel,
  levelNameExists,
  gradeExists,
} from "@/lib/db/queries/levels";
import { createLevelSchema, updateLevelSchema } from "@/lib/validations/level";
import { z } from "zod";

/**
 * GET /api/v1/league/levels
 * Get all levels (EXECUTIVE only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_levels")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const levels = await getAllLevels();

    return NextResponse.json({ success: true, data: levels }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching levels:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch levels" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/league/levels
 * Create level (EXECUTIVE only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_levels")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createLevelSchema.parse(body);

    // Check if level name exists
    const nameExists = await levelNameExists(validatedData.name);
    if (nameExists) {
      return NextResponse.json(
        { success: false, error: "Level name already exists" },
        { status: 409 }
      );
    }

    // Check if grade exists
    const gradeAlreadyExists = await gradeExists(validatedData.grade);
    if (gradeAlreadyExists) {
      return NextResponse.json(
        { success: false, error: "Grade number already exists" },
        { status: 409 }
      );
    }

    const level = await createLevel(validatedData);

    return NextResponse.json({ success: true, data: level }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating level:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create level" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/league/levels
 * Update level (EXECUTIVE only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_levels")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateLevelSchema.parse(body);

    const { id, ...updateData } = validatedData;

    // Check if name exists (excluding current level)
    if (updateData.name) {
      const nameExists = await levelNameExists(updateData.name, id);
      if (nameExists) {
        return NextResponse.json(
          { success: false, error: "Level name already exists" },
          { status: 409 }
        );
      }
    }

    // Check if grade exists (excluding current level)
    if (updateData.grade) {
      const gradeAlreadyExists = await gradeExists(updateData.grade, id);
      if (gradeAlreadyExists) {
        return NextResponse.json(
          { success: false, error: "Grade number already exists" },
          { status: 409 }
        );
      }
    }

    const level = await updateLevel(id, updateData);

    if (!level) {
      return NextResponse.json(
        { success: false, error: "Level not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: level }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating level:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update level" },
      { status: 500 }
    );
  }
}
