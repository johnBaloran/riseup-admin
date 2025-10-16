// src/app/api/v1/terminal/process-payment/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Process terminal payment API endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/constants/permissions";
import {
  processTerminalPayment,
  getTerminalReader,
} from "@/lib/services/stripe-terminal-service";
import PaymentMethod from "@/models/PaymentMethod";
import Player from "@/models/Player";
import { connectDB } from "@/lib/db/mongodb";

/**
 * POST /api/v1/terminal/process-payment
 * Initiate a terminal payment
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
    const { playerId, readerId, amount, pricingTier, divisionId } = body;

    // Validation
    if (!playerId || !readerId || !amount || !pricingTier || !divisionId) {
      return NextResponse.json(
        { error: "Player ID, reader ID, amount, pricing tier, and division ID are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if player exists
    const player = await Player.findById(playerId);
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Get reader details
    const reader = await getTerminalReader(readerId);
    if (!reader) {
      return NextResponse.json({ error: "Terminal reader not found" }, { status: 404 });
    }

    if (reader.status !== "online") {
      return NextResponse.json(
        { error: `Terminal reader is ${reader.status}. Please ensure it's connected.` },
        { status: 400 }
      );
    }

    // Convert amount to cents
    const amountInCents = Math.round(amount * 100);

    // Process payment on terminal
    const paymentResult = await processTerminalPayment({
      readerId,
      amountInCents,
      currency: "cad",
      description: `Payment for ${player.firstName} ${player.lastName}`,
      metadata: {
        playerId: playerId.toString(),
        divisionId: divisionId.toString(),
        pricingTier,
        processedBy: session.user.id,
      },
    });

    // Check if payment method already exists for this player
    let paymentMethod = await PaymentMethod.findOne({
      player: playerId,
      division: divisionId,
      paymentType: "TERMINAL",
    });

    if (!paymentMethod) {
      // Create new payment method record
      paymentMethod = await PaymentMethod.create({
        player: playerId,
        division: divisionId,
        paymentType: "TERMINAL",
        pricingTier,
        originalPrice: amount,
        amountPaid: 0,
        status: "IN_PROGRESS",
        terminalPayment: {
          paymentIntentId: paymentResult.paymentIntentId,
          amount: amountInCents,
          readerId: reader.id,
          readerLabel: reader.label,
          paidDate: new Date(),
          processedBy: session.user.id,
          status: "processing",
        },
      });

      // Add payment method to player's paymentMethods array
      console.log("💾 Adding payment method to player:", playerId, "->", paymentMethod._id);
      const updatedPlayer = await Player.findByIdAndUpdate(
        playerId,
        {
          $push: { paymentMethods: paymentMethod._id },
        },
        { new: true }
      );
      console.log("✅ Player paymentMethods array:", updatedPlayer?.paymentMethods);
    } else {
      // Update existing payment method
      paymentMethod.status = "IN_PROGRESS";
      paymentMethod.terminalPayment = {
        paymentIntentId: paymentResult.paymentIntentId,
        amount: amountInCents,
        readerId: reader.id,
        readerLabel: reader.label,
        paidDate: new Date(),
        processedBy: session.user.id,
        status: "processing",
      };
      await paymentMethod.save();
    }

    return NextResponse.json(
      {
        message: "Payment processing initiated on terminal. Please have customer present card.",
        paymentIntentId: paymentResult.paymentIntentId,
        status: paymentResult.status,
        readerLabel: reader.label,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing terminal payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process terminal payment" },
      { status: 500 }
    );
  }
}
