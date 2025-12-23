# Multi-City Stripe Implementation Guide

## Overview

This guide documents how to implement support for multiple Stripe accounts (one per city) in the **front-facing registration site**. This allows payments to be automatically separated by city.

**Cities:** Brampton, Mississauga, Markham, Burlington, Vaughan

---

## Architecture Summary

### Current (Single Stripe Account)
```
User registers →
  Create checkout session with main Stripe →
    Webhook from main Stripe →
      Process payment
```

### New (Multi-City Stripe Accounts)
```
User registers →
  Select city/division →
    Get city's Stripe account →
      Create checkout session with city's Stripe →
        Webhook from city's Stripe →
          Identify city by priceId →
            Verify with city's webhook secret →
              Process payment
```

---

## Phase 1: Environment Variables

### Add to `.env`:

```env
# Main/Legacy Stripe (keep for existing subscriptions)
STRIPE_SECRET_KEY=sk_live_xxx_main_account
STRIPE_WEBHOOK_SECRET=whsec_xxx_main_account

# Brampton Stripe
STRIPE_SECRET_KEY_BRAMPTON=sk_live_xxx
STRIPE_PUBLISHABLE_KEY_BRAMPTON=pk_live_xxx
STRIPE_WEBHOOK_SECRET_BRAMPTON=whsec_xxx

# Mississauga Stripe
STRIPE_SECRET_KEY_MISSISSAUGA=sk_live_xxx
STRIPE_PUBLISHABLE_KEY_MISSISSAUGA=pk_live_xxx
STRIPE_WEBHOOK_SECRET_MISSISSAUGA=whsec_xxx

# Markham Stripe
STRIPE_SECRET_KEY_MARKHAM=sk_live_xxx
STRIPE_PUBLISHABLE_KEY_MARKHAM=pk_live_xxx
STRIPE_WEBHOOK_SECRET_MARKHAM=whsec_xxx

# Burlington Stripe
STRIPE_SECRET_KEY_BURLINGTON=sk_live_xxx
STRIPE_PUBLISHABLE_KEY_BURLINGTON=pk_live_xxx
STRIPE_WEBHOOK_SECRET_BURLINGTON=whsec_xxx

# Vaughan Stripe
STRIPE_SECRET_KEY_VAUGHAN=sk_live_xxx
STRIPE_PUBLISHABLE_KEY_VAUGHAN=pk_live_xxx
STRIPE_WEBHOOK_SECRET_VAUGHAN=whsec_xxx
```

---

## Phase 2: Data Models

### City Model (Reference from Admin)

Ensure your City model matches the admin site:

```typescript
interface ICity {
  cityName: string; // "Brampton", "Mississauga", etc.
  stripeAccountId?: string; // Optional - "acct_xxx" for reference
  region: string;
  country: string;
  timezone: string;
  active: boolean;
  // ... other fields
}
```

### Price Model (Reference from Admin)

Ensure your Price model matches the admin site:

```typescript
interface IPrice {
  name: string;
  priceId: string; // Stripe price ID (unique per city's account)
  city?: ObjectId; // Reference to City (optional for backward compatibility)
  amount: number;
  type: 'earlyBird' | 'regular' | 'installment' | 'regularInstallment' | 'firstInstallment' | 'free';
  // ... other fields
}
```

### Division Model

Ensure Division has city reference (you likely already have this):

```typescript
interface IDivision {
  divisionName: string;
  city: ObjectId; // Reference to City
  prices: {
    earlyBird?: ObjectId;
    regular?: ObjectId;
    installment?: ObjectId;
    regularInstallment?: ObjectId;
    firstInstallment?: ObjectId;
  };
  // ... other fields
}
```

---

## Phase 3: Helper Service (Optional but Recommended)

Create a helper service to get the correct Stripe instance.

### Create: `lib/services/stripe-city-helper.ts`

```typescript
import Stripe from 'stripe';
import City from '@/models/City';
import Division from '@/models/Division';
import Player from '@/models/Player';

// Cache Stripe instances for performance
const stripeInstances = new Map<string, Stripe>();

/**
 * Get Stripe instance for a specific city
 */
export async function getStripeForCity(cityId: string): Promise<Stripe> {
  const city = await City.findById(cityId);

  if (!city) {
    throw new Error(`City not found: ${cityId}`);
  }

  const cacheKey = city.cityName.toUpperCase();

  // Return cached instance if available
  if (stripeInstances.has(cacheKey)) {
    return stripeInstances.get(cacheKey)!;
  }

  // Get Stripe key for this city
  const stripeKey = process.env[`STRIPE_SECRET_KEY_${cacheKey}`];

  if (!stripeKey) {
    throw new Error(`No Stripe key configured for city: ${city.cityName}`);
  }

  // Create and cache Stripe instance
  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-09-30.clover',
  });

  stripeInstances.set(cacheKey, stripe);

  return stripe;
}

/**
 * Get Stripe instance for a division (via city)
 */
export async function getStripeForDivision(divisionId: string): Promise<Stripe> {
  const division = await Division.findById(divisionId).populate('city');

  if (!division?.city) {
    throw new Error(`Division not found or has no city: ${divisionId}`);
  }

  return getStripeForCity(division.city._id);
}

/**
 * Get Stripe instance for a player (via division -> city)
 */
export async function getStripeForPlayer(playerId: string): Promise<Stripe> {
  const player = await Player.findById(playerId).populate({
    path: 'division',
    populate: { path: 'city' }
  });

  if (!player?.division?.city) {
    throw new Error(`Player not found or has no city: ${playerId}`);
  }

  return getStripeForCity(player.division.city._id);
}

/**
 * Get webhook secret for a city
 */
export async function getWebhookSecretForCity(cityId: string): Promise<string> {
  const city = await City.findById(cityId);

  if (!city) {
    throw new Error(`City not found: ${cityId}`);
  }

  const webhookSecret = process.env[`STRIPE_WEBHOOK_SECRET_${city.cityName.toUpperCase()}`];

  if (!webhookSecret) {
    throw new Error(`No webhook secret configured for city: ${city.cityName}`);
  }

  return webhookSecret;
}
```

---

## Phase 4: Update Checkout Session Creation

### File: `/api/checkout-sessions/route.ts`

**Current code:**
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

**Updated code:**

```typescript
import { connectToDatabase } from "@/api-helpers/utils";
import User from "@/api-helpers/models/User";
import Price from "@/api-helpers/models/Price";
import Division from "@/api-helpers/models/Division";
import Stripe from "stripe";

export async function POST(req: Request) {
  await connectToDatabase();

  const { items, formObject, email } = await req.json();
  const parsedFormObject = JSON.parse(formObject);

  try {
    // ✅ STEP 1: Extract priceId from line items
    const priceId = items[0]?.price; // "price_brampton_xxx"

    if (!priceId) {
      throw new Error("No price ID provided");
    }

    console.log(`📍 Checkout request with priceId: ${priceId}`);

    // ✅ STEP 2: Look up which city owns this price
    const price = await Price.findOne({ priceId }).populate('city');

    if (!price || !price.city) {
      throw new Error(`Price not found or not associated with a city: ${priceId}`);
    }

    const city = price.city;
    console.log(`✅ Creating checkout for city: ${city.cityName}`);

    // ✅ STEP 3: Get city-specific Stripe instance
    const cityName = city.cityName.toUpperCase();
    const stripeKey = process.env[`STRIPE_SECRET_KEY_${cityName}`];

    if (!stripeKey) {
      throw new Error(`No Stripe key configured for city: ${city.cityName}`);
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-09-30.clover',
    });

    // ✅ STEP 4: Optional - Validate division matches price city
    const division = await Division.findById(parsedFormObject.division).populate('city');

    if (division.city._id.toString() !== city._id.toString()) {
      console.warn('⚠️ Warning: Price city does not match division city', {
        priceCity: city.cityName,
        divisionCity: division.city.cityName
      });
      // You can throw an error here if you want strict validation
      // throw new Error(`Price mismatch: Selected price is for ${city.cityName} but division is in ${division.city.cityName}`);
    }

    // ✅ STEP 5: Get or create customer (your existing code)
    let customerId;
    const existingUser = await User.findOne({ email: email });

    if (existingUser && existingUser.stripeCustomerId) {
      customerId = existingUser.stripeCustomerId;
    }

    // ✅ STEP 6: Create checkout session (your existing code)

    if (parsedFormObject.payment === "full") {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: items ?? [],
        success_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}success/${parsedFormObject.division}`,
        cancel_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}register`,
        automatic_tax: { enabled: true },
        payment_intent_data: {
          setup_future_usage: "off_session",
        },
        metadata: { formObject },
        ...(customerId && { customer: customerId }),
        ...(!customerId && {
          customer_creation: "always",
          customer_email: email,
        }),
      });

      return NextResponse.json({ session }, { status: 200 });
    } else {
      // Subscription/installment
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: items ?? [],
        success_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}success/${parsedFormObject.division}`,
        cancel_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}register`,
        automatic_tax: { enabled: true },
        metadata: { formObject },
      });

      return NextResponse.json({ session }, { status: 200 });
    }
  } catch (error) {
    console.error("Error during checkout session creation:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Key changes:**
1. **Extract priceId** from line items
2. **Look up Price** → get city
3. **Use price's city** to get Stripe key (not division's city)
4. **Validate** price city matches division city (optional)
5. **priceId is source of truth** for which Stripe account to use

**Why this is better:**
- ✅ Prevents account mismatches
- ✅ PriceId determines which Stripe account
- ✅ Consistent with webhook routing
- ✅ Safer - Stripe accepts priceId from its own account

---

## Phase 5: Create New City Webhook Handler (RECOMMENDED APPROACH)

### Strategy: Two Separate Webhook Endpoints

**Keep existing webhook unchanged** for legacy subscriptions, create new endpoint for city accounts.

---

### A. Keep Old Webhook (NO CHANGES) ✅

**File: `/api/webhook/route.ts`**

**DO NOT MODIFY THIS FILE** - Keep it exactly as is to handle legacy subscriptions.

```typescript
// /api/webhook/route.ts
// ✅ KEEP THIS FILE UNCHANGED - Handles legacy main Stripe account

import { NextResponse } from "next/server";
import Stripe from "stripe";
// ... your existing imports

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: Request) {
  await connectToDatabase();

  let event: Stripe.Event;

  try {
    const body = await req.text();
    const signature = req.headers.get("Stripe-Signature");

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // ✅ ALL YOUR EXISTING WEBHOOK HANDLERS - UNCHANGED

  if (event.type === "checkout.session.completed") {
    // ... existing code
  }

  if (event.type === "invoice.payment_failed") {
    // ... existing code
  }

  if (event.type === "invoice.payment_succeeded") {
    // ... existing code
  }

  return NextResponse.json({ received: true });
}
```

---

### B. Create New City Webhook ✨

**File: `/app/api/webhook/stripe/webhook-cities/route.ts` (NEW FILE)**

**URL will be:** `https://www.riseupleague.com/api/webhook/stripe/webhook-cities`

Create this new file to handle webhooks from all 5 city accounts.

```typescript
// /api/webhook-cities/route.ts
// ✅ NEW FILE - Handles webhooks from all 5 city Stripe accounts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/api-helpers/utils";
import Price from "@/models/Price";
import Player from "@/models/Player";
import User from "@/models/User";
import Division from "@/models/Division";
// ... other imports (same as your original webhook file)

/**
 * Extract priceId from webhook event to identify which city
 */
function extractPriceId(eventData: any): string | null {
  try {
    const obj = eventData.data.object;

    // For checkout.session.completed
    if (eventData.type === "checkout.session.completed") {
      if (obj.line_items?.data?.[0]?.price?.id) {
        return obj.line_items.data[0].price.id;
      }
    }

    // For invoice events (installments)
    if (eventData.type.startsWith("invoice.")) {
      if (obj.lines?.data?.[0]?.price?.id) {
        return obj.lines.data[0].price.id;
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting priceId:", error);
    return null;
  }
}

export async function POST(req: Request) {
  await connectToDatabase();

  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature")!;

  let event: Stripe.Event;
  let city: any;

  try {
    // Step 1: Parse the raw event (not verified yet)
    const rawEvent = JSON.parse(body);

    // Step 2: Extract priceId to identify which city
    const priceId = extractPriceId(rawEvent);

    if (!priceId) {
      throw new Error("Could not extract priceId from webhook event");
    }

    console.log(`📍 Webhook received with priceId: ${priceId}`);

    // Step 3: Look up which city owns this price
    const price = await Price.findOne({ priceId }).populate('city');

    if (!price?.city) {
      throw new Error(`No city found for priceId: ${priceId}`);
    }

    city = price.city;
    console.log(`✅ Identified city: ${city.cityName}`);

    // Step 4: Get city-specific Stripe credentials
    const cityName = city.cityName.toUpperCase();
    const stripeKey = process.env[`STRIPE_SECRET_KEY_${cityName}`];
    const webhookSecret = process.env[`STRIPE_WEBHOOK_SECRET_${cityName}`];

    if (!stripeKey || !webhookSecret) {
      throw new Error(`Stripe config missing for city: ${city.cityName}`);
    }

    // Step 5: Verify webhook signature with city's secret
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-09-30.clover',
    });

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`✅ Webhook verified for ${city.cityName}: ${event.type}`);

  } catch (err: any) {
    console.error("❌ City webhook verification failed:", err.message);
    return NextResponse.json(
      { message: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // ✅ PROCESS EVENT - Copy your existing webhook logic here

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = JSON.parse(session.metadata.formObject);

    console.log(`💰 Payment received for city: ${city.cityName}`);

    // ✅ YOUR EXISTING REGISTRATION LOGIC
    // Copy from your existing /api/webhook handler
    // ... handle free agent registration
    // ... handle create team registration
    // ... handle join team registration

  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;

    console.log(`❌ Installment failed for city: ${city.cityName}`);

    // ✅ YOUR EXISTING FAILED PAYMENT LOGIC
    // Copy from your existing /api/webhook handler

  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object;

    console.log(`✅ Installment succeeded for city: ${city.cityName}`);

    // ✅ YOUR EXISTING SUCCESS PAYMENT LOGIC
    // Copy from your existing /api/webhook handler

  }

  // Return success
  return NextResponse.json({ received: true });
}
```

**Key Points:**
- New file handles ALL 5 city accounts
- Uses priceId to identify which city
- Verifies with correct city's webhook secret
- **Copy your existing webhook business logic** from `/api/webhook`
- Old webhook remains unchanged for legacy subscriptions

---

## Phase 6: Stripe Dashboard Configuration

You need to configure webhooks in **6 Stripe accounts total** (1 legacy + 5 cities).

---

### A. Legacy Main Account Webhook (Keep Existing) ✅

**If you already have a webhook configured in your main/old account:**
- **Keep it as is** - Do not change URL or settings
- **URL should be:** `https://www.riseupleague.com/api/webhook`
- This handles existing subscriptions until they complete

**If you don't have one yet:**
1. Log into your main/old Stripe account
2. Go to: Developers → Webhooks → Add Endpoint
3. **URL:** `https://www.riseupleague.com/api/webhook`
4. **Events:** `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`
5. Copy webhook secret → Add to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxx_main_account
   ```

---

### B. City Account Webhooks (New) ✨

For **each of your 5 city Stripe accounts**, add a NEW webhook endpoint:

#### 1. Brampton Stripe Account

**Login:** Log into Brampton's Stripe account

**Configure:**
1. Go to: Developers → Webhooks
2. Click "Add Endpoint"
3. **URL:** `https://www.riseupleague.com/api/webhook/stripe/webhook-cities` ⚠️ Note: Different endpoint!
4. **Description:** "City Registrations - Brampton"

**Select Events:**
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Copy Secret:**
- Webhook signing secret will look like: `whsec_xxx`
- Add to your `.env`:
  ```env
  STRIPE_WEBHOOK_SECRET_BRAMPTON=whsec_xxx
  ```

#### 2. Repeat for Other Cities

**Mississauga:**
- URL: `https://www.riseupleague.com/api/webhook/stripe/webhook-cities`
- Secret → `STRIPE_WEBHOOK_SECRET_MISSISSAUGA=whsec_yyy`

**Markham:**
- URL: `https://www.riseupleague.com/api/webhook/stripe/webhook-cities`
- Secret → `STRIPE_WEBHOOK_SECRET_MARKHAM=whsec_zzz`

**Burlington:**
- URL: `https://www.riseupleague.com/api/webhook/stripe/webhook-cities`
- Secret → `STRIPE_WEBHOOK_SECRET_BURLINGTON=whsec_aaa`

**Vaughan:**
- URL: `https://www.riseupleague.com/api/webhook/stripe/webhook-cities`
- Secret → `STRIPE_WEBHOOK_SECRET_VAUGHAN=whsec_bbb`

---

### Summary of Webhook Configuration:

| Stripe Account | Webhook URL | Environment Variable |
|----------------|-------------|----------------------|
| **Main/Legacy** | `https://www.riseupleague.com/api/webhook` | `STRIPE_WEBHOOK_SECRET` |
| **Brampton** | `https://www.riseupleague.com/api/webhook/stripe/webhook-cities` | `STRIPE_WEBHOOK_SECRET_BRAMPTON` |
| **Mississauga** | `https://www.riseupleague.com/api/webhook/stripe/webhook-cities` | `STRIPE_WEBHOOK_SECRET_MISSISSAUGA` |
| **Markham** | `https://www.riseupleague.com/api/webhook/stripe/webhook-cities` | `STRIPE_WEBHOOK_SECRET_MARKHAM` |
| **Burlington** | `https://www.riseupleague.com/api/webhook/stripe/webhook-cities` | `STRIPE_WEBHOOK_SECRET_BURLINGTON` |
| **Vaughan** | `https://www.riseupleague.com/api/webhook/stripe/webhook-cities` | `STRIPE_WEBHOOK_SECRET_VAUGHAN` |

**Result:**
- Old subscriptions → `/api/webhook` (legacy)
- New registrations → `/api/webhook/stripe/webhook-cities` (cities)
- Both endpoints running simultaneously
- Zero risk to existing subscriptions

---

## Phase 7: Testing

### Test with Stripe Test Mode

1. **Create test accounts for each city** in Stripe test mode
2. **Add test keys** to environment variables (use `_TEST` suffix)
3. **Test registration flow:**
   - Select each city/division
   - Complete checkout
   - Verify webhook received
   - Check payment went to correct Stripe account
4. **Test installments:**
   - Register with installment plan
   - Use Stripe CLI to trigger `invoice.payment_succeeded`
   - Verify webhook routing works

### Stripe CLI Testing

```bash
# Listen to legacy webhook locally
stripe listen --forward-to localhost:3000/api/webhook

# Listen to city webhook locally
stripe listen --forward-to localhost:3000/api/webhook/stripe/webhook-cities

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
```

---

## Phase 8: Deployment Checklist

### Before Deployment:
- [ ] All environment variables added for 5 cities
- [ ] Models updated (City, Price)
- [ ] Helper service created
- [ ] Checkout session creation updated
- [ ] Webhook handler updated
- [ ] Tested in Stripe test mode
- [ ] Legacy main account support confirmed working

### After Deployment:
- [ ] Configure webhooks in all 5 city Stripe dashboards
- [ ] Test one registration per city in production
- [ ] Monitor webhook delivery in Stripe dashboard
- [ ] Monitor application logs for errors
- [ ] Verify payments appear in correct city accounts

### Monitoring:
- [ ] Set up alerts for webhook failures
- [ ] Track which account type (legacy vs city) in logs
- [ ] Monitor remaining legacy subscriptions

---

## Migration Timeline

### Week 1: Setup
- Add environment variables
- Update code
- Test in development

### Week 2: Deploy
- Deploy to production
- Configure Stripe webhooks
- Monitor closely

### Weeks 3-12: Transition Period
- New registrations go to city accounts
- Legacy subscriptions continue in main account
- Monitor both systems

### After All Legacy Subscriptions Complete:
- Remove legacy fallback code
- Archive main Stripe account
- Clean up environment variables

---

## Troubleshooting

### Webhook Verification Fails
**Problem:** Webhook signature verification error

**Solutions:**
1. Check webhook secret matches Stripe dashboard
2. Verify environment variable name matches city name
3. Check that priceId exists in Price model with city reference
4. Check Stripe API version matches

### Wrong Stripe Account Used
**Problem:** Payment goes to wrong city's account

**Solutions:**
1. Verify division has correct city reference
2. Check priceId belongs to correct city
3. Verify environment variable mapping

### Legacy Subscriptions Not Working
**Problem:** Existing installments failing

**Solutions:**
1. Verify legacy fallback logic in webhook handler
2. Check main account webhook secret still valid
3. Ensure priceId lookup returns null for old prices

---

## Support

If you need help:
1. Check application logs for specific errors
2. Check Stripe dashboard webhook logs
3. Verify environment variables are correct
4. Test with Stripe CLI to isolate issue

---

## Summary

**Key Points:**
- ✅ Each city has its own Stripe account
- ✅ Division determines which city's Stripe to use
- ✅ PriceId identifies which city sent webhook
- ✅ Legacy main account continues for existing subscriptions
- ✅ All new registrations go to city accounts
- ✅ Gradual migration over several weeks/months

**What Changes:**
- Checkout session creation: Get city-specific Stripe
- Webhook handler: Identify city and verify with correct secret

**What Stays the Same:**
- All business logic
- Database models (just add optional fields)
- User experience
- Payment flows

Good luck with implementation! 🚀
