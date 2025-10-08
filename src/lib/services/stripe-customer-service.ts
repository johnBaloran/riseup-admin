// src/lib/services/stripe-customer-service.ts

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export interface CardInfo {
  hasCard: boolean;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  isExpired: boolean;
  isValid: boolean;
  paymentMethodId?: string;
}

/**
 * Get customer's payment method info
 * Tries multiple methods to find a card:
 * 1. Default payment method
 * 2. Invoice settings default
 * 3. List all payment methods
 */
export async function getCustomerCardInfo(
  customerId: string
): Promise<CardInfo> {
  try {
    console.log("🔍 Getting card info for customer:", customerId);

    // Validate customerId
    if (!customerId || !customerId.startsWith("cus_")) {
      console.error("❌ Invalid customer ID format:", customerId);
      return { hasCard: false, isExpired: false, isValid: false };
    }

    // Get customer
    const customer = await stripe.customers.retrieve(customerId, {
      expand: ["invoice_settings.default_payment_method"],
    });

    if (customer.deleted) {
      console.log("❌ Customer is deleted");
      return { hasCard: false, isExpired: false, isValid: false };
    }

    console.log("✅ Customer retrieved:", {
      id: customer.id,
      hasDefaultPaymentMethod:
        !!customer.invoice_settings?.default_payment_method,
      defaultSource: customer.default_source,
    });

    // METHOD 1: Try invoice_settings.default_payment_method
    let paymentMethod: Stripe.PaymentMethod | null = null;
    const defaultPaymentMethod =
      customer.invoice_settings?.default_payment_method;

    if (defaultPaymentMethod) {
      if (typeof defaultPaymentMethod === "string") {
        console.log(
          "📝 Fetching payment method from invoice settings:",
          defaultPaymentMethod
        );
        paymentMethod = await stripe.paymentMethods.retrieve(
          defaultPaymentMethod
        );
      } else {
        paymentMethod = defaultPaymentMethod;
      }
    }

    // METHOD 2: Try listing all payment methods if no default found
    if (!paymentMethod) {
      console.log(
        "📝 No default payment method, listing all payment methods..."
      );
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
        limit: 100,
      });

      console.log("✅ Found payment methods:", paymentMethods.data.length);

      if (paymentMethods.data.length > 0) {
        // Use the most recently created one
        paymentMethod = paymentMethods.data[0];
        console.log("✅ Using payment method:", paymentMethod.id);
      }
    }

    // METHOD 3: Check default_source (legacy)
    if (!paymentMethod && customer.default_source) {
      console.log("📝 Checking default_source (legacy)...");
      if (typeof customer.default_source === "string") {
        // This could be a card or bank account
        // For now, we'll skip this as it's legacy
        console.log("⚠️ default_source is a string (legacy), skipping");
      }
    }

    // No payment method found
    if (!paymentMethod) {
      console.log("❌ No payment method found for customer");
      return { hasCard: false, isExpired: false, isValid: false };
    }

    console.log("✅ Payment method found:", {
      id: paymentMethod.id,
      type: paymentMethod.type,
    });

    // Check if it's a card type
    if (paymentMethod.type !== "card" || !paymentMethod.card) {
      console.log("❌ Payment method is not a card:", paymentMethod.type);
      return { hasCard: false, isExpired: false, isValid: false };
    }

    const card = paymentMethod.card;

    // Check if card is expired
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const isExpired =
      card.exp_year < currentYear ||
      (card.exp_year === currentYear && card.exp_month < currentMonth);

    console.log("✅ Card found:", {
      brand: card.brand,
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
      isExpired,
    });

    return {
      hasCard: true,
      brand: card.brand,
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
      isExpired,
      isValid: !isExpired,
      paymentMethodId: paymentMethod.id,
    };
  } catch (error: any) {
    console.error("❌ Error getting customer card info:", {
      message: error.message,
      type: error.type,
      code: error.code,
      customerId,
    });
    return { hasCard: false, isExpired: false, isValid: false };
  }
}

/**
 * Charge customer's card
 */
export async function chargeCustomerCard({
  customerId,
  amount,
  description,
  metadata,
}: {
  customerId: string;
  amount: number;
  description: string;
  metadata: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  console.log("💳 Attempting to charge card:", {
    customerId,
    amount,
    description,
  });

  try {
    // Validate inputs
    if (!customerId || !customerId.startsWith("cus_")) {
      throw new Error("Invalid customer ID format");
    }

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // Get customer to verify they exist
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      throw new Error("Customer account has been deleted");
    }

    console.log("✅ Customer found:", customer.id);

    // Find a payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
      limit: 1,
    });

    if (paymentMethods.data.length === 0) {
      throw new Error("No payment method found for customer");
    }

    const paymentMethodId = paymentMethods.data[0].id;
    console.log("✅ Using payment method:", paymentMethodId);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      description,
      metadata,
    });

    console.log("✅ Payment intent created:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
    });

    if (paymentIntent.status === "requires_action") {
      throw new Error("Payment requires additional authentication");
    }

    if (paymentIntent.status === "requires_payment_method") {
      throw new Error("Payment method declined");
    }

    return paymentIntent;
  } catch (error: any) {
    console.error("❌ Error charging customer card:", {
      message: error.message,
      type: error.type,
      code: error.code,
      decline_code: error.decline_code,
      customerId,
    });

    // Provide user-friendly error messages
    if (error.type === "StripeCardError") {
      const declineCode = error.decline_code || "generic_decline";
      const friendlyMessages: Record<string, string> = {
        insufficient_funds: "Card declined: Insufficient funds",
        card_declined: "Card was declined by your bank",
        expired_card: "Card has expired",
        incorrect_cvc: "Incorrect CVC code",
        processing_error: "Processing error occurred",
        generic_decline: "Card was declined",
      };
      throw new Error(friendlyMessages[declineCode] || error.message);
    } else if (error.type === "StripeInvalidRequestError") {
      throw new Error(`Invalid request: ${error.message}`);
    } else if (error.type === "StripeAuthenticationError") {
      throw new Error("Stripe authentication failed. Check your API keys.");
    } else if (error.type === "StripeRateLimitError") {
      throw new Error("Too many requests. Please try again in a moment.");
    } else {
      throw new Error(error.message || "Failed to charge card");
    }
  }
}
