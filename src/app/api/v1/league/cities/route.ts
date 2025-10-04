// src/app/api/v1/league/cities/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Cities API endpoint ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getAllCities,
  createCity,
  updateCity,
  deleteCity,
  cityNameExists,
} from "@/lib/db/queries/cities";
import { z } from "zod";

import { createCitySchema, updateCitySchema } from "@/lib/validations/city";

/**
 * GET /api/v1/league/cities
 * Get all cities (EXECUTIVE only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_cities")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const cities = await getAllCities();

    return NextResponse.json({ success: true, data: cities }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/league/cities
 * Create city (EXECUTIVE only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session); // Add this
    console.log("Has permission:", hasPermission(session, "manage_cities")); // Add this

    if (!session || !hasPermission(session, "manage_cities")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createCitySchema.parse(body);

    // Check if city exists
    const exists = await cityNameExists(
      validatedData.cityName,
      validatedData.region,
      validatedData.country
    );

    if (exists) {
      return NextResponse.json(
        { success: false, error: "City already exists in this region" },
        { status: 409 }
      );
    }

    const city = await createCity(validatedData);

    return NextResponse.json({ success: true, data: city }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating city:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create city" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/league/cities
 * Update city (EXECUTIVE only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_cities")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateCitySchema.parse(body);

    const { id, ...updateData } = validatedData;

    const city = await updateCity(id, updateData);

    if (!city) {
      return NextResponse.json(
        { success: false, error: "City not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: city }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating city:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update city" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/league/cities
 * Delete city (EXECUTIVE only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_cities")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "City ID is required" },
        { status: 400 }
      );
    }

    await deleteCity(id);

    return NextResponse.json(
      { success: true, message: "City deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting city:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete city" },
      { status: 500 }
    );
  }
}
