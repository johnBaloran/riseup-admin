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
import Price from "@/models/Price";
import { getTaxRateByRegion, calculateTotalWithTax } from "@/lib/utils/tax-rates";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * POST /api/v1/payments/charge-card
 * Charge customer's card on file
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_payments")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { playerId, paymentMethodId, paymentNumber } = await request.json();

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

    // Get payment method with full population to calculate tax
    const paymentMethod = await PaymentMethod.findById(paymentMethodId).populate({
      path: "division",
      populate: [
        {
          path: "prices.installment",
          model: "Price",
        },
        {
          path: "prices.regularInstallment",
          model: "Price",
        },
        {
          path: "city",
          select: "region",
        },
      ],
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Payment method not found" },
        { status: 404 }
      );
    }

    if (paymentMethod.paymentType !== "INSTALLMENTS") {
      return NextResponse.json(
        { success: false, error: "This payment method is not an installment plan" },
        { status: 400 }
      );
    }

    // Get the correct price based on pricing tier
    const priceId =
      paymentMethod.pricingTier === "EARLY_BIRD"
        ? (paymentMethod.division as any).prices.installment
        : (paymentMethod.division as any).prices.regularInstallment;

    const price = await Price.findById(priceId);
    if (!price) {
      return NextResponse.json(
        { success: false, error: "Price not found" },
        { status: 404 }
      );
    }

    // Calculate amount with tax
    const division = paymentMethod.division as any;
    if (!division?.city?.region) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to determine region for tax calculation. Division city data is missing.",
        },
        { status: 400 }
      );
    }

    const region = division.city.region;
    const taxRate = getTaxRateByRegion(region);
    const baseAmount = price.amount;
    const totalAmount = calculateTotalWithTax(baseAmount, taxRate);
    const amountInCents = Math.round(totalAmount * 100);

    console.log("💰 Charge card payment calculation:", {
      paymentNumber,
      baseAmount,
      region,
      taxRate,
      totalAmount,
      amountInCents,
    });

    // Charge card via Stripe
    try {
      const paymentIntent = await chargeCustomerCard({
        customerId: player.customerId,
        amount: amountInCents,
        description: `${
          (player.team as any)?.teamName || "Team"
        } - Payment #${paymentNumber} - ${player.playerName}`,
        metadata: {
          playerId: player._id.toString(),
          paymentMethodId: paymentMethod._id.toString(),
          paymentNumber: paymentNumber.toString(),
          chargedBy: session.user?.email || "admin",
          region: region,
          taxRate: taxRate.toString(),
          baseAmount: baseAmount.toString(),
          totalWithTax: totalAmount.toString(),
        },
      });

      if (paymentIntent.status !== "succeeded") {
        throw new Error(
          paymentIntent.last_payment_error?.message || "Payment failed"
        );
      }

      // Update the installment payment method directly
      const fullPaymentMethod = await PaymentMethod.findById(paymentMethodId);

      if (!fullPaymentMethod || !fullPaymentMethod.installments) {
        throw new Error("Payment method or installments not found");
      }

      // Find the specific installment by payment number
      const installmentIndex =
        fullPaymentMethod.installments.subscriptionPayments.findIndex(
          (payment: any) => payment.paymentNumber === paymentNumber
        );

      if (installmentIndex === -1) {
        throw new Error("Installment not found");
      }

      console.log(
        "🔄 Updating installment:",
        paymentNumber,
        "from",
        fullPaymentMethod.installments.subscriptionPayments[installmentIndex]
          .status,
        "to succeeded"
      );

      // Update installment status and amount
      fullPaymentMethod.installments.subscriptionPayments[
        installmentIndex
      ].status = "succeeded";
      fullPaymentMethod.installments.subscriptionPayments[
        installmentIndex
      ].amountPaid = totalAmount; // Amount with tax
      fullPaymentMethod.installments.subscriptionPayments[
        installmentIndex
      ].stripePaymentIntentId = paymentIntent.id;

      // Recalculate total amount paid
      const totalPaid = fullPaymentMethod.installments.subscriptionPayments
        .filter((payment: any) => payment.status === "succeeded")
        .reduce(
          (sum: number, payment: any) => sum + (payment.amountPaid || 0),
          0
        );

      fullPaymentMethod.amountPaid = totalPaid;

      // Recalculate remaining balance
      if (fullPaymentMethod.installments.totalAmountDue) {
        fullPaymentMethod.installments.remainingBalance =
          fullPaymentMethod.installments.totalAmountDue - totalPaid;
      }

      // Check if all installments are paid
      const allPaid = fullPaymentMethod.installments.subscriptionPayments.every(
        (payment: any) => payment.status === "succeeded"
      );

      if (
        allPaid &&
        fullPaymentMethod.installments.remainingBalance === 0
      ) {
        fullPaymentMethod.status = "COMPLETED";
        console.log("🎉 All installments paid! Marking as COMPLETED");
      } else {
        fullPaymentMethod.status = "IN_PROGRESS";
      }

      await fullPaymentMethod.save();

      // Update player payment status if completed
      if (fullPaymentMethod.status === "COMPLETED") {
        await Player.findByIdAndUpdate(player._id, {
          "paymentStatus.hasPaid": true,
        });
      }

      console.log("✅ Installment updated successfully");
      console.log("   Total paid:", totalPaid);
      console.log(
        "   Remaining balance:",
        fullPaymentMethod.installments.remainingBalance
      );
      console.log("   Status:", fullPaymentMethod.status);

      // Send SMS confirmation to player
      const userPhone = (player.user as any)?.phoneNumber;
      if (userPhone) {
        try {
          await twilioClient.messages.create({
            body: `Hi ${
              player.playerName
            }, your payment #${paymentNumber} for $${totalAmount.toFixed(
              2
            )} (incl. tax) has been processed successfully. You'll receive a receipt from Stripe via email.`,
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
            status: fullPaymentMethod.status,
            amountPaid: totalPaid,
            remainingBalance: fullPaymentMethod.installments.remainingBalance,
            installmentNumber: paymentNumber,
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
