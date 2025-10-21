// src/app/api/v1/photos/games/[gameId]/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Game photos API endpoint ONLY
 *
 * RESTful Design
 * GET /api/v1/photos/games/[gameId] - Get all photos for a game
 * POST /api/v1/photos/games/[gameId] - Create new photo for a game
 *
 * Authentication
 * Protected route - requires valid session with manage_photos permission
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getGamePhotos,
  createGamePhoto,
} from "@/lib/db/queries/gamePhotos";
import { z } from "zod";

/**
 * Validation schema for photo creation
 */
const createPhotoSchema = z.object({
  publicId: z.string().min(1, "Public ID is required"),
  url: z.string().url("Valid URL is required"),
  thumbnail: z.string().url("Valid thumbnail URL is required"),
  game: z.string().min(1, "Game ID is required"),
  tags: z.array(z.string()).optional().default([]),
  isHighlight: z.boolean().optional().default(false),
});

/**
 * GET /api/v1/photos/games/[gameId]
 * Get all photos for a specific game
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
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

    const photos = await getGamePhotos(params.gameId);

    return NextResponse.json(photos, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching game photos:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/photos/games/[gameId]
 * Create a new photo for a game
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
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
    const validatedData = createPhotoSchema.parse({
      ...body,
      game: params.gameId, // Ensure game ID matches route param
    });

    // Create photo
    const photo = await createGamePhoto(validatedData);

    return NextResponse.json(photo, { status: 201 });
  } catch (error: any) {
    console.error("Error creating game photo:", error);

    // Validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid photo data", details: error.errors },
        { status: 400 }
      );
    }

    // Duplicate photo error
    if (error.message === "Photo already exists") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    // Generic error
    return NextResponse.json(
      { error: error.message || "Failed to create photo" },
      { status: 500 }
    );
  }
}
