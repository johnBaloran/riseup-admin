// src/app/api/v1/[cityId]/payments/card-info/[customerId]/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Get customer card info API ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getCustomerCardInfo } from "@/lib/services/stripe-customer-service";

/**
 * GET /api/v1/[cityId]/payments/card-info/[customerId]
 * Get customer's card information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { cityId: string; customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "view_payments")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const cardInfo = await getCustomerCardInfo(params.customerId);

    return NextResponse.json(
      { success: true, data: cardInfo },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error getting card info:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get card info" },
      { status: 500 }
    );
  }
}
