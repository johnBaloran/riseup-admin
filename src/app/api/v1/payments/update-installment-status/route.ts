// src/app/api/v1/payments/update-installment-status/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Update installment status after terminal payment
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
 * POST /api/v1/payments/update-installment-status
 * Update installment status after successful terminal payment
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
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get payment intent details from Stripe
    const paymentResult = await getPaymentIntent(paymentIntentId);

    if (!paymentResult.metadata) {
      return NextResponse.json(
        { error: "Payment metadata not found" },
        { status: 404 }
      );
    }

    const { paymentMethodId, invoiceId } = paymentResult.metadata as any;

    if (!paymentMethodId || !invoiceId) {
      return NextResponse.json(
        { error: "Payment method ID or invoice ID not found in metadata" },
        { status: 400 }
      );
    }

    // Find payment method
    const paymentMethod = await PaymentMethod.findById(paymentMethodId);

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    // Check if payment succeeded
    if (paymentResult.status !== "succeeded") {
      return NextResponse.json(
        {
          status: paymentResult.status,
          message: "Payment not yet completed",
        },
        { status: 200 }
      );
    }

    // Find and update the specific installment
    const installmentIndex =
      paymentMethod.installments?.subscriptionPayments.findIndex(
        (payment: any) => payment.invoiceId === invoiceId
      );

    if (
      installmentIndex === undefined ||
      installmentIndex === -1 ||
      !paymentMethod.installments
    ) {
      return NextResponse.json(
        { error: "Installment not found" },
        { status: 404 }
      );
    }

    const installment =
      paymentMethod.installments.subscriptionPayments[installmentIndex];

    console.log(
      "🔄 Updating installment:",
      installment.paymentNumber,
      "from",
      installment.status,
      "to succeeded"
    );

    // Update installment status and amount
    paymentMethod.installments.subscriptionPayments[installmentIndex].status =
      "succeeded";
    paymentMethod.installments.subscriptionPayments[installmentIndex].amountPaid =
      paymentResult.amount / 100; // Convert from cents to dollars

    // Recalculate total amount paid
    const totalPaid = paymentMethod.installments.subscriptionPayments
      .filter((payment: any) => payment.status === "succeeded")
      .reduce((sum: number, payment: any) => sum + (payment.amountPaid || 0), 0);

    paymentMethod.amountPaid = totalPaid;

    // Recalculate remaining balance
    if (paymentMethod.installments.totalAmountDue) {
      paymentMethod.installments.remainingBalance =
        paymentMethod.installments.totalAmountDue - totalPaid;
    }

    // Check if all installments are paid
    const allPaid = paymentMethod.installments.subscriptionPayments.every(
      (payment: any) => payment.status === "succeeded"
    );

    if (allPaid && paymentMethod.installments.remainingBalance === 0) {
      paymentMethod.status = "COMPLETED";
      console.log("🎉 All installments paid! Marking as COMPLETED");
    } else {
      paymentMethod.status = "IN_PROGRESS";
    }

    await paymentMethod.save();

    // Update player payment status if completed
    if (paymentMethod.status === "COMPLETED") {
      await Player.findByIdAndUpdate(paymentMethod.player, {
        "paymentStatus.hasPaid": true,
      });
    }

    console.log("✅ Installment updated successfully");
    console.log("   Total paid:", totalPaid);
    console.log("   Remaining balance:", paymentMethod.installments.remainingBalance);
    console.log("   Status:", paymentMethod.status);

    return NextResponse.json(
      {
        message: "Installment updated successfully",
        status: paymentMethod.status,
        amountPaid: totalPaid,
        remainingBalance: paymentMethod.installments.remainingBalance,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating installment status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update installment status" },
      { status: 500 }
    );
  }
}
