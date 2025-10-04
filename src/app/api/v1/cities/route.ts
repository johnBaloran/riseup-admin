// src/app/api/v1/cities/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Cities API endpoint ONLY
 */

/**
 * Error Handling & Resilience
 * Proper error responses with status codes
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { getActiveCities } from "@/lib/db/queries/cities";

/**
 * GET /api/v1/cities
 * Fetch all active cities
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch cities
    const cities = await getActiveCities();

    return NextResponse.json({ success: true, data: cities }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
