// src/app/api/v1/[cityId]/divisions/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Divisions API endpoint ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getDivisions,
  createDivision,
  checkLocationConflict,
  getDivisionById,
  updateDivision,
} from "@/lib/db/queries/divisions";
import {
  createDivisionSchema,
  updateDivisionSchema,
} from "@/lib/validations/division"; // ADD updateDivisionSchema
import { z } from "zod";

/**
 * GET /api/v1/[cityId]/divisions
 * Get divisions with pagination (EXECUTIVE + COMMISSIONER)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "view_divisions")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const activeFilter = (searchParams.get("tab") as any) || "all";
    const locationId = searchParams.get("location") || undefined;
    const levelId = searchParams.get("level") || undefined;
    const day = searchParams.get("day") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await getDivisions({
      page,
      activeFilter,
      locationId,
      levelId,
      day,
      search,
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching divisions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch divisions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/[cityId]/divisions
 * Create division (EXECUTIVE + COMMISSIONER)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_divisions")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createDivisionSchema.parse(body);

    // Check for location conflicts (warning only)
    let conflictWarning = null;
    if (validatedData.startTime && validatedData.endTime) {
      const conflict = await checkLocationConflict(
        validatedData.location,
        validatedData.day,
        validatedData.startTime,
        validatedData.endTime
      );

      if (conflict.hasConflict) {
        conflictWarning = {
          message: `${conflict.conflictingDivision.divisionName} uses this location on ${validatedData.day}s from ${conflict.conflictingDivision.startTime} - ${conflict.conflictingDivision.endTime}`,
        };
      }
    }

    const division = await createDivision({
      ...validatedData,
      city: params.cityId,
    });

    return NextResponse.json(
      {
        success: true,
        data: division,
        warning: conflictWarning,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating division:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create division" },
      { status: 500 }
    );
  }
}

// src/app/api/v1/[cityId]/divisions/route.ts - Add PATCH method

/**
 * PATCH /api/v1/[cityId]/divisions
 * Update division (EXECUTIVE + COMMISSIONER)
 */
// src/app/api/v1/[cityId]/divisions/route.ts - Update PATCH method

export async function PATCH(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_divisions")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateDivisionSchema.parse(body);

    const { id, ...updateData } = validatedData;

    // Check for location conflicts if location/time is being updated
    let conflictWarning = null;
    if (
      updateData.location ||
      updateData.day ||
      updateData.startTime ||
      updateData.endTime
    ) {
      const currentDivision = await getDivisionById(id);

      // Add null check
      if (!currentDivision) {
        return NextResponse.json(
          { success: false, error: "Division not found" },
          { status: 404 }
        );
      }

      // Convert ObjectId to string with proper type handling
      const locationToCheck =
        updateData.location ||
        (typeof currentDivision.location === "object" &&
        currentDivision.location._id
          ? currentDivision.location._id.toString()
          : currentDivision.location?.toString() || "");

      const dayToCheck = updateData.day || currentDivision.day;
      const startTimeToCheck =
        updateData.startTime || currentDivision.startTime;
      const endTimeToCheck = updateData.endTime || currentDivision.endTime;

      if (startTimeToCheck && endTimeToCheck) {
        const conflict = await checkLocationConflict(
          locationToCheck,
          dayToCheck,
          startTimeToCheck,
          endTimeToCheck,
          id
        );

        if (conflict.hasConflict) {
          conflictWarning = {
            message: `${conflict.conflictingDivision.divisionName} uses this location on ${dayToCheck}s from ${conflict.conflictingDivision.startTime} - ${conflict.conflictingDivision.endTime}`,
          };
        }
      }
    }

    const division = await updateDivision(id, updateData);

    if (!division) {
      return NextResponse.json(
        { success: false, error: "Division not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: division,
        warning: conflictWarning,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating division:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update division" },
      { status: 500 }
    );
  }
}
