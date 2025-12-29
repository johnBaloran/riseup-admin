// src/app/api/v1/payments/mark-etransfer-paid/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Mark e-transfer payment as paid ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db/mongodb";
import PaymentMethod from "@/models/PaymentMethod";
import Player from "@/models/Player";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/v1/payments/mark-etransfer-paid
 * Mark e-transfer payment as completed for one or multiple players
 *
 * Body:
 * {
 *   payments: Array<{
 *     playerId: string;
 *     amount: number;
 *     pricingTier: "EARLY_BIRD" | "REGULAR";
 *   }>;
 *   cityId: string;
 *   senderEmail?: string;
 *   referenceNumber?: string;
 *   notes?: string;
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

    const { payments, cityId, senderEmail, referenceNumber, notes } =
      await request.json();

    // Validate required fields
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      return NextResponse.json(
        { success: false, error: "payments array is required" },
        { status: 400 }
      );
    }

    if (!cityId) {
      return NextResponse.json(
        { success: false, error: "cityId is required" },
        { status: 400 }
      );
    }

    // Validate each payment
    for (const payment of payments) {
      if (!payment.playerId) {
        return NextResponse.json(
          { success: false, error: "playerId is required for each payment" },
          { status: 400 }
        );
      }

      if (!payment.amount || payment.amount <= 0) {
        return NextResponse.json(
          { success: false, error: "Valid amount is required for each payment" },
          { status: 400 }
        );
      }

      if (!payment.pricingTier || !["EARLY_BIRD", "REGULAR"].includes(payment.pricingTier)) {
        return NextResponse.json(
          {
            success: false,
            error: "Valid pricing tier is required for each payment (EARLY_BIRD or REGULAR)",
          },
          { status: 400 }
        );
      }
    }

    // Get the admin ID from the session
    const adminId = (session.user as any).id;

    // Generate a single transaction ID for all payments from this e-transfer
    const transactionId = uuidv4();

    await connectDB();

    const processedPayments = [];

    // Process each payment
    for (const payment of payments) {
      const { playerId, amount, pricingTier } = payment;

      // Get player to find division
      const player = await Player.findById(playerId);
      if (!player) {
        return NextResponse.json(
          { success: false, error: `Player not found: ${playerId}` },
          { status: 404 }
        );
      }

      // Find or create the player's e-transfer payment method
      let paymentMethod = await PaymentMethod.findOne({
        player: playerId,
        paymentType: "E_TRANSFER",
      });

      if (!paymentMethod) {
        // Create new E_TRANSFER payment method
        paymentMethod = await PaymentMethod.create({
          player: playerId,
          division: player.division,
          paymentType: "E_TRANSFER",
          pricingTier: pricingTier,
          originalPrice: amount,
          amountPaid: 0,
          status: "PENDING",
          eTransferPayments: [],
        });

        // Add payment method to player's paymentMethods array
        await Player.findByIdAndUpdate(playerId, {
          $addToSet: { paymentMethods: paymentMethod._id },
        });
      }

      // Add new e-transfer payment to the array
      paymentMethod.eTransferPayments = paymentMethod.eTransferPayments || [];
      paymentMethod.eTransferPayments.push({
        city: cityId,
        amount: amount,
        paidDate: new Date(),
        senderEmail: senderEmail || "",
        referenceNumber: referenceNumber || "",
        transactionId: transactionId,
        notes: notes || "",
        receivedBy: adminId,
        createdAt: new Date(),
      });

      // Save will trigger the pre-save middleware to auto-calculate totals and status
      await paymentMethod.save();

      // Update player payment status if completed
      if (paymentMethod.status === "COMPLETED") {
        await Player.findByIdAndUpdate(playerId, {
          "paymentStatus.hasPaid": true,
        });
      }

      // Populate the admin and city details for response
      await paymentMethod.populate([
        { path: "eTransferPayments.receivedBy", select: "name email" },
        { path: "eTransferPayments.city", select: "cityName eTransferEmail" },
      ]);

      processedPayments.push({
        playerId: playerId,
        playerName: player.playerName,
        paymentMethod: paymentMethod.toObject(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `E-transfer payment marked for ${payments.length} player(s)`,
        transactionId: transactionId,
        payments: processedPayments,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error marking e-transfer payment as paid:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to mark e-transfer payment as paid",
      },
      { status: 500 }
    );
  }
}
