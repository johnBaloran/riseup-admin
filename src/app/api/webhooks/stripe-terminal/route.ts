// src/app/api/webhooks/stripe-terminal/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Stripe Terminal webhook handler ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db/mongodb";
import PaymentMethod from "@/models/PaymentMethod";
import Player from "@/models/Player";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

const webhookSecret = process.env.STRIPE_TERMINAL_WEBHOOK_SECRET!;

/**
 * POST /api/webhooks/stripe-terminal
 * Handle Stripe Terminal webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    await connectDB();

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.canceled":
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case "terminal.reader.action_succeeded":
        console.log("Terminal reader action succeeded:", event.data.object);
        break;

      case "terminal.reader.action_failed":
        console.log("Terminal reader action failed:", event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment Intent Succeeded:", paymentIntent.id);

  // Find payment method record
  const paymentMethod = await PaymentMethod.findOne({
    "terminalPayment.paymentIntentId": paymentIntent.id,
  });

  if (!paymentMethod) {
    console.error("Payment method not found for payment intent:", paymentIntent.id);
    return;
  }

  // Get charge details
  const charge = paymentIntent.latest_charge
    ? await stripe.charges.retrieve(paymentIntent.latest_charge as string)
    : null;

  const paymentMethodDetails = charge?.payment_method_details?.card_present;

  // Update payment method
  paymentMethod.status = "COMPLETED";
  paymentMethod.amountPaid = paymentMethod.originalPrice;

  if (paymentMethod.terminalPayment) {
    paymentMethod.terminalPayment.status = "succeeded";
    paymentMethod.terminalPayment.chargeId = charge?.id;
    paymentMethod.terminalPayment.cardBrand = paymentMethodDetails?.brand;
    paymentMethod.terminalPayment.cardLast4 = paymentMethodDetails?.last4;
    paymentMethod.terminalPayment.receiptUrl = charge?.receipt_url || undefined;
    paymentMethod.terminalPayment.authorizationCode =
      paymentMethodDetails?.authorization_code || undefined;
  }

  await paymentMethod.save();

  // Update player payment status
  await Player.findByIdAndUpdate(paymentMethod.player, {
    "paymentStatus.hasPaid": true,
  });

  console.log("Payment method updated successfully:", paymentMethod._id);
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment Intent Failed:", paymentIntent.id);

  // Find payment method record
  const paymentMethod = await PaymentMethod.findOne({
    "terminalPayment.paymentIntentId": paymentIntent.id,
  });

  if (!paymentMethod) {
    console.error("Payment method not found for payment intent:", paymentIntent.id);
    return;
  }

  // Update payment method status
  paymentMethod.status = "PENDING";
  if (paymentMethod.terminalPayment) {
    paymentMethod.terminalPayment.status = "failed";
  }

  await paymentMethod.save();

  console.log("Payment method marked as failed:", paymentMethod._id);
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment Intent Canceled:", paymentIntent.id);

  // Find payment method record
  const paymentMethod = await PaymentMethod.findOne({
    "terminalPayment.paymentIntentId": paymentIntent.id,
  });

  if (!paymentMethod) {
    console.error("Payment method not found for payment intent:", paymentIntent.id);
    return;
  }

  // Update payment method status
  paymentMethod.status = "PENDING";
  if (paymentMethod.terminalPayment) {
    paymentMethod.terminalPayment.status = "failed";
  }

  await paymentMethod.save();

  console.log("Payment method marked as canceled:", paymentMethod._id);
}
