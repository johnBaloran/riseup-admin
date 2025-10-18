// src/app/api/v1/payments/pay-installment-terminal/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Process terminal payment for failed installment
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
import Price from "@/models/Price";
import { connectDB } from "@/lib/db/mongodb";
import { getTaxRateByRegion, calculateTotalWithTax } from "@/lib/utils/tax-rates";
import mongoose from "mongoose";

/**
 * POST /api/v1/payments/pay-installment-terminal
 * Process a failed installment payment via terminal
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
    const { paymentMethodId, installmentInvoiceId, readerId } = body;

    // Validation
    if (!paymentMethodId || !installmentInvoiceId || !readerId) {
      return NextResponse.json(
        {
          error: "Payment method ID, installment invoice ID, and reader ID are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Get payment method with full population
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
          path: "location",
          model: "Location",
        },
        {
          path: "city",
          select: "region",
        },
      ],
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    if (paymentMethod.paymentType !== "INSTALLMENTS") {
      return NextResponse.json(
        { error: "This payment method is not an installment plan" },
        { status: 400 }
      );
    }

    // Find the specific failed installment
    const installment = paymentMethod.installments?.subscriptionPayments.find(
      (payment: any) => payment.invoiceId === installmentInvoiceId
    );

    if (!installment) {
      return NextResponse.json(
        { error: "Installment not found" },
        { status: 404 }
      );
    }

    if (installment.status === "succeeded") {
      return NextResponse.json(
        { error: "This installment has already been paid" },
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
        { error: "Price not found" },
        { status: 404 }
      );
    }

    // Calculate amount with tax
    console.log("🔍 Debug payment method structure:", {
      hasDivision: !!paymentMethod.division,
      hasCity: !!(paymentMethod.division as any)?.city,
      cityData: (paymentMethod.division as any)?.city,
    });

    const division = paymentMethod.division as any;
    if (!division?.city?.region) {
      return NextResponse.json(
        {
          error: "Unable to determine region for tax calculation. Division city data is missing.",
          debug: {
            hasDivision: !!division,
            hasCity: !!division?.city,
            cityId: division?.city?._id || division?.city,
          }
        },
        { status: 400 }
      );
    }

    const region = division.city.region;
    const taxRate = getTaxRateByRegion(region);
    const baseAmount = price.amount;
    const totalAmount = calculateTotalWithTax(baseAmount, taxRate);
    const amountInCents = Math.round(totalAmount * 100);

    console.log("💰 Installment payment calculation:", {
      baseAmount,
      region,
      taxRate,
      totalAmount,
      amountInCents,
    });

    // Get reader details
    const reader = await getTerminalReader(readerId);
    if (!reader) {
      return NextResponse.json(
        { error: "Terminal reader not found" },
        { status: 404 }
      );
    }

    if (reader.status !== "online") {
      return NextResponse.json(
        {
          error: `Terminal reader is ${reader.status}. Please ensure it's connected.`,
        },
        { status: 400 }
      );
    }

    // Get player info for description
    const player = await Player.findById(paymentMethod.player);
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Process payment on terminal
    const paymentResult = await processTerminalPayment({
      readerId,
      amountInCents,
      currency: "cad",
      description: `Installment #${installment.paymentNumber} for ${player.playerName}`,
      metadata: {
        paymentMethodId: paymentMethodId.toString(),
        invoiceId: installmentInvoiceId,
        installmentNumber: installment.paymentNumber.toString(),
        processedBy: session.user.id,
      },
    });

    console.log("✅ Terminal payment initiated:", paymentResult.paymentIntentId);

    return NextResponse.json(
      {
        message:
          "Payment processing initiated on terminal. Please have customer present card.",
        paymentIntentId: paymentResult.paymentIntentId,
        status: paymentResult.status,
        amount: totalAmount,
        readerLabel: reader.label,
        installmentNumber: installment.paymentNumber,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing installment terminal payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process terminal payment" },
      { status: 500 }
    );
  }
}
