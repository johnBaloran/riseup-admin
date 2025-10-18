// src/app/api/v1/terminal/cancel-payment/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Cancel terminal payment API endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/constants/permissions";
import {
  cancelTerminalPayment,
  cancelReaderAction,
} from "@/lib/services/stripe-terminal-service";

/**
 * POST /api/v1/terminal/cancel-payment
 * Cancel an in-progress terminal payment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role, "manage_payments")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { paymentIntentId, readerId } = body;

    if (!paymentIntentId || !readerId) {
      return NextResponse.json(
        { error: "Payment Intent ID and Reader ID are required" },
        { status: 400 }
      );
    }

    // Cancel the reader action (stops the terminal prompt)
    await cancelReaderAction(readerId);

    // Cancel the payment intent
    await cancelTerminalPayment(paymentIntentId);

    console.log("❌ Payment canceled:", paymentIntentId);

    return NextResponse.json(
      {
        message: "Payment canceled successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error canceling payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel payment" },
      { status: 500 }
    );
  }
}
