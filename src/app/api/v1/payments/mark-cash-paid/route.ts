// src/app/api/v1/payments/mark-cash-paid/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Mark cash payment as paid ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db/mongodb";
import PaymentMethod from "@/models/PaymentMethod";
import Player from "@/models/Player";
import Division from "@/models/Division";
import Price from "@/models/Price";

/**
 * POST /api/v1/payments/mark-cash-paid
 * Mark a cash payment as completed
 *
 * Body:
 * {
 *   playerId: string,
 *   amount: number,
 *   pricingTier: "EARLY_BIRD" | "REGULAR",
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_payments")) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    const { playerId, amount, pricingTier, notes } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: "playerId is required" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (!pricingTier || !["EARLY_BIRD", "REGULAR"].includes(pricingTier)) {
      return NextResponse.json(
        { success: false, error: "Valid pricing tier is required (EARLY_BIRD or REGULAR)" },
        { status: 400 }
      );
    }

    // Get the admin ID from the session
    const adminId = (session.user as any).id;

    await connectDB();

    // Find or create the player's cash payment method
    let paymentMethod = await PaymentMethod.findOne({
      player: playerId,
      paymentType: "CASH"
    });

    if (!paymentMethod) {
      // Get player to find division
      const player = await Player.findById(playerId);
      if (!player) {
        return NextResponse.json(
          { success: false, error: "Player not found" },
          { status: 404 }
        );
      }

      // Create new CASH payment method with manual amount
      paymentMethod = await PaymentMethod.create({
        player: playerId,
        division: player.division,
        paymentType: "CASH",
        pricingTier: pricingTier,
        originalPrice: amount,
        amountPaid: 0,
        status: "PENDING",
      });

      // Add payment method to player's paymentMethods array
      await Player.findByIdAndUpdate(playerId, {
        $addToSet: { paymentMethods: paymentMethod._id }
      });
    }

    // Update payment method to mark as paid
    paymentMethod.status = "COMPLETED";
    paymentMethod.amountPaid = paymentMethod.originalPrice;
    paymentMethod.cashPayment = {
      paidDate: new Date(),
      notes: notes || "",
      receivedBy: adminId,
    };

    await paymentMethod.save();

    // Update player payment status
    await Player.findByIdAndUpdate(playerId, {
      "paymentStatus.hasPaid": true,
    });

    // Populate the admin details
    await paymentMethod.populate("cashPayment.receivedBy", "name email");

    return NextResponse.json(
      {
        success: true,
        message: "Cash payment marked as paid successfully",
        paymentMethod: paymentMethod.toObject(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error marking cash payment as paid:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to mark cash payment as paid" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/payments/mark-cash-paid
 * Delete a cash payment completely (revert to unpaid)
 *
 * Body:
 * {
 *   playerId: string
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_payments")) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: "playerId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the player's payment method
    const paymentMethod = await PaymentMethod.findOne({
      player: playerId,
      paymentType: "CASH"
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Cash payment method not found for this player" },
        { status: 404 }
      );
    }

    const paymentMethodId = paymentMethod._id;

    // Delete the payment method completely
    await PaymentMethod.findByIdAndDelete(paymentMethodId);

    // Remove payment method from player's paymentMethods array and update status
    await Player.findByIdAndUpdate(playerId, {
      "paymentStatus.hasPaid": false,
      $pull: { paymentMethods: paymentMethodId }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Cash payment deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting cash payment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete cash payment" },
      { status: 500 }
    );
  }
}
