// src/models/City.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * City model - ONLY city data structure
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface ICity extends mongoose.Document {
  cityName: string;
  stripeAccountId?: string;
  googleChatWebhook?: string;
  eTransferEmail?: string; // Email for receiving e-transfers
  region: string;
  country: string;
  timezone: string;
  active: boolean;
  locations: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const citySchema = new Schema<ICity>(
  {
    cityName: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
    },
    stripeAccountId: {
      type: String,
      trim: true,
    },
    googleChatWebhook: {
      type: String,
      trim: true,
    },
    eTransferEmail: {
      type: String,
      trim: true,
    },
    region: {
      type: String,
      required: [true, "Region is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    timezone: {
      type: String,
      required: [true, "Timezone is required"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    locations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Location",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
citySchema.index({ cityName: 1, region: 1, country: 1 }, { unique: true });
citySchema.index({ active: 1 });

export default (mongoose.models.City as mongoose.Model<ICity>) ||
  mongoose.model<ICity>("City", citySchema);
