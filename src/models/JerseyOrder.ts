// src/models/JerseyOrder.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * JerseyOrder model - jersey order tracking data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IJerseyOrder extends mongoose.Document {
  team: mongoose.Types.ObjectId;
  division: mongoose.Types.ObjectId;
  type: "MANUFACTURER_ORDER" | "IN_STOCK";
  players: Array<{
    playerId: mongoose.Types.ObjectId;
    jerseyNumber?: number;
    jerseySize?: string;
    jerseyName?: string;
  }>;
  adminStatus:
    | "INCOMPLETE"
    | "PENDING_REVIEW"
    | "READY_TO_ORDER"
    | "ORDERED"
    | "COMPLETED";
  manufacturerStatus:
    | "PENDING"
    | "IN_PRODUCTION"
    | "QUALITY_CHECK"
    | "COMPLETED"
    | "SHIPPED";
  inStockStatus: "PENDING" | "ASSIGNED" | "DELIVERED";
  adminNotes?: string;
  manufacturerNotes?: string;
  dateOrdered?: Date;
  dateProductionCompleted?: Date;
  dateAssigned?: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const jerseyOrderSchema = new Schema<IJerseyOrder>(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Team is required"],
    },
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: [true, "Division is required"],
    },
    type: {
      type: String,
      enum: ["MANUFACTURER_ORDER", "IN_STOCK"],
      required: [true, "Order type is required"],
    },
    players: [
      {
        playerId: {
          type: Schema.Types.ObjectId,
          ref: "Player",
        },
        jerseyNumber: Number,
        jerseySize: String,
        jerseyName: String,
      },
    ],
    adminStatus: {
      type: String,
      enum: [
        "INCOMPLETE",
        "PENDING_REVIEW",
        "READY_TO_ORDER",
        "ORDERED",
        "COMPLETED",
      ],
      default: "INCOMPLETE",
    },
    manufacturerStatus: {
      type: String,
      enum: [
        "PENDING",
        "IN_PRODUCTION",
        "QUALITY_CHECK",
        "COMPLETED",
        "SHIPPED",
      ],
      default: "PENDING",
    },
    inStockStatus: {
      type: String,
      enum: ["PENDING", "ASSIGNED", "DELIVERED"],
      default: "PENDING",
    },
    adminNotes: String,
    manufacturerNotes: String,
    dateOrdered: Date,
    dateProductionCompleted: Date,
    dateAssigned: Date,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
jerseyOrderSchema.index({ team: 1 });
jerseyOrderSchema.index({ division: 1 });
jerseyOrderSchema.index({ type: 1 });
jerseyOrderSchema.index({ adminStatus: 1 });
jerseyOrderSchema.index({ manufacturerStatus: 1 });
jerseyOrderSchema.index({ "players.playerId": 1 });

export default (mongoose.models.JerseyOrder as mongoose.Model<IJerseyOrder>) ||
  mongoose.model<IJerseyOrder>("JerseyOrder", jerseyOrderSchema);
