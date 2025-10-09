// src/app/api/v1/[cityId]/payments/charge-card/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Charge customer card API ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db/mongodb";
import { chargeCustomerCard } from "@/lib/services/stripe-customer-service";
import Player from "@/models/Player";
import PaymentMethod from "@/models/PaymentMethod";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * POST /api/v1/[cityId]/payments/charge-card
 * Charge customer's card on file
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_payments")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { playerId, paymentMethodId, paymentNumber, amount } =
      await request.json();

    await connectDB();

    // Get player with populated fields
    const player = await Player.findById(playerId)
      .populate("user", "name email phoneNumber")
      .populate("team", "teamName")
      .lean();

    if (!player || !player.customerId) {
      return NextResponse.json(
        { success: false, error: "Player not found or no Stripe customer" },
        { status: 404 }
      );
    }

    // Get payment method
    const paymentMethod = await PaymentMethod.findById(paymentMethodId).lean();

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Payment method not found" },
        { status: 404 }
      );
    }

    // Charge card via Stripe
    try {
      const paymentIntent = await chargeCustomerCard({
        customerId: player.customerId,
        amount,
        description: `${
          (player.team as any)?.teamName || "Team"
        } - Payment #${paymentNumber} - ${player.playerName}`,
        metadata: {
          playerId: player._id.toString(),
          paymentMethodId: paymentMethod._id.toString(),
          paymentNumber: paymentNumber.toString(),
          chargedBy: session.user?.email || "admin",
        },
      });

      if (paymentIntent.status !== "succeeded") {
        throw new Error(
          paymentIntent.last_payment_error?.message || "Payment failed"
        );
      }

      // Create new FULL_PAYMENT PaymentMethod for this installment
      const manualPayment = new PaymentMethod({
        paymentType: "FULL_PAYMENT",
        pricingTier: paymentMethod.pricingTier,
        originalPrice: amount / 100, // Convert back to dollars
        amountPaid: amount / 100,
        status: "COMPLETED",
        player: player._id,
        division: paymentMethod.division,
        isManualInstallment: true,
        installmentNumber: paymentNumber,
        replacedPaymentMethod: paymentMethod._id,
        stripePaymentIntentId: paymentIntent.id,
      });

      await manualPayment.save();

      // Add to player's payment methods
      await Player.findByIdAndUpdate(player._id, {
        $push: { paymentMethods: manualPayment._id },
      });

      // Mark original subscription payment as replaced
      await PaymentMethod.updateOne(
        {
          _id: paymentMethod._id,
          "installments.subscriptionPayments.paymentNumber": paymentNumber,
        },
        {
          $set: {
            "installments.subscriptionPayments.$.replacedBy": manualPayment._id,
          },
        }
      );

      // Send SMS confirmation to player
      const userPhone = (player.user as any)?.phoneNumber;
      if (userPhone) {
        try {
          await twilioClient.messages.create({
            body: `Hi ${
              player.playerName
            }, your payment #${paymentNumber} for $${
              amount / 100
            } has been processed successfully. You'll receive a receipt from Stripe via email.`,
            from: process.env.TWILIO_MESSAGING_SERVICE_SID,
            to: userPhone,
          });
        } catch (smsError) {
          console.error("Failed to send SMS confirmation:", smsError);
          // Don't fail the whole request if SMS fails
        }
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            paymentIntentId: paymentIntent.id,
            manualPaymentId: manualPayment._id,
            amount: amount / 100,
          },
        },
        { status: 200 }
      );
    } catch (stripeError: any) {
      // Handle Stripe-specific errors
      return NextResponse.json(
        {
          success: false,
          error: stripeError.message || "Card charge failed",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error charging card:", error);
    return NextResponse.json(
      { success: false, error: "Failed to charge card" },
      { status: 500 }
    );
  }
}
