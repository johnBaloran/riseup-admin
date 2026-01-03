# Installment Payment System Implementation Guide

## Overview

This document outlines the complete implementation of a **dynamic installment payment system** that calculates payment amounts based on when a user registers relative to fixed payment dates.

---

## System Features

✅ Fixed payment dates (admin-configured)
✅ Dynamic payment amounts based on registration timing
✅ Earlier registration = lower per-payment amounts
✅ Single down payment price ($50)
✅ Fixed premium fee per division
✅ Coupon codes apply to down payment only
✅ Automatic charging via cron job
✅ Legal agreement required
✅ Spot limits and cutoff dates

---

## Pricing Structure

### Example Calculations

**Division Settings:**
- Early Bird Price: $240
- Regular Price: $280
- Premium Fee: $24
- Down Payment: $50
- Payment Dates: 8 weekly dates (Feb 1, 8, 15, 22, Mar 1, 8, 15, 22)

**Early Bird Total:** $240 + $24 = $264

### Registration Scenarios

| Register Date | Dates Remaining | Per Payment | Total Payments |
|--------------|-----------------|-------------|----------------|
| Jan 1        | 8 dates         | $26.75      | $50 + (8 × $26.75) = $264 |
| Feb 5        | 7 dates         | $30.57      | $50 + (7 × $30.57) = $264 |
| Feb 10       | 6 dates         | $35.67      | $50 + (6 × $35.67) = $264 |
| Feb 17       | 5 dates         | $42.80      | $50 + (5 × $42.80) = $264 |
| Feb 24       | 4 dates         | $53.50      | $50 + (4 × $53.50) = $264 |
| Mar 3        | 3 dates         | $71.33      | $50 + (3 × $71.33) = $264 |
| Mar 10       | 2 dates         | $107.00     | $50 + (2 × $107) = $264 |
| Mar 16       | 1 date          | ❌ Full payment only |

---

## Architecture

### Key Components

1. **Admin Site** - Configure divisions, view payments
2. **Front-Facing Site** - User registration, checkout
3. **Database** - Store payment schedules
4. **Stripe** - Process payments
5. **Cron Job** - Auto-charge installments

### Data Flow

```
User Registers
    ↓
System calculates remaining payment dates
    ↓
Checkout session (down payment)
    ↓
Webhook saves payment method + schedule
    ↓
Database stores scheduled payments
    ↓
Cron job charges on payment dates
```

---

## Phase-by-Phase Implementation

---

## PHASE 1: Database Models (Admin Site)

### 1.1 Update Division Model

**File:** `/src/models/Division.ts`

**Add to IDivision interface:**

```typescript
export interface IPaymentSchedule {
  downPayment: mongoose.Types.ObjectId;     // Reference to $50 Price
  premiumAmount: number;                    // e.g., $24
  installmentDates: Date[];                 // Fixed payment dates
  minimumPaymentsRequired: number;          // e.g., 2
  maxInstallmentSpots?: number;             // e.g., 30 (optional)
  installmentSpotsUsed?: number;            // Track usage (optional)
  latePaymentFee?: number;                  // e.g., $25 (optional)
}

export interface IDivision extends mongoose.Document {
  // ... existing fields

  // UPDATE EXISTING prices object - add downPayment
  prices: {
    earlyBird?: mongoose.Types.ObjectId;
    regular?: mongoose.Types.ObjectId;
    installment?: mongoose.Types.ObjectId;          // DEPRECATED
    regularInstallment?: mongoose.Types.ObjectId;   // DEPRECATED
    firstInstallment?: mongoose.Types.ObjectId;     // DEPRECATED
    free?: mongoose.Types.ObjectId;
  };

  // NEW: Payment schedule configuration
  paymentSchedule?: IPaymentSchedule;
}
```

**Add schema definition:**

```typescript
const paymentScheduleSchema = new Schema<IPaymentSchedule>(
  {
    downPayment: {
      type: Schema.Types.ObjectId,
      ref: "Price",
      required: true,
    },
    premiumAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    installmentDates: {
      type: [Date],
      required: true,
      validate: {
        validator: function(dates: Date[]) {
          return dates.length >= 2;
        },
        message: 'Must have at least 2 installment dates',
      },
    },
    minimumPaymentsRequired: {
      type: Number,
      required: true,
      default: 2,
      min: 1,
    },
    maxInstallmentSpots: {
      type: Number,
      min: 1,
    },
    installmentSpotsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    latePaymentFee: {
      type: Number,
      default: 25,
      min: 0,
    },
  },
  { _id: false }
);

// Add to divisionSchema
const divisionSchema = new Schema<IDivision>(
  {
    // ... existing fields

    paymentSchedule: {
      type: paymentScheduleSchema,
    },
  },
  {
    timestamps: true,
  }
);
```

---

### 1.2 Update Price Model

**File:** `/src/models/Price.ts`

**Update type enum:**

```typescript
export interface IPrice extends mongoose.Document {
  name: string;
  priceId: string;
  city?: mongoose.Types.ObjectId;
  amount: number;
  type:
    | "earlyBird"
    | "regular"
    | "installment"           // DEPRECATED
    | "regularInstallment"    // DEPRECATED
    | "firstInstallment"      // DEPRECATED
    | "downPayment"           // NEW
    | "free";
  createdAt: Date;
  updatedAt: Date;
}

// Update schema enum
const priceSchema = new Schema<IPrice>(
  {
    // ... existing fields

    type: {
      type: String,
      enum: [
        "earlyBird",
        "regular",
        "installment",          // Keep for backward compatibility
        "regularInstallment",   // Keep for backward compatibility
        "firstInstallment",     // Keep for backward compatibility
        "downPayment",          // NEW
        "free",
      ],
      required: [true, "Price type is required"],
    },
  },
  {
    timestamps: true,
  }
);
```

---

### 1.3 Update PaymentMethod Model

**File:** `/src/models/PaymentMethod.ts` (or create if doesn't exist)

**Add scheduled payment tracking:**

```typescript
import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IScheduledPayment {
  dueDate: Date;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  attemptCount: number;
  stripeChargeId?: string;
  paidAt?: Date;
  lastError?: string;
  lastAttemptAt?: Date;
}

const scheduledPaymentSchema = new Schema<IScheduledPayment>(
  {
    dueDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    attemptCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    stripeChargeId: String,
    paidAt: Date,
    lastError: String,
    lastAttemptAt: Date,
  },
  { _id: false }
);

export interface IPaymentMethod extends mongoose.Document {
  player: mongoose.Types.ObjectId;
  division: mongoose.Types.ObjectId;
  paymentType: "FULL_PAYMENT" | "INSTALLMENTS";
  pricingTier: "EARLY_BIRD" | "REGULAR";
  originalPrice: number;
  amountPaid: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";

  // Stripe details
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  stripeSessionId?: string;

  // Installment-specific fields
  scheduledPayments?: IScheduledPayment[];

  // Metadata
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    player: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["FULL_PAYMENT", "INSTALLMENTS"],
      required: true,
    },
    pricingTier: {
      type: String,
      enum: ["EARLY_BIRD", "REGULAR"],
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    stripeCustomerId: String,
    stripePaymentMethodId: String,
    stripeSessionId: String,
    scheduledPayments: [scheduledPaymentSchema],
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentMethodSchema.index({ player: 1, division: 1 });
paymentMethodSchema.index({ status: 1 });
paymentMethodSchema.index({ "scheduledPayments.dueDate": 1, "scheduledPayments.status": 1 });

export default (mongoose.models.PaymentMethod as mongoose.Model<IPaymentMethod>) ||
  mongoose.model<IPaymentMethod>("PaymentMethod", paymentMethodSchema);
```

---

### 1.4 Update Player Model (Optional)

**File:** `/src/models/Player.ts`

**Add installment agreement tracking:**

```typescript
export interface IPlayer extends mongoose.Document {
  // ... existing fields

  // NEW: Installment agreement
  agreedToInstallmentTerms?: boolean;
  installmentTermsAgreedAt?: Date;
  installmentTermsVersion?: string;  // e.g., "v1.0"
}

const playerSchema = new Schema<IPlayer>(
  {
    // ... existing fields

    agreedToInstallmentTerms: {
      type: Boolean,
      default: false,
    },
    installmentTermsAgreedAt: Date,
    installmentTermsVersion: String,
  },
  {
    timestamps: true,
  }
);
```

---

## PHASE 2: Admin UI - Division Configuration

### 2.1 Update Division Creation Form

**File:** `/src/components/features/league/divisions/CreateDivisionForm.tsx`

**Add installment settings section:**

```typescript
// Add state
const [installmentEnabled, setInstallmentEnabled] = useState(false);
const [installmentDates, setInstallmentDates] = useState<Date[]>([]);
const [downPaymentPrice, setDownPaymentPrice] = useState<string>("");
const [premiumAmount, setPremiumAmount] = useState<number>(24);
const [minimumPayments, setMinimumPayments] = useState<number>(2);

// Filter down payment prices
const downPaymentPrices = useMemo(() => {
  return prices.filter((p) => p.type === "downPayment");
}, [prices]);

// Add to form JSX after Pricing card
```

**Add installment settings card:**

```tsx
{/* Installment Plan Settings */}
<Card>
  <CardHeader>
    <CardTitle>Installment Plan Settings (Optional)</CardTitle>
    <p className="text-sm text-gray-600">
      Configure payment plans with fixed payment dates
    </p>
  </CardHeader>
  <CardContent className="space-y-6">
    <div className="flex items-center space-x-2">
      <Checkbox
        id="installmentEnabled"
        checked={installmentEnabled}
        onCheckedChange={(checked) => setInstallmentEnabled(checked as boolean)}
        disabled={isLoading}
      />
      <label
        htmlFor="installmentEnabled"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Enable Installment Plans
      </label>
    </div>

    {installmentEnabled && (
      <>
        {/* Down Payment Price */}
        <div>
          <Label htmlFor="downPayment">Down Payment Price *</Label>
          <Select
            value={downPaymentPrice}
            onValueChange={(value) => setDownPaymentPrice(value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select down payment price" />
            </SelectTrigger>
            <SelectContent>
              {downPaymentPrices.map((price) => (
                <SelectItem key={price._id} value={price._id}>
                  ${price.amount.toFixed(2)} - {price.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Same price for both early bird and regular
          </p>
        </div>

        {/* Premium Amount */}
        <div>
          <Label htmlFor="premiumAmount">Premium Fee</Label>
          <Input
            id="premiumAmount"
            type="number"
            step="0.01"
            min="0"
            value={premiumAmount}
            onChange={(e) => setPremiumAmount(parseFloat(e.target.value) || 0)}
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Flat fee added to installment total (e.g., $24)
          </p>
        </div>

        {/* Payment Dates */}
        <div>
          <Label>Payment Dates *</Label>
          <div className="space-y-2 mt-2">
            {installmentDates.map((date, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="date"
                  value={format(date, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDates = [...installmentDates];
                    newDates[index] = new Date(e.target.value);
                    setInstallmentDates(newDates);
                  }}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newDates = installmentDates.filter((_, i) => i !== index);
                    setInstallmentDates(newDates);
                  }}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setInstallmentDates([...installmentDates, new Date()])}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Date
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Minimum {minimumPayments} dates required
          </p>
        </div>

        {/* Minimum Payments */}
        <div>
          <Label htmlFor="minimumPayments">Minimum Payments Required</Label>
          <Input
            id="minimumPayments"
            type="number"
            min="1"
            value={minimumPayments}
            onChange={(e) => setMinimumPayments(parseInt(e.target.value) || 2)}
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Cutoff when fewer dates remain
          </p>
        </div>

        {/* Preview */}
        {installmentDates.length > 0 && downPaymentPrice && (
          <InstallmentPreview
            earlyBirdPrice={watch("prices.earlyBird")}
            regularPrice={watch("prices.regular")}
            downPaymentPrice={downPaymentPrices.find(p => p._id === downPaymentPrice)}
            premiumAmount={premiumAmount}
            installmentDates={installmentDates}
            prices={prices}
          />
        )}
      </>
    )}
  </CardContent>
</Card>
```

---

### 2.2 Create Installment Preview Component

**File:** `/src/components/features/league/divisions/InstallmentPreview.tsx`

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface InstallmentPreviewProps {
  earlyBirdPrice: string;
  regularPrice: string;
  downPaymentPrice: any;
  premiumAmount: number;
  installmentDates: Date[];
  prices: any[];
}

export function InstallmentPreview({
  earlyBirdPrice,
  regularPrice,
  downPaymentPrice,
  premiumAmount,
  installmentDates,
  prices,
}: InstallmentPreviewProps) {
  const earlyBirdPriceObj = prices.find((p) => p._id === earlyBirdPrice);
  const regularPriceObj = prices.find((p) => p._id === regularPrice);

  if (!earlyBirdPriceObj || !regularPriceObj || !downPaymentPrice) {
    return null;
  }

  const calculateInstallment = (basePrice: number) => {
    const total = basePrice + premiumAmount;
    const remaining = total - downPaymentPrice.amount;
    const perPayment = remaining / installmentDates.length;
    return {
      total,
      perPayment: Math.round(perPayment * 100) / 100,
    };
  };

  const earlyBird = calculateInstallment(earlyBirdPriceObj.amount);
  const regular = calculateInstallment(regularPriceObj.amount);

  // Calculate for different registration scenarios
  const scenarios = [
    { weeks: installmentDates.length, label: `${installmentDates.length} dates` },
    { weeks: Math.floor(installmentDates.length * 0.75), label: `${Math.floor(installmentDates.length * 0.75)} dates` },
    { weeks: Math.floor(installmentDates.length * 0.5), label: `${Math.floor(installmentDates.length * 0.5)} dates` },
    { weeks: 2, label: "2 dates (minimum)" },
  ].filter(s => s.weeks >= 2);

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg">Installment Plan Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Early Bird Plan */}
        <div>
          <h4 className="font-medium mb-2">
            Early Bird Plan (${earlyBirdPriceObj.amount} + ${premiumAmount} premium)
          </h4>
          <div className="text-sm space-y-1 pl-4">
            <div>Down Payment: ${downPaymentPrice.amount.toFixed(2)}</div>
            <div>
              {installmentDates.length} × ${earlyBird.perPayment.toFixed(2)} ={" "}
              ${(earlyBird.perPayment * installmentDates.length).toFixed(2)}
            </div>
            <div className="font-medium">Total: ${earlyBird.total.toFixed(2)}</div>
          </div>
        </div>

        {/* Regular Plan */}
        <div>
          <h4 className="font-medium mb-2">
            Regular Plan (${regularPriceObj.amount} + ${premiumAmount} premium)
          </h4>
          <div className="text-sm space-y-1 pl-4">
            <div>Down Payment: ${downPaymentPrice.amount.toFixed(2)}</div>
            <div>
              {installmentDates.length} × ${regular.perPayment.toFixed(2)} ={" "}
              ${(regular.perPayment * installmentDates.length).toFixed(2)}
            </div>
            <div className="font-medium">Total: ${regular.total.toFixed(2)}</div>
          </div>
        </div>

        {/* Registration Timing Scenarios */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2 text-sm">Payment Amount by Registration Timing</h4>
          <div className="text-xs space-y-1">
            {scenarios.map((scenario) => {
              const remaining = earlyBird.total - downPaymentPrice.amount;
              const amount = Math.round((remaining / scenario.weeks) * 100) / 100;
              return (
                <div key={scenario.weeks} className="flex justify-between">
                  <span>Register with {scenario.label} remaining:</span>
                  <span className="font-medium">${amount.toFixed(2)} per payment</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Dates */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2 text-sm">Payment Dates</h4>
          <div className="text-xs space-y-1">
            {installmentDates.slice(0, 5).map((date, index) => (
              <div key={index}>
                {index + 1}. {format(date, "MMM dd, yyyy")}
              </div>
            ))}
            {installmentDates.length > 5 && (
              <div>... and {installmentDates.length - 5} more</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 2.3 Update Division Validation Schema

**File:** `/src/lib/validations/division.ts`

```typescript
export const createDivisionSchema = z.object({
  // ... existing fields

  // Optional installment settings
  paymentSchedule: z.object({
    downPayment: z.string().min(1),
    premiumAmount: z.number().min(0),
    installmentDates: z.array(z.date()).min(2),
    minimumPaymentsRequired: z.number().min(1),
    maxInstallmentSpots: z.number().min(1).optional(),
    latePaymentFee: z.number().min(0).optional(),
  }).optional(),
});
```

---

## PHASE 3: Front-Facing Site - Registration Flow

### 3.1 Calculate Available Installment Dates

**Create utility function:**

**File:** `/src/utils/installmentCalculations.ts` (Front-facing site)

```typescript
export interface InstallmentCalculation {
  isAvailable: boolean;
  reason?: string;
  downPayment: number;
  installmentAmount: number;
  numberOfPayments: number;
  paymentDates: Date[];
  total: number;
}

export function calculateInstallmentPlan(
  division: any,
  registrationDate: Date,
  isEarlyBird: boolean
): InstallmentCalculation {
  // Check if installments enabled
  if (!division.paymentSchedule) {
    return {
      isAvailable: false,
      reason: "Installment plans not available for this division",
      downPayment: 0,
      installmentAmount: 0,
      numberOfPayments: 0,
      paymentDates: [],
      total: 0,
    };
  }

  const { paymentSchedule } = division;

  // Get base price
  const basePrice = isEarlyBird
    ? division.prices.earlyBird.amount
    : division.prices.regular.amount;

  // Calculate total
  const total = basePrice + paymentSchedule.premiumAmount;
  const downPayment = paymentSchedule.downPayment.amount;

  // Find future payment dates
  const futureDates = paymentSchedule.installmentDates
    .map((date: string) => new Date(date))
    .filter((date: Date) => date > registrationDate)
    .sort((a: Date, b: Date) => a.getTime() - b.getTime());

  // Check if enough dates remaining
  if (futureDates.length < paymentSchedule.minimumPaymentsRequired) {
    return {
      isAvailable: false,
      reason: `Only ${futureDates.length} payment date(s) remaining. Minimum ${paymentSchedule.minimumPaymentsRequired} required.`,
      downPayment,
      installmentAmount: 0,
      numberOfPayments: futureDates.length,
      paymentDates: futureDates,
      total,
    };
  }

  // Check spot limit
  if (
    paymentSchedule.maxInstallmentSpots &&
    paymentSchedule.installmentSpotsUsed >= paymentSchedule.maxInstallmentSpots
  ) {
    return {
      isAvailable: false,
      reason: "All installment plan spots have been filled",
      downPayment,
      installmentAmount: 0,
      numberOfPayments: 0,
      paymentDates: [],
      total,
    };
  }

  // Calculate installment amount
  const remaining = total - downPayment;
  const installmentAmount = Math.round((remaining / futureDates.length) * 100) / 100;

  return {
    isAvailable: true,
    downPayment,
    installmentAmount,
    numberOfPayments: futureDates.length,
    paymentDates: futureDates,
    total,
  };
}
```

---

### 3.2 Update Registration Form

**File:** (Your registration form in front-facing site)

**Add installment option display:**

```tsx
// Calculate installment availability
const installmentPlan = calculateInstallmentPlan(
  division,
  new Date(),
  isEarlyBird
);

// In payment options UI:
{installmentPlan.isAvailable ? (
  <div className="border rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id="installment"
          name="paymentType"
          value="installment"
          checked={paymentType === "installment"}
          onChange={(e) => setPaymentType(e.target.value)}
        />
        <label htmlFor="installment" className="font-medium">
          Installment Plan - ${installmentPlan.total}
        </label>
      </div>
      {division.paymentSchedule.maxInstallmentSpots && (
        <span className="text-sm text-orange-600">
          ⚡ {division.paymentSchedule.maxInstallmentSpots - division.paymentSchedule.installmentSpotsUsed} spots left
        </span>
      )}
    </div>

    <div className="ml-6 text-sm space-y-2">
      <div className="bg-blue-50 p-3 rounded">
        <div className="font-medium mb-1">Payment Schedule:</div>
        <div>Down Payment (Today): ${installmentPlan.downPayment.toFixed(2)}</div>
        <div>
          {installmentPlan.numberOfPayments} payments of ${installmentPlan.installmentAmount.toFixed(2)}
        </div>
        <div className="text-xs text-gray-600 mt-2">
          {installmentPlan.paymentDates.slice(0, 3).map((date, i) => (
            <div key={i}>
              {format(date, "MMM dd, yyyy")}: ${installmentPlan.installmentAmount.toFixed(2)}
            </div>
          ))}
          {installmentPlan.numberOfPayments > 3 && (
            <div>... and {installmentPlan.numberOfPayments - 3} more</div>
          )}
        </div>
      </div>

      {paymentType === "installment" && (
        <div className="mt-3 space-y-2">
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="agreeInstallmentTerms"
              checked={agreeToInstallmentTerms}
              onChange={(e) => setAgreeToInstallmentTerms(e.target.checked)}
              required
            />
            <label htmlFor="agreeInstallmentTerms" className="text-xs">
              I agree to Rise Up League's Payment Plan Agreement:
              <ul className="list-disc ml-4 mt-1 space-y-1">
                <li>I authorize automatic charges on the dates above</li>
                <li>
                  A ${division.paymentSchedule.latePaymentFee || 25} late fee applies to missed payments
                </li>
                <li>I may be suspended or removed for non-payment</li>
                <li>All sales are final (no refunds)</li>
              </ul>
              <a href="/terms/payment-plan" target="_blank" className="text-blue-600 underline ml-1">
                View Full Terms
              </a>
            </label>
          </div>
        </div>
      )}
    </div>
  </div>
) : (
  <div className="border rounded-lg p-4 bg-gray-50">
    <div className="flex items-center space-x-2 opacity-50">
      <input
        type="radio"
        id="installment"
        name="paymentType"
        value="installment"
        disabled
      />
      <label htmlFor="installment" className="font-medium">
        Installment Plan - Not Available
      </label>
    </div>
    <div className="ml-6 text-sm text-gray-600 mt-2">
      {installmentPlan.reason}
    </div>
  </div>
)}
```

---

## PHASE 4: Checkout & Webhook (Front-Facing Site)

### 4.1 Update Checkout Session Creation

**File:** `/src/app/api/checkout-sessions/route.ts` (or wherever checkout is handled)

**For installment payments, use down payment price:**

```typescript
if (metadata.payment === PAYMENT_TYPE.INSTALLMENTS) {
  // Get division with payment schedule
  const division = await Division.findById(metadata.division)
    .populate('paymentSchedule.downPayment')
    .populate('city');

  // Calculate installment plan
  const installmentPlan = calculateInstallmentPlan(
    division,
    new Date(),
    metadata.isEarlyBird
  );

  if (!installmentPlan.isAvailable) {
    throw new Error(installmentPlan.reason || 'Installment plan not available');
  }

  // Apply coupon to down payment if provided
  let downPaymentAmount = installmentPlan.downPayment;
  if (couponCode) {
    const discount = await calculateCouponDiscount(couponCode);
    downPaymentAmount = Math.max(downPaymentAmount - discount, 0);
  }

  // Create checkout session with down payment price
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      price: division.paymentSchedule.downPayment.priceId,  // Use down payment Price ID
      quantity: 1,
    }],
    // OR use price_data for dynamic amount (if coupon applied):
    // line_items: [{
    //   price_data: {
    //     currency: 'cad',
    //     product_data: {
    //       name: `Down Payment - ${division.divisionName}`,
    //       description: `Installment plan (${installmentPlan.numberOfPayments} payments)`,
    //     },
    //     unit_amount: Math.round(downPaymentAmount * 100),
    //   },
    //   quantity: 1,
    // }],
    payment_intent_data: {
      setup_future_usage: "off_session",  // Save payment method
    },
    success_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}success/${metadata.division}`,
    cancel_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}register`,
    automatic_tax: { enabled: true },
    metadata: {
      formObject: JSON.stringify({
        ...metadata,
        installmentPlan: JSON.stringify(installmentPlan),  // Include calculated plan
      }),
      cityName: division.city.cityName,
    },
    ...(customerId && { customer: customerId }),
    ...(!customerId && {
      customer_creation: "always",
      customer_email: email,
    }),
  });

  return NextResponse.json({ session }, { status: 200 });
}
```

---

### 4.2 Update Webhook Handler

**File:** `/api/webhook/stripe/webhook-cities/route.ts`

**REMOVE all subscription schedule code and REPLACE with:**

```typescript
if (metadata.payment === PAYMENT_TYPE.INSTALLMENTS) {
  // Get payment method from session
  const paymentMethodId = session.payment_method as string;
  const customerId = session.customer as string;

  // Parse installment plan from metadata
  const installmentPlan = JSON.parse(metadata.installmentPlan);

  // Create/update payment method record with scheduled payments
  await createOrUpdatePaymentMethod({
    paymentType: "INSTALLMENTS",
    pricingTier: isBeforeEarlyBirdDeadline ? "EARLY_BIRD" : "REGULAR",
    originalPrice: installmentPlan.total,
    amountPaid: session.amount_total / 100,  // Down payment
    player: registeredPlayer._id,
    division: metadata.division,
    status: "IN_PROGRESS",
    stripePaymentMethodId: paymentMethodId,
    stripeCustomerId: customerId,
    stripeSessionId: session.id,
    scheduledPayments: installmentPlan.paymentDates.map((date: string) => ({
      dueDate: new Date(date),
      amount: installmentPlan.installmentAmount,
      status: 'PENDING',
      attemptCount: 0,
    })),
    session,
    metadata,
  });

  // Update installment spots used
  if (selectedDivision.paymentSchedule?.maxInstallmentSpots) {
    await Division.findByIdAndUpdate(metadata.division, {
      $inc: { 'paymentSchedule.installmentSpotsUsed': 1 }
    });
  }
}
```

**Update `createOrUpdatePaymentMethod` function signature:**

```typescript
async function createOrUpdatePaymentMethod(data: {
  paymentType: string;
  pricingTier: string;
  originalPrice: number;
  amountPaid: number;
  player: any;
  division: any;
  status: string;
  stripePaymentMethodId?: string;
  stripeCustomerId?: string;
  stripeSessionId?: string;
  scheduledPayments?: Array<{
    dueDate: Date;
    amount: number;
    status: string;
    attemptCount: number;
  }>;
  session: any;
  metadata: any;
}) {
  const PaymentMethod = (await import("@/api-helpers/models/PaymentMethod")).default;

  const paymentMethod = await PaymentMethod.create({
    player: data.player,
    division: data.division,
    paymentType: data.paymentType,
    pricingTier: data.pricingTier,
    originalPrice: data.originalPrice,
    amountPaid: data.amountPaid,
    status: data.status,
    stripePaymentMethodId: data.stripePaymentMethodId,
    stripeCustomerId: data.stripeCustomerId,
    stripeSessionId: data.stripeSessionId,
    scheduledPayments: data.scheduledPayments,
    metadata: data.metadata,
  });

  return paymentMethod;
}
```

---

## PHASE 5: Cron Job - Automatic Charging (Admin Site)

### 5.1 Create Cron Endpoint

**File:** `/src/app/api/cron/charge-installments/route.ts`

```typescript
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import PaymentMethod from "@/models/PaymentMethod";
import Division from "@/models/Division";
import Player from "@/models/Player";
import User from "@/models/User";
import Stripe from "stripe";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  // Security: Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  console.log(`🔄 Checking for installments due on ${today.toDateString()}`);

  // Find all payments with installments due today
  const paymentsDue = await PaymentMethod.find({
    paymentType: 'INSTALLMENTS',
    status: 'IN_PROGRESS',
    'scheduledPayments': {
      $elemMatch: {
        dueDate: { $gte: today, $lt: tomorrow },
        status: 'PENDING'
      }
    }
  })
    .populate('player')
    .populate({
      path: 'division',
      populate: { path: 'city' }
    });

  console.log(`📋 Found ${paymentsDue.length} payments due today`);

  const results = {
    success: 0,
    failed: 0,
    errors: [] as any[],
  };

  for (const payment of paymentsDue) {
    try {
      const division = payment.division as any;
      const city = division.city;
      const player = payment.player as any;

      // Get city-specific Stripe instance
      const cityName = city.cityName.toUpperCase();
      const stripeKey = process.env[`STRIPE_SECRET_KEY_${cityName}`];

      if (!stripeKey) {
        throw new Error(`No Stripe key for city: ${city.cityName}`);
      }

      const stripe = new Stripe(stripeKey);

      // Find the installment due today
      const dueInstallment = payment.scheduledPayments!.find(
        sp => sp.status === 'PENDING' &&
              sp.dueDate >= today &&
              sp.dueDate < tomorrow
      );

      if (!dueInstallment) continue;

      console.log(`💳 Charging ${player.playerName}: $${dueInstallment.amount}`);

      // Charge the saved payment method
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(dueInstallment.amount * 100),
        currency: 'cad',
        customer: payment.stripeCustomerId!,
        payment_method: payment.stripePaymentMethodId!,
        off_session: true,
        confirm: true,
        description: `Installment for ${division.divisionName} - ${city.cityName}`,
        metadata: {
          playerId: player._id.toString(),
          divisionId: division._id.toString(),
          cityName: city.cityName,
          installmentNumber: payment.scheduledPayments!.indexOf(dueInstallment) + 1,
          totalInstallments: payment.scheduledPayments!.length,
        }
      });

      // Update payment record
      dueInstallment.status = 'COMPLETED';
      dueInstallment.stripeChargeId = paymentIntent.id;
      dueInstallment.paidAt = new Date();
      payment.amountPaid += dueInstallment.amount;

      // Check if all installments complete
      const allPaid = payment.scheduledPayments!.every(sp => sp.status === 'COMPLETED');
      if (allPaid) {
        payment.status = 'COMPLETED';
      }

      await payment.save();

      console.log(`✅ Successfully charged ${player.playerName}`);
      results.success++;

      // Send success email
      if (player.user) {
        const user = await User.findById(player.user);
        if (user?.email) {
          await resend.emails.send({
            from: "Rise Up League <no-reply@riseupleague.com>",
            to: user.email,
            reply_to: "support@riseupleague.com",
            subject: "Installment Payment Successful",
            html: `
              <h2>Payment Received</h2>
              <p>Hi ${user.name},</p>
              <p>Your installment payment of $${dueInstallment.amount.toFixed(2)} has been successfully processed.</p>
              <p><strong>Division:</strong> ${division.divisionName}</p>
              <p><strong>Payment:</strong> ${payment.scheduledPayments!.indexOf(dueInstallment) + 1} of ${payment.scheduledPayments!.length}</p>
              <p><strong>Amount Paid:</strong> $${dueInstallment.amount.toFixed(2)}</p>
              <p><strong>Total Paid:</strong> $${payment.amountPaid.toFixed(2)} / $${payment.originalPrice.toFixed(2)}</p>
              ${!allPaid ? `<p><strong>Next Payment:</strong> ${payment.scheduledPayments!.find(sp => sp.status === 'PENDING')?.dueDate ? new Date(payment.scheduledPayments!.find(sp => sp.status === 'PENDING')!.dueDate).toLocaleDateString() : 'N/A'}</p>` : ''}
              <p>Thank you!</p>
              <p>Rise Up League</p>
            `,
          });
        }
      }

    } catch (error: any) {
      console.error(`❌ Failed to charge payment ${payment._id}:`, error.message);

      // Update payment record with failure
      const dueInstallment = payment.scheduledPayments!.find(
        sp => sp.status === 'PENDING' &&
              sp.dueDate >= today &&
              sp.dueDate < tomorrow
      );

      if (dueInstallment) {
        dueInstallment.status = 'FAILED';
        dueInstallment.attemptCount += 1;
        dueInstallment.lastError = error.message;
        dueInstallment.lastAttemptAt = new Date();
        await payment.save();
      }

      results.failed++;
      results.errors.push({
        paymentId: payment._id,
        playerId: payment.player._id,
        error: error.message,
      });

      // Send failure email
      const player = payment.player as any;
      if (player.user) {
        const user = await User.findById(player.user);
        const division = payment.division as any;

        if (user?.email) {
          await resend.emails.send({
            from: "Rise Up League <no-reply@riseupleague.com>",
            to: user.email,
            reply_to: "support@riseupleague.com",
            subject: "Installment Payment Failed",
            html: `
              <h2>Payment Failed</h2>
              <p>Hi ${user.name},</p>
              <p>We were unable to process your installment payment of $${dueInstallment?.amount.toFixed(2)}.</p>
              <p><strong>Division:</strong> ${division.divisionName}</p>
              <p><strong>Reason:</strong> ${error.message}</p>
              <p><strong>What to do:</strong></p>
              <ul>
                <li>Update your payment method</li>
                <li>Contact us at support@riseupleague.com</li>
                <li>Payment will be retried tomorrow</li>
              </ul>
              <p><strong>Important:</strong> A $${division.paymentSchedule?.latePaymentFee || 25} late fee may apply if not resolved within 7 days.</p>
              <p>Thank you,</p>
              <p>Rise Up League</p>
            `,
          });
        }
      }
    }
  }

  console.log(`📊 Installment processing complete: ${results.success} success, ${results.failed} failed`);

  return NextResponse.json({
    success: true,
    processed: paymentsDue.length,
    results,
  });
}
```

---

### 5.2 Set Up Cron Trigger

**Option A: Vercel Cron**

**File:** `vercel.json`

```json
{
  "crons": [{
    "path": "/api/cron/charge-installments",
    "schedule": "0 10 * * *"
  }]
}
```

**Option B: GitHub Actions**

**File:** `.github/workflows/charge-installments.yml`

```yaml
name: Charge Daily Installments
on:
  schedule:
    - cron: '0 10 * * *'  # 10 AM UTC daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  charge:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger installment charges
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://admin.riseupleague.com/api/cron/charge-installments
```

**Add `CRON_SECRET` to environment variables:**

```env
CRON_SECRET=your-secure-random-string-here
```

---

## PHASE 6: Admin UI - Payment Management

### 6.1 Create Installment Payments Dashboard

**File:** `/src/app/league/payments/installments/page.tsx`

```typescript
import { PaymentInstallmentsContent } from "@/components/features/league/payments/PaymentInstallmentsContent";
import PaymentMethod from "@/models/PaymentMethod";
import { connectDB } from "@/lib/db/mongodb";

export default async function InstallmentPaymentsPage() {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all installment payments
  const payments = await PaymentMethod.find({
    paymentType: 'INSTALLMENTS',
  })
    .populate('player')
    .populate('division')
    .sort({ createdAt: -1 })
    .lean();

  // Get payments due soon
  const upcomingPayments = await PaymentMethod.find({
    paymentType: 'INSTALLMENTS',
    status: 'IN_PROGRESS',
    'scheduledPayments': {
      $elemMatch: {
        dueDate: {
          $gte: today,
          $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        },
        status: 'PENDING'
      }
    }
  })
    .populate('player')
    .populate('division')
    .lean();

  // Get failed payments
  const failedPayments = await PaymentMethod.find({
    paymentType: 'INSTALLMENTS',
    'scheduledPayments': {
      $elemMatch: {
        status: 'FAILED'
      }
    }
  })
    .populate('player')
    .populate('division')
    .lean();

  return (
    <PaymentInstallmentsContent
      payments={JSON.parse(JSON.stringify(payments))}
      upcomingPayments={JSON.parse(JSON.stringify(upcomingPayments))}
      failedPayments={JSON.parse(JSON.stringify(failedPayments))}
    />
  );
}
```

---

### 6.2 Create Payment Installments Component

**File:** `/src/components/features/league/payments/PaymentInstallmentsContent.tsx`

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DollarSign, Calendar, AlertCircle, CheckCircle } from "lucide-react";

interface PaymentInstallmentsContentProps {
  payments: any[];
  upcomingPayments: any[];
  failedPayments: any[];
}

export function PaymentInstallmentsContent({
  payments,
  upcomingPayments,
  failedPayments,
}: PaymentInstallmentsContentProps) {
  // Calculate statistics
  const totalActive = payments.filter(p => p.status === 'IN_PROGRESS').length;
  const totalCompleted = payments.filter(p => p.status === 'COMPLETED').length;
  const totalRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const expectedRevenue = payments
    .filter(p => p.status === 'IN_PROGRESS')
    .reduce((sum, p) => sum + (p.originalPrice - p.amountPaid), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Installment Payments</h1>
        <p className="text-gray-600 mt-2">
          Manage and monitor installment payment plans
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActive}</div>
            <p className="text-xs text-muted-foreground">
              {totalCompleted} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${expectedRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {failedPayments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments (Next 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayments.map((payment) => {
                const nextPayment = payment.scheduledPayments.find(
                  (sp: any) => sp.status === 'PENDING'
                );
                return (
                  <div
                    key={payment._id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{payment.player.playerName}</div>
                      <div className="text-sm text-gray-600">
                        {payment.division.divisionName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Due: {format(new Date(nextPayment.dueDate), "MMM dd, yyyy")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${nextPayment.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.scheduledPayments.filter((sp: any) => sp.status === 'COMPLETED').length} /{" "}
                        {payment.scheduledPayments.length} paid
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed Payments */}
      {failedPayments.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Failed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {failedPayments.map((payment) => {
                const failedPayment = payment.scheduledPayments.find(
                  (sp: any) => sp.status === 'FAILED'
                );
                return (
                  <div
                    key={payment._id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{payment.player.playerName}</div>
                      <div className="text-sm text-gray-600">
                        {payment.division.divisionName}
                      </div>
                      <div className="text-xs text-red-600">
                        Failed: {format(new Date(failedPayment.dueDate), "MMM dd, yyyy")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {failedPayment.lastError}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600">
                        ${failedPayment.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Attempts: {failedPayment.attemptCount}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Installment Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Player</th>
                  <th className="text-left p-2">Division</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-right p-2">Paid</th>
                  <th className="text-right p-2">Total</th>
                  <th className="text-right p-2">Progress</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b">
                    <td className="p-2">{payment.player.playerName}</td>
                    <td className="p-2">{payment.division.divisionName}</td>
                    <td className="p-2">
                      <Badge
                        variant={
                          payment.status === 'COMPLETED'
                            ? 'default'
                            : payment.status === 'IN_PROGRESS'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">
                      ${payment.amountPaid.toFixed(2)}
                    </td>
                    <td className="p-2 text-right">
                      ${payment.originalPrice.toFixed(2)}
                    </td>
                    <td className="p-2 text-right">
                      {payment.scheduledPayments.filter((sp: any) => sp.status === 'COMPLETED').length} /{" "}
                      {payment.scheduledPayments.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## PHASE 7: Testing

### 7.1 Create Test Data

1. **Create Down Payment Price in Stripe:**
   - Go to Stripe Dashboard → Products → Create Product
   - Name: "Down Payment - $50"
   - Price: $50 CAD, one-time
   - Copy Price ID: `price_xxx`

2. **Create Price in Admin:**
   - Go to `/league/prices/new`
   - Name: "Down Payment - $50"
   - Stripe Price ID: `price_xxx`
   - Amount: 50
   - Type: `downPayment`
   - City: Select city

3. **Create Test Division:**
   - Go to `/league/divisions/new`
   - Set up basic details
   - Enable installment plans
   - Select down payment price
   - Set premium: $24
   - Add 4-6 payment dates
   - Set minimum payments: 2
   - Save

### 7.2 Test Registration Flow

1. **Test Early Registration (many dates remaining):**
   - Register as new user
   - Select installment plan
   - Should see low per-payment amount
   - Complete checkout
   - Verify webhook creates payment record

2. **Test Late Registration (few dates remaining):**
   - Register close to cutoff
   - Should see higher per-payment amount
   - Complete checkout

3. **Test Cutoff:**
   - Register when fewer than minimum dates remain
   - Should see "Full payment only" message

### 7.3 Test Cron Job

**Manual trigger:**
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/charge-installments
```

**Or use Stripe CLI to test payments:**
```bash
# Create test payment intent
stripe payment_intents create \
  --amount 5350 \
  --currency cad \
  --customer cus_xxx \
  --payment-method pm_xxx \
  --confirm
```

---

## PHASE 8: Deployment Checklist

### Pre-Deployment

- [ ] Create down payment prices in all city Stripe accounts
- [ ] Create corresponding Price records in database
- [ ] Update Division model
- [ ] Update PaymentMethod model
- [ ] Test in Stripe test mode
- [ ] Test webhook locally
- [ ] Test cron job locally

### Deployment

- [ ] Deploy admin site with new models
- [ ] Deploy front-facing site with new registration flow
- [ ] Set up cron job trigger (Vercel or GitHub Actions)
- [ ] Add `CRON_SECRET` to environment variables
- [ ] Monitor first few registrations closely
- [ ] Monitor first cron job executions

### Post-Deployment

- [ ] Create 1-2 test divisions with installment plans
- [ ] Test complete flow end-to-end
- [ ] Monitor webhook logs
- [ ] Monitor cron job logs
- [ ] Set up alerts for failed payments
- [ ] Document process for staff

---

## Troubleshooting

### Common Issues

**Issue: Installment calculations incorrect**
- Check that `premiumAmount` is set correctly
- Verify payment dates are in future
- Check `minimumPaymentsRequired` setting

**Issue: Cron job not charging**
- Verify `CRON_SECRET` is set
- Check cron trigger is configured
- Verify payment dates match exactly (date only, no time)
- Check Stripe keys are correct for city

**Issue: Webhook not saving payment method**
- Verify `setup_future_usage: "off_session"` in checkout
- Check that `payment_method` exists in session object
- Verify `customer` is created or exists

**Issue: Payment method charges failing**
- Check payment method is still valid
- Verify customer has sufficient funds
- Check Stripe API version compatibility

---

## Future Enhancements

### Phase 9 (Optional)

1. **Retry Logic for Failed Payments**
   - Retry failed payments automatically
   - Escalate after N attempts

2. **Late Fee Automation**
   - Automatically add late fees
   - Send warnings before late fees

3. **Payment Reminders**
   - Email 3 days before payment
   - SMS reminders option

4. **Admin Manual Charge**
   - Button to manually charge installment
   - Skip or cancel specific payments

5. **Player Payment Portal**
   - Let players view their payment schedule
   - Update payment method
   - See payment history

6. **Refund Handling**
   - Partial refunds for installment plans
   - Cancel remaining payments

---

## Support

For questions or issues during implementation:
- Check logs in Stripe Dashboard → Developers → Logs
- Check webhook logs in Stripe Dashboard → Developers → Webhooks
- Review application logs for errors
- Test in Stripe test mode first

---

**End of Implementation Guide**

Generated: January 3, 2026
