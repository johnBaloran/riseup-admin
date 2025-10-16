// src/models/PaymentMethod.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * PaymentMethod model - payment tracking data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IPaymentMethod extends mongoose.Document {
  player: mongoose.Types.ObjectId;
  division: mongoose.Types.ObjectId;
  paymentType: "FULL_PAYMENT" | "INSTALLMENTS" | "CASH" | "TERMINAL";
  pricingTier: "EARLY_BIRD" | "REGULAR";
  originalPrice: number;
  amountPaid: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
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
    receivedBy?: mongoose.Types.ObjectId; // Reference to Admin who received payment
  };
  terminalPayment?: {
    paymentIntentId: string; // pi_xxxxx
    chargeId?: string; // ch_xxxxx
    cardBrand?: string; // visa, mastercard, amex
    cardLast4?: string; // 4242
    amount: number; // Amount in cents
    readerId: string; // tmr_xxxxx
    readerLabel?: string; // "Front Desk Terminal"
    authorizationCode?: string;
    paidDate: Date;
    processedBy: mongoose.Types.ObjectId; // Admin who processed
    receiptUrl?: string;
    status: "processing" | "succeeded" | "failed";
  };
  createdAt: Date;
  updatedAt: Date;
}

const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    player: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: [true, "Player is required"],
    },
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: [true, "Division is required"],
    },
    paymentType: {
      type: String,
      enum: ["FULL_PAYMENT", "INSTALLMENTS", "CASH", "TERMINAL"],
      required: [true, "Payment type is required"],
    },
    pricingTier: {
      type: String,
      enum: ["EARLY_BIRD", "REGULAR"],
      required: [true, "Pricing tier is required"],
    },
    originalPrice: {
      type: Number,
      required: [true, "Original price is required"],
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
      default: "PENDING",
    },
    installments: {
      subscriptionId: String,
      totalAmountDue: Number,
      remainingBalance: Number,
      nextPaymentDate: Date,
      subscriptionPayments: [
        {
          invoiceId: String,
          status: {
            type: String,
            enum: ["succeeded", "failed", "pending"],
          },
          amountPaid: Number,
          attemptCount: Number,
          lastAttempt: Date,
          paymentLink: String,
          paymentNumber: Number,
          dueDate: Date,
        },
      ],
    },
    cashPayment: {
      paidDate: Date,
      notes: String,
      receivedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
      },
    },
    terminalPayment: {
      paymentIntentId: String,
      chargeId: String,
      cardBrand: String,
      cardLast4: String,
      amount: Number,
      readerId: String,
      readerLabel: String,
      authorizationCode: String,
      paidDate: Date,
      processedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
      },
      receiptUrl: String,
      status: {
        type: String,
        enum: ["processing", "succeeded", "failed"],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentMethodSchema.index({ player: 1, division: 1 });
paymentMethodSchema.index({ division: 1, status: 1 });
paymentMethodSchema.index({ status: 1 });

// Middleware: Auto-calculate remaining balance when installment payments update
paymentMethodSchema.pre("save", function (next) {
  if (
    this.paymentType === "INSTALLMENTS" &&
    this.installments?.subscriptionPayments
  ) {
    const totalPaid = this.installments.subscriptionPayments
      .filter((payment) => payment.status === "succeeded")
      .reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);

    if (this.installments.totalAmountDue) {
      this.installments.remainingBalance =
        this.installments.totalAmountDue - totalPaid;
    }
    this.amountPaid = totalPaid;

    // Auto-complete if all payments succeeded
    const allPaid = this.installments.subscriptionPayments.every(
      (p) => p.status === "succeeded"
    );
    if (allPaid && this.installments.remainingBalance === 0) {
      this.status = "COMPLETED";
    }
  }
  next();
});

export default (mongoose.models
  .PaymentMethod as mongoose.Model<IPaymentMethod>) ||
  mongoose.model<IPaymentMethod>("PaymentMethod", paymentMethodSchema);
