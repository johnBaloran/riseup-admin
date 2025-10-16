// src/app/api/v1/terminal/payment-status/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Check terminal payment status API endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/constants/permissions";
import { getPaymentIntent } from "@/lib/services/stripe-terminal-service";
import PaymentMethod from "@/models/PaymentMethod";
import Player from "@/models/Player";
import { connectDB } from "@/lib/db/mongodb";

/**
 * GET /api/v1/terminal/payment-status?paymentIntentId=xxx
 * Poll payment status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role, "view_payments")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("paymentIntentId");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get payment intent from Stripe
    const paymentResult = await getPaymentIntent(paymentIntentId);

    // Find payment method record
    const paymentMethod = await PaymentMethod.findOne({
      "terminalPayment.paymentIntentId": paymentIntentId,
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // Update payment method if status changed
    if (paymentResult.status === "succeeded" && paymentMethod.status !== "COMPLETED") {
      console.log("🎉 Payment succeeded! Updating payment method:", paymentIntentId);

      paymentMethod.status = "COMPLETED";
      paymentMethod.amountPaid = paymentMethod.originalPrice;

      if (paymentMethod.terminalPayment) {
        paymentMethod.terminalPayment.status = "succeeded";
        paymentMethod.terminalPayment.chargeId = paymentResult.chargeId;
        paymentMethod.terminalPayment.cardBrand = paymentResult.cardBrand;
        paymentMethod.terminalPayment.cardLast4 = paymentResult.cardLast4;
        paymentMethod.terminalPayment.receiptUrl = paymentResult.receiptUrl;
        paymentMethod.terminalPayment.authorizationCode = paymentResult.authorizationCode;
      }

      await paymentMethod.save();
      console.log("✅ Payment method saved:", paymentMethod._id);

      // Update player payment status
      await Player.findByIdAndUpdate(paymentMethod.player, {
        "paymentStatus.hasPaid": true,
      });
      console.log("✅ Player updated:", paymentMethod.player);
    } else if (
      (paymentResult.status === "canceled" || paymentResult.status === "requires_payment_method") &&
      paymentMethod.status !== "PENDING"
    ) {
      paymentMethod.status = "PENDING";
      if (paymentMethod.terminalPayment) {
        paymentMethod.terminalPayment.status = "failed";
      }
      await paymentMethod.save();
    }

    return NextResponse.json(
      {
        status: paymentResult.status,
        paymentIntentId: paymentResult.paymentIntentId,
        amount: paymentResult.amount,
        cardBrand: paymentResult.cardBrand,
        cardLast4: paymentResult.cardLast4,
        receiptUrl: paymentResult.receiptUrl,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check payment status" },
      { status: 500 }
    );
  }
}
