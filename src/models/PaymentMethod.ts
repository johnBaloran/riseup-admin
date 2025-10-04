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
  paymentType: "FULL_PAYMENT" | "INSTALLMENTS" | "ETRANSFER" | "CASH";
  status: "PENDING" | "COMPLETED" | "FAILED" | "IN_PROGRESS";
  totalAmount: number;
  amountPaid: number;
  eTransferTransaction?: {
    referenceNumber: string;
    senderEmail: string;
    amountPaid: number;
    date: Date;
    notes?: string;
  };
  cashTransaction?: {
    receivedBy: string;
    receivedAt: Date;
    receiptNumber: string;
    amountPaid: number;
    notes?: string;
  };
  installmentPlan?: {
    totalInstallments: number;
    completedInstallments: number;
    installmentAmount: number;
    nextPaymentDate: Date;
  };
  installmentReminders: Array<{
    sentAt: Date;
    type: "SMS" | "EMAIL";
    status: "SENT" | "FAILED";
  }>;
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
      enum: ["FULL_PAYMENT", "INSTALLMENTS", "ETRANSFER", "CASH"],
      required: [true, "Payment type is required"],
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "IN_PROGRESS"],
      default: "PENDING",
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    eTransferTransaction: {
      referenceNumber: String,
      senderEmail: String,
      amountPaid: Number,
      date: Date,
      notes: String,
    },
    cashTransaction: {
      receivedBy: String,
      receivedAt: Date,
      receiptNumber: String,
      amountPaid: Number,
      notes: String,
    },
    installmentPlan: {
      totalInstallments: Number,
      completedInstallments: { type: Number, default: 0 },
      installmentAmount: Number,
      nextPaymentDate: Date,
    },
    installmentReminders: [
      {
        sentAt: { type: Date, default: Date.now },
        type: { type: String, enum: ["SMS", "EMAIL"] },
        status: { type: String, enum: ["SENT", "FAILED"] },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentMethodSchema.index({ player: 1 });
paymentMethodSchema.index({ division: 1 });
paymentMethodSchema.index({ status: 1 });
paymentMethodSchema.index({ paymentType: 1 });

export default (mongoose.models
  .PaymentMethod as mongoose.Model<IPaymentMethod>) ||
  mongoose.model<IPaymentMethod>("PaymentMethod", paymentMethodSchema);
