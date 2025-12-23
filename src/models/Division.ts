// src/models/Division.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Division model - division data structure ONLY
 *
 * ENHANCED WITH:
 * - Flexible season configuration
 * - Backward compatible with existing divisions
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface ISeasonConfig {
  regularSeasonWeeks: number; // Number of regular season weeks (default: 7)
  hasPlayoffs: boolean; // Whether division has playoffs (default: true)
  playoffStructure: {
    hasQuarterfinals: boolean; // Week after regular season (default: true)
    hasSemifinals: boolean; // Week after quarterfinals (default: true)
    hasFinals: boolean; // Week after semifinals (default: true)
  };
}

export interface IDivision extends mongoose.Document {
  // ===== EXISTING FIELDS (unchanged) =====
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
    regularInstallment?: mongoose.Types.ObjectId;
    firstInstallment?: mongoose.Types.ObjectId;
    free?: mongoose.Types.ObjectId;
  };

  earlyBirdDeadline?: Date; // Early bird registration deadline

  // ===== NEW SEASON CONFIGURATION (optional for backward compatibility) =====
  seasonConfig?: ISeasonConfig;

  createdAt: Date;
  updatedAt: Date;
}

const seasonConfigSchema = new Schema<ISeasonConfig>(
  {
    regularSeasonWeeks: {
      type: Number,
      default: 7,
      min: [1, "Must have at least 1 week"],
      max: [20, "Cannot exceed 20 weeks"],
    },
    hasPlayoffs: {
      type: Boolean,
      default: true,
    },
    playoffStructure: {
      hasQuarterfinals: {
        type: Boolean,
        default: true,
      },
      hasSemifinals: {
        type: Boolean,
        default: true,
      },
      hasFinals: {
        type: Boolean,
        default: true,
      },
    },
  },
  { _id: false } // Don't create _id for subdocument
);

const divisionSchema = new Schema<IDivision>(
  {
    // ===== EXISTING FIELDS =====
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
    earlyBirdDeadline: {
      type: Date,
    },

    // ===== NEW SEASON CONFIGURATION =====
    seasonConfig: {
      type: seasonConfigSchema,
      default: () => ({
        regularSeasonWeeks: 7,
        hasPlayoffs: true,
        playoffStructure: {
          hasQuarterfinals: true,
          hasSemifinals: true,
          hasFinals: true,
        },
      }),
    },
  },
  {
    timestamps: true,
  }
);

// ===== INDEXES =====
divisionSchema.index({ city: 1, location: 1 });
divisionSchema.index({ active: 1 });
divisionSchema.index({ register: 1 });
divisionSchema.index({ level: 1 });

export default (mongoose.models.Division as mongoose.Model<IDivision>) ||
  mongoose.model<IDivision>("Division", divisionSchema);
