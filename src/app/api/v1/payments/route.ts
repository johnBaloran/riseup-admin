// src/app/api/v1/[cityId]/payments/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Payments API endpoint ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getPlayersWithPaymentStatus } from "@/lib/db/queries/payments";

/**
 * GET /api/v1/[cityId]/payments
 * Get players with payment status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "view_payments")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("location") || undefined;
    const divisionId = searchParams.get("division") || undefined;
    const teamId = searchParams.get("team") || undefined;
    const paymentStatusFilter = searchParams.get("payment") || "all";
    const search = searchParams.get("search") || undefined;

    const players = await getPlayersWithPaymentStatus({
      cityId: params.cityId,
      locationId,
      divisionId,
      teamId,
      paymentStatusFilter,
      search,
    });

    return NextResponse.json(
      { success: true, data: players },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching payment data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment data" },
      { status: 500 }
    );
  }
}