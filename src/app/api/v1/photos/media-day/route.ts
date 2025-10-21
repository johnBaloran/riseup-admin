// src/app/api/v1/photos/media-day/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Media day photos API endpoint ONLY
 *
 * RESTful Design
 * GET /api/v1/photos/media-day - Get media day photos with filters
 * POST /api/v1/photos/media-day - Create new media day photo
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getMediaDayPhotos,
  createMediaDayPhoto,
} from "@/lib/db/queries/mediaDayPhotos";
import { z } from "zod";

/**
 * Validation schema for photo creation
 */
const createPhotoSchema = z.object({
  publicId: z.string().min(1, "Public ID is required"),
  url: z.string().url("Valid URL is required"),
  thumbnail: z.string().url("Valid thumbnail URL is required"),
  location: z.string().min(1, "Location ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  tags: z.array(z.string()).optional().default([]),
});

/**
 * GET /api/v1/photos/media-day
 * Get photos for a specific location and date
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");
    const dateStr = searchParams.get("date");

    if (!locationId || !dateStr) {
      return NextResponse.json(
        { error: "Location ID and date are required" },
        { status: 400 }
      );
    }

    // Convert YYYY-MM-DD to Date in UTC
    const photos = await getMediaDayPhotos(locationId, new Date(dateStr + "T00:00:00Z"));

    return NextResponse.json(photos, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching media day photos:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/photos/media-day
 * Create a new media day photo
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = createPhotoSchema.parse(body);

    // Convert YYYY-MM-DD to Date in UTC
    const photo = await createMediaDayPhoto({
      ...validatedData,
      date: new Date(validatedData.date + "T00:00:00Z"),
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error: any) {
    console.error("Error creating media day photo:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid photo data", details: error.errors },
        { status: 400 }
      );
    }

    if (error.message === "Photo already exists") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to create photo" },
      { status: 500 }
    );
  }
}
