// src/models/Division.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Division model - division data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IDivision extends mongoose.Document {
  divisionName: string;
  city: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId;
  level: mongoose.Types.ObjectId;
  day: string;
  startDate: Date;
  startTime: string;
  endTime: string;
  active: boolean;
  register: boolean;
  description: string;
  teams: mongoose.Types.ObjectId[];
  games: mongoose.Types.ObjectId[];
  earlyBirdOpen: boolean;
  prices: {
    earlyBird?: mongoose.Types.ObjectId;
    regular?: mongoose.Types.ObjectId;
    installment?: mongoose.Types.ObjectId;
    firstInstallment?: mongoose.Types.ObjectId;
    free?: mongoose.Types.ObjectId;
  };
  jerseyDeadline?: Date; // NEW: Jersey selection deadline

  createdAt: Date;
  updatedAt: Date;
}

const divisionSchema = new Schema<IDivision>(
  {
    divisionName: {
      type: String,
      required: [true, "Division name is required"],
      trim: true,
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: [true, "City is required"],
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: [true, "Location is required"],
    },
    level: {
      type: Schema.Types.ObjectId,
      ref: "Level",
      required: [true, "Level is required"],
    },
    day: {
      type: String,
      required: [true, "Day is required"],
    },
    startDate: {
      type: Date,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    active: {
      type: Boolean,
      default: false,
    },
    register: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    games: [
      {
        type: Schema.Types.ObjectId,
        ref: "Game",
      },
    ],

    prices: {
      earlyBird: {
        type: Schema.Types.ObjectId,
        ref: "Price",
      },
      regular: {
        type: Schema.Types.ObjectId,
        ref: "Price",
      },
      installment: {
        type: Schema.Types.ObjectId,
        ref: "Price",
      },
      regularInstallment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Price",
      },
      firstInstallment: {
        type: Schema.Types.ObjectId,
        ref: "Price",
      },
      free: {
        type: Schema.Types.ObjectId,
        ref: "Price",
      },
    },
    jerseyDeadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
divisionSchema.index({ city: 1, location: 1 });
divisionSchema.index({ active: 1 });
divisionSchema.index({ register: 1 });
divisionSchema.index({ level: 1 });

export default (mongoose.models.Division as mongoose.Model<IDivision>) ||
  mongoose.model<IDivision>("Division", divisionSchema);
