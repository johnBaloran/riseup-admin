# Installment Payment System - Implementation Guide (Revised)

## Overview

This guide outlines a **phased implementation** of a dynamic installment payment system where:
- Payment amounts are calculated based on remaining payment dates
- Earlier registration = lower per-payment amounts
- Admin configures everything via Division settings
- Existing payment methods (CASH, TERMINAL, E_TRANSFER) remain unchanged

---

## Key Principles

✅ **Admin-First Approach** - Start with admin models and UI only
✅ **Extend, Don't Replace** - Add to existing models without breaking current functionality
✅ **Fully Configurable** - All settings (premium, dates, minimums) are variable per division
✅ **Canadian Law Compliant** - Proper Pre-Authorized Debit (PAD) agreements
✅ **Backward Compatible** - Old installment system continues to work

---

## System Features

### For Admins:
- Configure installment plans per division
- Set payment dates (fully flexible)
- Set premium fee (variable dollar amount)
- Set minimum payments required (variable, e.g., 2-4)
- Set spot limits (optional)
- View all installment payments in dashboard

### For Players:
- See payment schedule before checkout
- Lower payments if registering early
- Automatic charges on set dates
- Simple agreement checkbox

---

## Pricing Example

**Division Settings:**
- Early Bird Price: $240
- Regular Price: $280
- Down Payment: $50 (single Stripe Price)
- Premium Fee: $24 (configurable per division)
- Payment Dates: 8 dates (Feb 1, 8, 15, 22, Mar 1, 8, 15, 22)
- Minimum Payments: 2 (configurable)

**Registration Scenarios:**

| Register Date | Dates Remaining | Per Payment | Total |
|--------------|-----------------|-------------|-------|
| Jan 1 (8 dates) | 8 | $26.75 | $50 + (8 × $26.75) = $264 |
| Feb 5 (7 dates) | 7 | $30.57 | $50 + (7 × $30.57) = $264 |
| Feb 10 (6 dates) | 6 | $35.67 | $50 + (6 × $35.67) = $264 |
| Feb 17 (5 dates) | 5 | $42.80 | $50 + (5 × $42.80) = $264 |
| Feb 24 (4 dates) | 4 | $53.50 | $50 + (4 × $53.50) = $264 |
| Mar 3 (3 dates) | 3 | $71.33 | $50 + (3 × $71.33) = $264 |
| Mar 10 (2 dates) | 2 | $107.00 | $50 + (2 × $107) = $264 |
| Mar 16 (1 date) | 1 | ❌ Full payment only (below minimum) |

---

## Implementation Phases

### Phase 1: Admin Models & UI (SAFE - Start Here)
- Update Division model with payment schedule
- Update Price model with downPayment type
- Update PaymentMethod model (extend only)
- Add Division creation/edit UI
- Add tutorials

### Phase 2: Backend API Endpoints (Critical - Calculation Layer)
- POST `/api/v1/divisions/:id/calculate-installment` - Calculates installment plan based on current date
- GET `/api/v1/divisions/:id/registration-options` - Returns available payment options
- All calculations happen server-side ONLY
- Frontend displays pre-calculated data ONLY

### Phase 3: Front-Facing Site (UI Layer)
- Registration form displays backend-calculated options
- Checkout shows pre-calculated payment schedule
- Legal agreement checkboxes
- NO calculation logic on frontend

### Phase 4: Webhook Updates (Payment Processing)
- Save payment method (stripeCustomerId, stripePaymentMethodId)
- Store pre-calculated scheduled payments from checkout
- Remove old subscription schedule code

### Phase 5: Cron Job (Automated Charging)
- Charge exact amounts from scheduledPayments array
- NO recalculation - use stored amounts
- Email notifications
- Failed payment handling

---

## PHASE 1: Admin Models & UI

### Step 1.1: Update Division Model

**File:** `/src/models/Division.ts`

**Add new interface (don't modify existing):**

```typescript
// ADD THIS - New interface for payment schedule
export interface IPaymentSchedule {
  downPayment: mongoose.Types.ObjectId;     // Reference to Price (type: downPayment)
  premiumAmount: number;                    // Variable per division (e.g., $24)
  installmentDates: Date[];                 // Admin picks dates
  minimumPaymentsRequired: number;          // Variable (default: 2, can be 2-4)
  maxInstallmentSpots?: number;             // Optional limit (e.g., 30)
  installmentSpotsUsed?: number;            // Track usage
  latePaymentFee?: number;                  // Default: $25
}

// ADD THIS - New schema
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
    },
    installmentDates: {
      type: [Date],
      required: true,
      validate: {
        validator: function(dates: Date[]) {
          return dates.length >= 1; // At least 1 date
        },
        message: 'Must have at least 1 installment date',
      },
    },
    minimumPaymentsRequired: {
      type: Number,
      required: true,
      default: 2,
      min: 1,
      max: 10, // Reasonable maximum
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
```

**Update existing IDivision interface:**

```typescript
export interface IDivision extends mongoose.Document {
  // ... ALL existing fields remain unchanged

  // ADD THIS - Optional payment schedule
  paymentSchedule?: IPaymentSchedule;
}
```

**Update divisionSchema:**

```typescript
const divisionSchema = new Schema<IDivision>(
  {
    // ... ALL existing fields

    // ADD THIS at the end
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

### Step 1.2: Update Price Model

**File:** `/src/models/Price.ts`

**Update type enum (add one new type):**

```typescript
export interface IPrice extends mongoose.Document {
  name: string;
  priceId: string;
  city?: mongoose.Types.ObjectId;
  amount: number;
  type:
    | "earlyBird"
    | "regular"
    | "installment"           // Keep for backward compatibility
    | "regularInstallment"    // Keep for backward compatibility
    | "firstInstallment"      // Keep for backward compatibility
    | "downPayment"           // ADD THIS - New type
    | "free";
  createdAt: Date;
  updatedAt: Date;
}

// Update schema
const priceSchema = new Schema<IPrice>(
  {
    // ... existing fields

    type: {
      type: String,
      enum: [
        "earlyBird",
        "regular",
        "installment",          // Keep
        "regularInstallment",   // Keep
        "firstInstallment",     // Keep
        "downPayment",          // ADD THIS
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

### Step 1.3: Update PaymentMethod Model (EXTEND ONLY)

**File:** `/src/models/PaymentMethod.ts`

**Add new interface for scheduled payments:**

```typescript
// ADD THIS - New scheduled payment tracking
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
```

**Update IPaymentMethod interface (EXTEND, don't replace):**

```typescript
export interface IPaymentMethod extends mongoose.Document {
  player: mongoose.Types.ObjectId;
  division: mongoose.Types.ObjectId;
  paymentType: "FULL_PAYMENT" | "INSTALLMENTS" | "CASH" | "TERMINAL" | "E_TRANSFER"; // Keep all existing
  pricingTier: "EARLY_BIRD" | "REGULAR";
  originalPrice: number;
  amountPaid: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";

  // KEEP ALL EXISTING FIELDS:
  installments?: {
    subscriptionId: string;
    totalAmountDue: number;
    remainingBalance: number;
    nextPaymentDate?: Date;
    subscriptionPayments: Array<{
      invoiceId: string;
      status: "succeeded" | "failed" | "pending";
      amountPaid: number;
      attemptCount: number;
      lastAttempt?: Date;
      paymentLink: string;
      paymentNumber: number;
      dueDate?: Date;
    }>;
  };
  cashPayment?: {
    paidDate?: Date;
    notes?: string;
    receivedBy?: mongoose.Types.ObjectId;
  };
  terminalPayment?: {
    paymentIntentId: string;
    chargeId?: string;
    cardBrand?: string;
    cardLast4?: string;
    amount: number;
    readerId: string;
    readerLabel?: string;
    authorizationCode?: string;
    paidDate: Date;
    processedBy: mongoose.Types.ObjectId;
    receiptUrl?: string;
    status: "processing" | "succeeded" | "failed";
  };
  eTransferPayments?: Array<{
    city: mongoose.Types.ObjectId;
    amount: number;
    paidDate: Date;
    senderEmail?: string;
    referenceNumber?: string;
    transactionId: string;
    notes?: string;
    receivedBy: mongoose.Types.ObjectId;
    createdAt: Date;
  }>;

  // ADD THIS - New fields for new installment system
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  stripeSessionId?: string;
  scheduledPayments?: IScheduledPayment[];

  createdAt: Date;
  updatedAt: Date;
}
```

**Update schema (add new fields at end):**

```typescript
const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    // ... ALL existing fields remain unchanged

    // ADD THESE at the end:
    stripeCustomerId: String,
    stripePaymentMethodId: String,
    stripeSessionId: String,
    scheduledPayments: [scheduledPaymentSchema],
  },
  {
    timestamps: true,
  }
);

// ADD NEW INDEX
paymentMethodSchema.index({ "scheduledPayments.dueDate": 1, "scheduledPayments.status": 1 });
```

**Update middleware to handle both old and new installment systems:**

```typescript
// Keep existing middleware, just add condition
paymentMethodSchema.pre("save", function (next) {
  // KEEP existing installment calculation for old system
  if (
    this.paymentType === "INSTALLMENTS" &&
    this.installments?.subscriptionPayments &&
    !this.scheduledPayments // Only for old system
  ) {
    // ... existing code for old installments
  }

  // ADD new scheduled payments calculation
  if (
    this.paymentType === "INSTALLMENTS" &&
    this.scheduledPayments &&
    this.scheduledPayments.length > 0
  ) {
    const totalPaid = this.scheduledPayments
      .filter((payment) => payment.status === "COMPLETED")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    this.amountPaid = totalPaid;

    // Auto-complete if all payments succeeded
    const allPaid = this.scheduledPayments.every(
      (p) => p.status === "COMPLETED"
    );
    if (allPaid) {
      this.status = "COMPLETED";
    } else if (totalPaid > 0) {
      this.status = "IN_PROGRESS";
    }
  }

  // KEEP existing e-transfer calculation
  if (
    this.paymentType === "E_TRANSFER" &&
    this.eTransferPayments &&
    this.eTransferPayments.length > 0
  ) {
    // ... existing code
  }

  next();
});
```

---

### Step 1.4: Update Division Validation Schema

**File:** `/src/lib/validations/division.ts`

```typescript
import { z } from "zod";

// ADD THIS
const paymentScheduleSchema = z.object({
  downPayment: z.string().min(1, "Down payment price is required"),
  premiumAmount: z.number().min(0, "Premium must be 0 or greater"),
  installmentDates: z.array(z.coerce.date()).min(1, "At least 1 payment date required"),
  minimumPaymentsRequired: z.number().min(1).max(10, "Must be between 1 and 10"),
  maxInstallmentSpots: z.number().min(1).optional(),
  latePaymentFee: z.number().min(0).optional(),
}).optional();

export const createDivisionSchema = z.object({
  // ... existing fields

  // ADD THIS
  paymentSchedule: paymentScheduleSchema,
});

export const updateDivisionSchema = z.object({
  id: z.string(),
  // ... existing fields

  // ADD THIS
  paymentSchedule: paymentScheduleSchema,
});
```

---

### Step 1.5: Update Division Creation Form

**File:** `/src/components/features/league/divisions/CreateDivisionForm.tsx`

**Add state variables:**

```typescript
// ADD THESE
const [installmentEnabled, setInstallmentEnabled] = useState(false);
const [installmentDates, setInstallmentDates] = useState<Date[]>([]);
const [downPaymentPrice, setDownPaymentPrice] = useState<string>("");
const [premiumAmount, setPremiumAmount] = useState<number>(24);
const [minimumPayments, setMinimumPayments] = useState<number>(2);
const [maxSpots, setMaxSpots] = useState<number | undefined>(undefined);
const [latePaymentFee, setLatePaymentFee] = useState<number>(25);

// ADD THIS - Filter down payment prices
const downPaymentPrices = useMemo(() => {
  return prices.filter((p) => p.type === "downPayment");
}, [prices]);
```

**Add to form submission:**

```typescript
const onSubmit = async (data: CreateDivisionInput) => {
  setIsLoading(true);
  setConflictWarning(null);

  try {
    // ADD THIS - Include payment schedule if enabled
    const submitData = {
      ...data,
      ...(installmentEnabled && installmentDates.length > 0 && downPaymentPrice && {
        paymentSchedule: {
          downPayment: downPaymentPrice,
          premiumAmount,
          installmentDates: installmentDates.map(d => d.toISOString()),
          minimumPaymentsRequired: minimumPayments,
          ...(maxSpots && { maxInstallmentSpots: maxSpots }),
          latePaymentFee,
        },
      }),
    };

    const response = await fetch(`/api/v1/divisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    });

    // ... rest of existing code
  } catch (err: any) {
    // ... existing error handling
  }
};
```

**Add to JSX (after Pricing card):**

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
            Same price for both early bird and regular tiers
          </p>
        </div>

        {/* Premium Amount - VARIABLE */}
        <div>
          <Label htmlFor="premiumAmount">Premium Fee (Variable)</Label>
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
            Flat fee added to installment total (e.g., $24). Can be different per division.
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
        </div>

        {/* Minimum Payments - VARIABLE */}
        <div>
          <Label htmlFor="minimumPayments">Minimum Payments Required (Variable)</Label>
          <Input
            id="minimumPayments"
            type="number"
            min="1"
            max="10"
            value={minimumPayments}
            onChange={(e) => setMinimumPayments(parseInt(e.target.value) || 2)}
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Registration cutoff when fewer dates remain (typically 2-4)
          </p>
        </div>

        {/* Optional Settings */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="maxSpots">Max Installment Spots (Optional)</Label>
            <Input
              id="maxSpots"
              type="number"
              min="1"
              value={maxSpots || ""}
              onChange={(e) => setMaxSpots(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Unlimited"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Limit number of players who can use installments
            </p>
          </div>

          <div>
            <Label htmlFor="latePaymentFee">Late Payment Fee</Label>
            <Input
              id="latePaymentFee"
              type="number"
              step="0.01"
              min="0"
              value={latePaymentFee}
              onChange={(e) => setLatePaymentFee(parseFloat(e.target.value) || 25)}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Fee applied for missed payments (typically $25)
            </p>
          </div>
        </div>

        {/* Preview */}
        {installmentDates.length > 0 && downPaymentPrice && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">Preview</h4>
            <InstallmentPreview
              earlyBirdPrice={watch("prices.earlyBird")}
              regularPrice={watch("prices.regular")}
              downPaymentPrice={downPaymentPrices.find(p => p._id === downPaymentPrice)}
              premiumAmount={premiumAmount}
              installmentDates={installmentDates}
              minimumPayments={minimumPayments}
              prices={prices}
            />
          </div>
        )}
      </>
    )}
  </CardContent>
</Card>
```

---

### Step 1.6: Create Installment Preview Component

**File:** `/src/components/features/league/divisions/InstallmentPreview.tsx` (NEW FILE)

**IMPORTANT:** This component is for ADMIN PREVIEW ONLY during division creation. It performs local calculations to show admins what their configuration will produce. The actual player-facing calculations will happen on the backend in Phase 2.

```typescript
"use client";

import { format } from "date-fns";

interface InstallmentPreviewProps {
  earlyBirdPrice: string;
  regularPrice: string;
  downPaymentPrice: any;
  premiumAmount: number;
  installmentDates: Date[];
  minimumPayments: number;
  prices: any[];
}

export function InstallmentPreview({
  earlyBirdPrice,
  regularPrice,
  downPaymentPrice,
  premiumAmount,
  installmentDates,
  minimumPayments,
  prices,
}: InstallmentPreviewProps) {
  const earlyBirdPriceObj = prices.find((p) => p._id === earlyBirdPrice);
  const regularPriceObj = prices.find((p) => p._id === regularPrice);

  if (!earlyBirdPriceObj || !regularPriceObj || !downPaymentPrice) {
    return null;
  }

  // NOTE: This calculation is ONLY for admin preview during division creation
  // The backend API will perform the actual calculations for players (Phase 2)
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

  // Calculate scenarios based on registration timing
  const scenarios = [
    { count: installmentDates.length, label: `All ${installmentDates.length} dates` },
    { count: Math.ceil(installmentDates.length * 0.75), label: `${Math.ceil(installmentDates.length * 0.75)} dates remaining` },
    { count: Math.ceil(installmentDates.length * 0.5), label: `${Math.ceil(installmentDates.length * 0.5)} dates remaining` },
    { count: minimumPayments, label: `${minimumPayments} dates (minimum)` },
  ].filter(s => s.count >= minimumPayments);

  return (
    <div className="space-y-4 text-sm">
      {/* Admin Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
        <strong>Admin Preview:</strong> This shows example calculations. Actual player amounts
        will be calculated by the backend based on registration date vs. remaining payment dates.
      </div>

      {/* Full Schedule */}
      <div>
        <h5 className="font-medium mb-1">Early Bird Full Schedule (${earlyBirdPriceObj.amount} + ${premiumAmount})</h5>
        <div className="pl-4 space-y-1 text-xs">
          <div>Down Payment: ${downPaymentPrice.amount.toFixed(2)}</div>
          <div>{installmentDates.length} × ${earlyBird.perPayment.toFixed(2)} = ${(earlyBird.perPayment * installmentDates.length).toFixed(2)}</div>
          <div className="font-medium">Total: ${earlyBird.total.toFixed(2)}</div>
        </div>
      </div>

      <div>
        <h5 className="font-medium mb-1">Regular Full Schedule (${regularPriceObj.amount} + ${premiumAmount})</h5>
        <div className="pl-4 space-y-1 text-xs">
          <div>Down Payment: ${downPaymentPrice.amount.toFixed(2)}</div>
          <div>{installmentDates.length} × ${regular.perPayment.toFixed(2)} = ${(regular.perPayment * installmentDates.length).toFixed(2)}</div>
          <div className="font-medium">Total: ${regular.total.toFixed(2)}</div>
        </div>
      </div>

      {/* Registration Timing Impact */}
      <div className="border-t pt-2">
        <h5 className="font-medium mb-1 text-xs">Early Bird Payment by Registration Time:</h5>
        <div className="pl-4 space-y-1 text-xs text-gray-600">
          {scenarios.map((scenario) => {
            const remaining = earlyBird.total - downPaymentPrice.amount;
            const amount = Math.round((remaining / scenario.count) * 100) / 100;
            return (
              <div key={scenario.count} className="flex justify-between">
                <span>{scenario.label}:</span>
                <span className="font-medium">${amount.toFixed(2)} per payment</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Dates */}
      <div className="border-t pt-2">
        <h5 className="font-medium mb-1 text-xs">Payment Dates (Stored in Division):</h5>
        <div className="pl-4 text-xs text-gray-600">
          {installmentDates.slice(0, 4).map((date, index) => (
            <div key={index}>
              {index + 1}. {format(date, "MMM dd, yyyy")}
            </div>
          ))}
          {installmentDates.length > 4 && (
            <div>... and {installmentDates.length - 4} more</div>
          )}
        </div>
      </div>

      {/* Important Note */}
      <div className="border-t pt-2 text-xs text-gray-600">
        <strong>Note:</strong> These dates are stored in the division. Backend will calculate
        per-payment amounts based on how many dates remain at registration time.
        Minimum {minimumPayments} payment dates required to qualify for installments.
      </div>
    </div>
  );
}
```

---

### Step 1.7: Update Edit Division Form

**File:** `/src/components/features/league/divisions/EditDivisionForm.tsx`

Apply the same changes as CreateDivisionForm, but also:

**Initialize state from existing division data:**

```typescript
useEffect(() => {
  if (division.paymentSchedule) {
    setInstallmentEnabled(true);
    setDownPaymentPrice(division.paymentSchedule.downPayment?._id || "");
    setPremiumAmount(division.paymentSchedule.premiumAmount || 24);
    setInstallmentDates(
      division.paymentSchedule.installmentDates?.map((d: string) => new Date(d)) || []
    );
    setMinimumPayments(division.paymentSchedule.minimumPaymentsRequired || 2);
    setMaxSpots(division.paymentSchedule.maxInstallmentSpots);
    setLatePaymentFee(division.paymentSchedule.latePaymentFee || 25);
  }
}, [division]);
```

---

### Step 1.8: Add Tutorial for Divisions

**File:** `/src/data/tutorials/executive-league-setup.ts`

**Add new tutorial:**

```typescript
{
  id: "setup-installment-plans",
  title: "Setting Up Installment Payment Plans",
  description: "Configure flexible installment plans for divisions",
  category: "League Setup",
  roles: ["executive", "commissioner"],
  estimatedTime: "10 minutes",
  difficulty: "intermediate" as const,
  steps: [
    {
      title: "Enable Installment Plans",
      content: `When creating or editing a division:

1. Scroll to "Installment Plan Settings" section
2. Check "Enable Installment Plans"
3. This unlocks all installment configuration options`,
      tips: [
        "Installment plans are optional - not all divisions need them",
        "You can enable this for existing divisions anytime",
      ],
    },
    {
      title: "Select Down Payment Price",
      content: `Choose the down payment price:

1. Select a price with type "downPayment" from dropdown
2. This is the amount charged immediately at registration
3. Same price applies to both Early Bird and Regular tiers`,
      tips: [
        "Create down payment prices in Prices section first",
        "Typical down payment: $50",
        "Create one down payment price per city in Stripe",
      ],
    },
    {
      title: "Set Premium Fee",
      content: `Configure the premium amount:

1. Enter dollar amount (e.g., $24)
2. This fee is added to base price for installment plans
3. Can be different for each division`,
      tips: [
        "Premium compensates for administrative overhead",
        "Typical range: $20-30",
        "Set to $0 if no premium desired",
      ],
    },
    {
      title: "Add Payment Dates",
      content: `Set fixed payment dates:

1. Click "Add Payment Date"
2. Select date from calendar
3. Add multiple dates (typically 4-8)
4. Dates should be weekly or bi-weekly`,
      tips: [
        "More dates = lower per-payment amounts",
        "Fewer dates = higher per-payment amounts",
        "Must have at least minimum payment dates",
      ],
    },
    {
      title: "Configure Minimum Payments",
      content: `Set the minimum requirement:

1. Enter number (default: 2)
2. This is the cutoff for installment eligibility
3. If fewer dates remain, full payment required`,
      tips: [
        "Typical minimum: 2-4 payments",
        "Lower minimum = accepts late registrations",
        "Higher minimum = encourages early registration",
      ],
    },
    {
      title: "Optional: Set Spot Limit",
      content: `Limit installment plan availability:

1. Enter max number of spots (optional)
2. Creates urgency for early registration
3. Leave blank for unlimited spots`,
      tips: [
        "Typical limit: 20-30 spots",
        "Shown as "X spots remaining" to users",
        "Good for encouraging full payments",
      ],
    },
    {
      title: "Review Preview",
      content: `Check the preview panel:

1. Shows early bird and regular calculations
2. Shows per-payment amounts by registration timing
3. Lists all payment dates
4. Verify calculations before saving`,
      tips: [
        "Earlier registration = lower payments",
        "Preview updates automatically",
        "Total should match base price + premium",
      ],
    },
  ],
  relatedTutorials: ["create-division", "create-prices"],
  tags: ["installments", "payments", "divisions", "pricing"],
},
```

---

### Step 1.9: Add Tutorial for Prices

**File:** `/src/data/tutorials/executive-league-setup.ts`

**Add tutorial for creating down payment price:**

```typescript
{
  id: "create-down-payment-price",
  title: "Creating Down Payment Prices",
  description: "Set up down payment prices for installment plans",
  category: "League Setup",
  roles: ["executive"],
  estimatedTime: "5 minutes",
  difficulty: "beginner" as const,
  steps: [
    {
      title: "Create Price in Stripe",
      content: `First, create the price in Stripe:

1. Log into Stripe Dashboard for your city
2. Go to Products → Create Product
3. Name: "Down Payment - $50"
4. Price: $50 CAD
5. Billing: One-time
6. Copy the Price ID (starts with price_)`,
      tips: [
        "Create one down payment price per city",
        "Use consistent naming across cities",
        "Price ID looks like: price_1A2B3C4D5E6F",
      ],
    },
    {
      title: "Create Price in Admin",
      content: `Add the price to your admin system:

1. Go to League → Prices → New Price
2. Name: "Down Payment - $50"
3. Stripe Price ID: paste from Stripe
4. Amount: 50
5. Type: Select "downPayment"
6. City: Select the appropriate city
7. Save`,
      tips: [
        "Name should match Stripe for clarity",
        "Amount must match exactly",
        "One price per city",
      ],
    },
    {
      title: "Use in Division",
      content: `Now you can use this price:

1. Edit or create a division
2. Enable installment plans
3. Select your down payment price
4. It will be used for all installment registrations`,
      tips: [
        "Same down payment for early bird and regular",
        "Reusable across multiple divisions",
        "Cannot be deleted if in use",
      ],
    },
  ],
  relatedTutorials: ["setup-installment-plans"],
  tags: ["prices", "stripe", "installments"],
},
```

---

## PHASE 2: Backend API Endpoints (Calculation Layer)

**CRITICAL:** All installment calculations happen on the backend. Frontend NEVER calculates - it only displays what the backend returns.

### Architecture Overview

```
Division Created (Phase 1)
    ↓
  Stores: paymentSchedule.installmentDates = [Feb 1, Feb 8, Feb 15, ...]
    ↓
Player Visits Registration (Phase 2)
    ↓
  Frontend calls: GET /api/v1/divisions/:id/registration-options
    ↓
  Backend calculates based on:
    - Current date vs stored installmentDates
    - How many dates remain
    - Base price (early bird or regular)
    - Premium amount
    ↓
  Returns: { fullPayment, installmentPlan: { downPayment, scheduledPayments: [...] } }
    ↓
  Frontend displays returned data (NO calculation)
    ↓
Player Completes Checkout (Phase 3)
    ↓
  Sends selected plan to backend
    ↓
  Backend re-validates and stores exact amounts in PaymentMethod.scheduledPayments
    ↓
Cron Job Runs (Phase 5)
    ↓
  Charges exact amounts from scheduledPayments (NO recalculation)
```

---

### Step 2.1: Create Installment Calculation Utility (Backend Only)

**File:** `/src/lib/utils/installment-calculator.ts` (NEW FILE)

**CRITICAL:** This file runs ONLY on the server. Never import in client components.

```typescript
// src/lib/utils/installment-calculator.ts

/**
 * SERVER-SIDE ONLY - Installment Calculation Utility
 *
 * This file contains the single source of truth for installment calculations.
 * All calculations happen here, on the backend.
 *
 * NEVER import this in client components.
 */

import { IPaymentSchedule } from "@/models/Division";

export interface InstallmentCalculationInput {
  paymentSchedule: IPaymentSchedule;
  basePrice: number; // Early bird or regular price
  currentDate: Date;
  pricingTier: "EARLY_BIRD" | "REGULAR";
}

export interface ScheduledPaymentPlan {
  dueDate: Date;
  amount: number;
  status: "PENDING";
}

export interface InstallmentPlanResult {
  eligible: boolean;
  reason?: string; // If not eligible, why?
  downPaymentAmount?: number;
  scheduledPayments?: ScheduledPaymentPlan[];
  totalAmount?: number;
  remainingDates?: number;
}

/**
 * Calculate installment plan based on registration date
 * This is the ONLY place this calculation should happen
 */
export function calculateInstallmentPlan(
  input: InstallmentCalculationInput
): InstallmentPlanResult {
  const { paymentSchedule, basePrice, currentDate } = input;

  // Step 1: Get payment dates that are still in the future
  const futureDates = paymentSchedule.installmentDates.filter(
    (date) => new Date(date) > currentDate
  );

  // Step 2: Check if enough dates remain
  if (futureDates.length < paymentSchedule.minimumPaymentsRequired) {
    return {
      eligible: false,
      reason: `Only ${futureDates.length} payment date(s) remaining. Minimum ${paymentSchedule.minimumPaymentsRequired} required.`,
    };
  }

  // Step 3: Check if installment spots available (if limited)
  if (
    paymentSchedule.maxInstallmentSpots &&
    paymentSchedule.installmentSpotsUsed !== undefined &&
    paymentSchedule.installmentSpotsUsed >= paymentSchedule.maxInstallmentSpots
  ) {
    return {
      eligible: false,
      reason: "Installment spots are full. Please choose full payment.",
    };
  }

  // Step 4: Calculate amounts
  const totalAmount = basePrice + paymentSchedule.premiumAmount;

  // Get down payment amount from populated Price object
  const downPaymentAmount =
    typeof paymentSchedule.downPayment === 'object' && 'amount' in paymentSchedule.downPayment
      ? paymentSchedule.downPayment.amount
      : 50; // Fallback (should not happen if properly populated)

  const remainingAfterDownPayment = totalAmount - downPaymentAmount;
  const perPaymentAmount = remainingAfterDownPayment / futureDates.length;

  // Round to 2 decimal places
  const roundedPerPayment = Math.round(perPaymentAmount * 100) / 100;

  // Step 5: Create scheduled payment plan
  const scheduledPayments: ScheduledPaymentPlan[] = futureDates.map((date) => ({
    dueDate: new Date(date),
    amount: roundedPerPayment,
    status: "PENDING" as const,
  }));

  return {
    eligible: true,
    downPaymentAmount,
    scheduledPayments,
    totalAmount,
    remainingDates: futureDates.length,
  };
}

/**
 * Validate that a stored installment plan is still valid
 * Used during checkout to ensure calculations haven't changed
 */
export function validateInstallmentPlan(
  storedPlan: { downPayment: number; scheduledPayments: ScheduledPaymentPlan[] },
  freshCalculation: InstallmentPlanResult
): boolean {
  if (!freshCalculation.eligible) return false;
  if (storedPlan.downPayment !== freshCalculation.downPaymentAmount) return false;
  if (storedPlan.scheduledPayments.length !== freshCalculation.scheduledPayments?.length) return false;

  // Verify amounts match (within 1 cent for rounding)
  for (let i = 0; i < storedPlan.scheduledPayments.length; i++) {
    const stored = storedPlan.scheduledPayments[i].amount;
    const fresh = freshCalculation.scheduledPayments![i].amount;
    if (Math.abs(stored - fresh) > 0.01) return false;
  }

  return true;
}
```

---

### Step 2.2: Create Registration Options API Endpoint

**File:** `/src/app/api/v1/divisions/[id]/registration-options/route.ts` (NEW FILE)

**This endpoint returns all available payment options for a division based on current date.**

```typescript
// src/app/api/v1/divisions/[id]/registration-options/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Division from "@/models/Division";
import Price from "@/models/Price";
import { calculateInstallmentPlan } from "@/lib/utils/installment-calculator";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const division = await Division.findById(params.id)
      .populate("prices.earlyBird")
      .populate("prices.regular")
      .populate("prices.free")
      .populate("paymentSchedule.downPayment");

    if (!division) {
      return NextResponse.json(
        { error: "Division not found" },
        { status: 404 }
      );
    }

    const currentDate = new Date();
    const isEarlyBird = division.earlyBirdDeadline && currentDate < new Date(division.earlyBirdDeadline);

    // Build response
    const response: any = {
      divisionId: division._id,
      divisionName: division.divisionName,
      isEarlyBird,
      currentDate: currentDate.toISOString(),
    };

    // Full payment options
    if (isEarlyBird && division.prices.earlyBird) {
      response.earlyBirdFullPayment = {
        priceId: division.prices.earlyBird.priceId,
        amount: division.prices.earlyBird.amount,
        tier: "EARLY_BIRD",
      };
    }

    if (division.prices.regular) {
      response.regularFullPayment = {
        priceId: division.prices.regular.priceId,
        amount: division.prices.regular.amount,
        tier: "REGULAR",
      };
    }

    // Free option
    if (division.prices.free) {
      response.freeOption = {
        priceId: division.prices.free.priceId,
        amount: 0,
        tier: "FREE",
      };
    }

    // Installment options (if configured)
    if (division.paymentSchedule) {
      // Early bird installment
      if (isEarlyBird && division.prices.earlyBird) {
        const earlyBirdInstallment = calculateInstallmentPlan({
          paymentSchedule: division.paymentSchedule,
          basePrice: division.prices.earlyBird.amount,
          currentDate,
          pricingTier: "EARLY_BIRD",
        });

        response.earlyBirdInstallment = earlyBirdInstallment;
      }

      // Regular installment
      if (division.prices.regular) {
        const regularInstallment = calculateInstallmentPlan({
          paymentSchedule: division.paymentSchedule,
          basePrice: division.prices.regular.amount,
          currentDate,
          pricingTier: "REGULAR",
        });

        response.regularInstallment = regularInstallment;
      }

      // Include payment schedule info
      response.paymentScheduleInfo = {
        minimumPaymentsRequired: division.paymentSchedule.minimumPaymentsRequired,
        premiumAmount: division.paymentSchedule.premiumAmount,
        spotsRemaining: division.paymentSchedule.maxInstallmentSpots
          ? division.paymentSchedule.maxInstallmentSpots - (division.paymentSchedule.installmentSpotsUsed || 0)
          : null,
      };
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching registration options:", error);
    return NextResponse.json(
      { error: "Failed to fetch registration options" },
      { status: 500 }
    );
  }
}
```

---

### Step 2.3: Update Division API to Populate Payment Schedule

**File:** `/src/app/api/v1/divisions/[id]/route.ts`

**Ensure paymentSchedule.downPayment is populated when returning division:**

```typescript
// In GET handler
const division = await Division.findById(params.id)
  .populate("city")
  .populate("location")
  .populate("level")
  .populate("teams")
  .populate("prices.earlyBird")
  .populate("prices.regular")
  .populate("prices.installment")
  .populate("prices.regularInstallment")
  .populate("prices.firstInstallment")
  .populate("prices.free")
  .populate("paymentSchedule.downPayment"); // ADD THIS
```

---

### Step 2.4: Testing Backend APIs

**Test Checklist:**

1. Create division with payment schedule (8 dates: Feb 1, 8, 15, 22, Mar 1, 8, 15, 22)
2. Set premium to $24
3. Set minimum payments to 2
4. Early bird price: $240, Regular price: $280
5. Down payment: $50

**Test API calls:**

```bash
# Get registration options on Jan 1 (all 8 dates available)
curl http://localhost:3000/api/v1/divisions/[ID]/registration-options

# Expected earlyBirdInstallment:
# {
#   "eligible": true,
#   "downPaymentAmount": 50,
#   "remainingDates": 8,
#   "totalAmount": 264,
#   "scheduledPayments": [
#     { "dueDate": "2026-02-01", "amount": 26.75, "status": "PENDING" },
#     { "dueDate": "2026-02-08", "amount": 26.75, "status": "PENDING" },
#     ... (8 total)
#   ]
# }

# Get registration options on Feb 10 (6 dates remaining)
# Expected earlyBirdInstallment.scheduledPayments: 6 payments of $35.67

# Get registration options on Mar 10 (2 dates remaining - at minimum)
# Expected earlyBirdInstallment.scheduledPayments: 2 payments of $107.00

# Get registration options on Mar 17 (1 date remaining - below minimum)
# Expected earlyBirdInstallment:
# {
#   "eligible": false,
#   "reason": "Only 1 payment date(s) remaining. Minimum 2 required."
# }
```

---

### Summary of Phase 2

**What We Built:**
- ✅ Server-side calculation utility (single source of truth)
- ✅ Registration options API endpoint
- ✅ Proper population of payment schedule data
- ✅ Validation logic

**What Frontend Will Do (Phase 3):**
- ❌ NO calculation logic
- ✅ Call `/api/v1/divisions/:id/registration-options`
- ✅ Display returned data only
- ✅ Pass selected plan to checkout

**What Webhook Will Do (Phase 4):**
- ✅ Store exact scheduledPayments from checkout
- ❌ NO recalculation

**What Cron Will Do (Phase 5):**
- ✅ Charge exact amounts from database
- ❌ NO recalculation

---

## Canadian Law Compliance

### Pre-Authorized Debit (PAD) Agreement

The checkbox agreement MUST include these elements to comply with Canadian Payment Association rules:

```typescript
// Required agreement text
const INSTALLMENT_AGREEMENT_TEXT = `
I agree to Rise Up League's Payment Plan Agreement and authorize
Rise Up League to automatically charge my payment method on the
scheduled payment dates shown above. I understand:

• I authorize automatic charges on the dates above
• A $[latePaymentFee] late fee applies to missed payments
• I may be suspended or removed for non-payment
• All sales are final (no refunds)
• I can revoke this authorization by contacting support@riseupleague.com
  at least 3 business days before the next payment date

This constitutes a Pre-Authorized Debit (PAD) Agreement under
Canadian Payment Association rules.

[View Full Terms]
`;
```

### Full Terms Page Content

**Create:** `/terms/payment-plan` page with:

1. **Clear identification** of creditor (Rise Up League)
2. **Authorization to debit** specific payment method
3. **Payment schedule** with dates and amounts
4. **Revocation rights** (3 business days notice)
5. **Dispute process** (contact info, timeline)
6. **Late payment terms** (fees, suspension)
7. **Contact information** for questions

This meets Canadian requirements for PAD agreements.

---

## Stripe Setup

### What to Create in Stripe

**Per City (e.g., Brampton, Mississauga, etc.):**

Create **1 Product** with **1 Price**:

```
Product: Down Payment
Price: $50 CAD, One-time
Price ID: price_xxxxx (copy this)
```

That's it! Future installments are charged via Payment Intents (no Price needed).

---

## Testing Phase 1 (Admin Only)

### Test Checklist:

- [ ] Create down payment price in Stripe
- [ ] Create Price record in admin with type "downPayment"
- [ ] Create new division with installment plan enabled
- [ ] Set premium to $24
- [ ] Add 4-6 payment dates
- [ ] Set minimum payments to 2
- [ ] Verify preview shows correct calculations
- [ ] Save division
- [ ] Edit division and verify installment settings load
- [ ] Create second division without installments (verify optional)
- [ ] Check tutorials display correctly

---

## What's NOT in Phase 1

These will come in later phases:

- ❌ Backend calculation APIs (Phase 2)
- ❌ Front-facing registration changes (Phase 3)
- ❌ Checkout modifications (Phase 3)
- ❌ Webhook updates (Phase 4)
- ❌ Cron job creation (Phase 5)
- ❌ Automatic charging (Phase 5)

Phase 1 is **admin configuration only**. This lets you set up divisions and store payment dates safely without touching the payment flow yet.

---

## Next Steps

After each phase is complete and tested:

**Phase 2:** Backend API endpoints for installment calculations (server-side only)
**Phase 3:** Front-facing site registration form (display backend data only)
**Phase 4:** Webhook updates to save payment methods and scheduled payments
**Phase 5:** Cron job to auto-charge installments

**CRITICAL ARCHITECTURE RULE:**
- Payment dates are stored in Division when admin creates it
- Backend calculates installment amounts based on current date vs. stored dates
- Frontend displays backend-calculated data only (never calculates)
- Webhook stores exact amounts from backend
- Cron charges exact amounts from database (never recalculates)

---

## Summary of Changes

### Phase 1 - What We're Adding:
- ✅ Payment schedule configuration to Division model (stores payment dates)
- ✅ "downPayment" type to Price model
- ✅ Scheduled payments tracking to PaymentMethod model
- ✅ Admin UI for configuring installments
- ✅ Preview component (admin-only, local calculation for preview)
- ✅ Tutorials

### Phase 2 - Backend Calculation Layer:
- ✅ Server-side calculation utility (single source of truth)
- ✅ Registration options API endpoint
- ✅ Validation logic
- ❌ NO frontend calculation logic

### What We're NOT Changing:
- ✅ Existing payment types (CASH, TERMINAL, E_TRANSFER)
- ✅ Existing installment system (subscription-based can coexist)
- ✅ Any current division functionality
- ✅ Price model structure (just adding one type)

### All Settings Are Variable:
- ✅ Premium fee (per division)
- ✅ Payment dates (per division, stored when division is created)
- ✅ Minimum payments (per division)
- ✅ Spot limits (per division)
- ✅ Late fees (per division)

### Critical Architecture Decisions:

**1. Payment Dates Storage:**
- Admin sets payment dates when creating division
- Dates are stored in `Division.paymentSchedule.installmentDates`
- These are FIXED universal dates for everyone

**2. Calculation Flow:**
```
Admin Creates Division → Stores payment dates
Player Registers → Backend calculates based on remaining dates
Player Checks Out → Backend validates and stores exact amounts
Webhook Processes → Stores scheduled payments
Cron Runs → Charges stored amounts (NO recalculation)
```

**3. Backend-First Architecture:**
- All calculations happen server-side
- Frontend displays pre-calculated data only
- Single source of truth: `/src/lib/utils/installment-calculator.ts`
- API endpoint: `/api/v1/divisions/:id/registration-options`

---

**Ready to implement Phase 1?** This is safe to do without affecting production since it's admin-only configuration. Payment dates will be stored, ready for Phase 2 backend calculations.

**Ready to implement Phase 2?** Backend calculation layer that uses stored payment dates to calculate installment plans based on registration timing.

---

**End of Implementation Guide**

Generated: January 3, 2026
Version: 2.1 (Backend-First Architecture)
