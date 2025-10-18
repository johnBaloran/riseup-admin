// src/lib/services/stripe-terminal-service.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Stripe Terminal operations ONLY
 */

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
});

/**
 * Terminal Reader Types
 */
export interface TerminalReader {
  id: string;
  object: "terminal.reader";
  label: string;
  status: "online" | "offline";
  device_type: string;
  serial_number: string;
  ip_address?: string;
  location?: string;
}

export interface RegisterReaderInput {
  registrationCode: string;
  label: string;
  location?: string;
}

export interface ProcessPaymentInput {
  readerId: string;
  amountInCents: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  paymentIntentId: string;
  status: string;
  amount: number;
  chargeId?: string;
  cardBrand?: string;
  cardLast4?: string;
  receiptUrl?: string;
  authorizationCode?: string;
}

/**
 * Create a connection token for Terminal SDK
 * (Used if we switch to client-side SDK integration)
 */
export async function createConnectionToken(): Promise<{ secret: string }> {
  const connectionToken = await stripe.terminal.connectionTokens.create();
  return { secret: connectionToken.secret };
}

/**
 * Register a new terminal reader programmatically
 */
export async function registerTerminalReader(
  input: RegisterReaderInput
): Promise<TerminalReader> {
  const reader = await stripe.terminal.readers.create({
    registration_code: input.registrationCode,
    label: input.label,
    location: input.location,
  });

  return {
    id: reader.id,
    object: reader.object,
    label: reader.label || "",
    status: reader.status as "online" | "offline",
    device_type: reader.device_type,
    serial_number: reader.serial_number || "",
    ip_address: reader.ip_address || undefined,
    location: reader.location as string | undefined,
  };
}

/**
 * List all registered terminal readers
 */
export async function listTerminalReaders(
  limit: number = 100
): Promise<TerminalReader[]> {
  const readers = await stripe.terminal.readers.list({ limit });

  return readers.data.map((reader) => ({
    id: reader.id,
    object: reader.object,
    label: reader.label || "",
    status: reader.status as "online" | "offline",
    device_type: reader.device_type,
    serial_number: reader.serial_number || "",
    ip_address: reader.ip_address || undefined,
    location: reader.location as string | undefined,
  }));
}

/**
 * Get a specific terminal reader by ID
 */
export async function getTerminalReader(
  readerId: string
): Promise<TerminalReader | null> {
  try {
    const reader = await stripe.terminal.readers.retrieve(readerId);

    // Type guard - check if reader was deleted
    if ('deleted' in reader && reader.deleted) {
      return null;
    }

    return {
      id: reader.id,
      object: reader.object,
      label: (reader as any).label || "",
      status: (reader as any).status as "online" | "offline",
      device_type: (reader as any).device_type,
      serial_number: (reader as any).serial_number || "",
      ip_address: (reader as any).ip_address || undefined,
      location: (reader as any).location as string | undefined,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Delete/unregister a terminal reader
 */
export async function deleteTerminalReader(readerId: string): Promise<boolean> {
  try {
    await stripe.terminal.readers.del(readerId);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Process a payment on a terminal reader
 * Server-driven integration
 */
export async function processTerminalPayment(
  input: ProcessPaymentInput
): Promise<PaymentResult> {
  // Step 1: Create Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: input.amountInCents,
    currency: input.currency || "cad",
    payment_method_types: ["card_present"],
    capture_method: "automatic",
    description: input.description,
    metadata: input.metadata || {},
    payment_method_options: {
      card_present: {
        request_extended_authorization: false,
        request_incremental_authorization_support: false,
      },
    },
  });

  // Step 2: Process on Terminal Reader
  const processedPayment = await stripe.terminal.readers.processPaymentIntent(
    input.readerId,
    {
      payment_intent: paymentIntent.id,
      process_config: {
        skip_tipping: true,
        enable_customer_cancellation: true,
      },
    }
  );

  // Step 3: Return initial result (payment may still be processing)
  return {
    paymentIntentId: paymentIntent.id,
    status: processedPayment.action?.status || "processing",
    amount: paymentIntent.amount,
  };
}

/**
 * Get payment intent details
 * Used to check status and get card details after processing
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<PaymentResult> {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const charge = paymentIntent.latest_charge
    ? await stripe.charges.retrieve(paymentIntent.latest_charge as string)
    : null;

  const paymentMethodDetails = charge?.payment_method_details?.card_present as any;

  return {
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    chargeId: charge?.id ?? undefined,
    cardBrand: paymentMethodDetails?.brand ?? undefined,
    cardLast4: paymentMethodDetails?.last4 ?? undefined,
    receiptUrl: charge?.receipt_url ?? undefined,
    authorizationCode: paymentMethodDetails?.authorization_code ?? undefined,
  };
}

/**
 * Cancel a payment intent in progress
 */
export async function cancelTerminalPayment(
  paymentIntentId: string
): Promise<boolean> {
  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Cancel an ongoing reader action
 */
export async function cancelReaderAction(readerId: string): Promise<boolean> {
  try {
    await stripe.terminal.readers.cancelAction(readerId);
    return true;
  } catch (error) {
    return false;
  }
}
