// src/app/api/v1/league/prices/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Prices API endpoint ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getAllPrices,
  createPrice,
  stripePriceIdExists,
} from "@/lib/db/queries/prices";
import { createPriceSchema } from "@/lib/validations/price";
import { z } from "zod";

/**
 * GET /api/v1/league/prices
 * Get all prices (EXECUTIVE only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_prices")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const prices = await getAllPrices();

    return NextResponse.json({ success: true, data: prices }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching prices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/league/prices
 * Create price (EXECUTIVE only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_prices")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createPriceSchema.parse(body);

    // Check if Stripe price ID already exists
    const exists = await stripePriceIdExists(validatedData.priceId);
    if (exists) {
      return NextResponse.json(
        { success: false, error: "This Stripe price ID is already registered" },
        { status: 409 }
      );
    }

    const price = await createPrice(validatedData);

    return NextResponse.json({ success: true, data: price }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating price:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create price" },
      { status: 500 }
    );
  }
}
