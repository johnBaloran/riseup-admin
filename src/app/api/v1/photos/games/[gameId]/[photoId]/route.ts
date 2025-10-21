// src/app/api/v1/photos/games/[gameId]/[photoId]/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Individual game photo API endpoint ONLY
 *
 * RESTful Design
 * PATCH /api/v1/photos/games/[gameId]/[photoId] - Update photo metadata
 * DELETE /api/v1/photos/games/[gameId]/[photoId] - Delete photo
 *
 * Authentication
 * Protected route - requires valid session with manage_photos permission
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  updateGamePhoto,
  deleteGamePhoto,
} from "@/lib/db/queries/gamePhotos";
import { z } from "zod";

/**
 * Validation schema for photo update
 */
const updatePhotoSchema = z.object({
  tags: z.array(z.string()).optional(),
  isHighlight: z.boolean().optional(),
});

/**
 * PATCH /api/v1/photos/games/[gameId]/[photoId]
 * Update photo metadata (tags, highlight status)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { gameId: string; photoId: string } }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Permission check
    if (!hasPermission(session, "manage_photos")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updatePhotoSchema.parse(body);

    // Update photo
    const photo = await updateGamePhoto(params.photoId, validatedData);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json(photo, { status: 200 });
  } catch (error: any) {
    console.error("Error updating game photo:", error);

    // Validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid update data", details: error.errors },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: error.message || "Failed to update photo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/photos/games/[gameId]/[photoId]
 * Delete a photo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { gameId: string; photoId: string } }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Permission check
    if (!hasPermission(session, "manage_photos")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    // Delete photo
    await deleteGamePhoto(params.photoId);

    return NextResponse.json(
      { message: "Photo deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting game photo:", error);

    // Photo not found
    if (error.message === "Photo not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Generic error
    return NextResponse.json(
      { error: error.message || "Failed to delete photo" },
      { status: 500 }
    );
  }
}
