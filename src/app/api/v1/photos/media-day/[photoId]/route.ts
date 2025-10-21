// src/app/api/v1/photos/media-day/[photoId]/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Individual media day photo API endpoint ONLY
 *
 * RESTful Design
 * DELETE /api/v1/photos/media-day/[photoId] - Delete photo
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { deleteMediaDayPhoto } from "@/lib/db/queries/mediaDayPhotos";

/**
 * DELETE /api/v1/photos/media-day/[photoId]
 * Delete a media day photo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "manage_photos")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    await deleteMediaDayPhoto(params.photoId);

    return NextResponse.json(
      { message: "Photo deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting media day photo:", error);

    if (error.message === "Photo not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete photo" },
      { status: 500 }
    );
  }
}
