// src/models/Player.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player model - player profile data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

// src/models/Player.ts - Add paymentMethods to interface

export interface IPlayer extends mongoose.Document {
  // Basic Info
  playerName: string;
  user?: mongoose.Types.ObjectId; // Reference to User (parent/guardian)
  team?: mongoose.Types.ObjectId; // Current team
  division?: mongoose.Types.ObjectId; // Current division

  // Photos
  playerPhotos: mongoose.Types.ObjectId[]; // All photos featuring this player

  // Jersey Info
  jerseyNumber?: number;
  jerseyNumberTwo?: number;
  jerseyNumberThree?: number;
  jerseySize?: string;
  jerseyName?: string;

  // Player Image
  playerImage?: {
    id: string;
    image: string;
  };

  // Social
  instagram?: string;

  // Team Role
  teamCaptain: boolean;
  freeAgent: boolean;

  // Consent & Terms
  agreeToRefundPolicy: boolean;
  agreeToTerms: boolean;
  receiveNews: boolean;

  // Payment Info
  customerId?: string;
  paymentMethods: mongoose.Types.ObjectId[];
  paymentStatus: {
    hasPaid?: boolean;
    reminderCount?: number;
    teamCreatedDate?: Date;
    lastAttempt?: Date;
    email?: string;
    phoneNumber?: string;
    reminderLogs?: Array<{
      timestamp: Date;
      status: string;
      twilioSid?: string;
      errorMessage?: string;
      sentBy: string;
    }>;
  };
  subscriptionPayments: Array<any>;

  // Stats
  averageStats?: any;
  allStats: Array<any>;

  // Timestamps
  createdAt: Date;
}

const playerSchema = new Schema<IPlayer>(
  {
    playerName: {
      type: String,
      required: [true, "Player name is required"],
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
    },
    playerPhotos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GamePhoto",
      },
    ],
    jerseyNumber: Number,
    jerseyNumberTwo: Number,
    jerseyNumberThree: Number,
    jerseySize: String,
    jerseyName: String,
    playerImage: {
      id: String,
      image: String,
    },
    instagram: String,
    teamCaptain: {
      type: Boolean,
      default: false,
    },
    freeAgent: {
      type: Boolean,
      default: false,
    },
    agreeToRefundPolicy: {
      type: Boolean,
      default: false,
    },
    agreeToTerms: {
      type: Boolean,
      default: false,
    },
    receiveNews: {
      type: Boolean,
      default: false,
    },
    customerId: String,
    paymentMethods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaymentMethod",
      },
    ],
    paymentStatus: {
      hasPaid: Boolean,
      reminderCount: Number,
      teamCreatedDate: Date,
      lastAttempt: Date,
      email: String,
      phoneNumber: String,
      reminderLogs: [
        {
          timestamp: { type: Date, required: true },
          status: { type: String, required: true, enum: ["sent", "failed"] },
          twilioSid: String,
          errorMessage: String,
          sentBy: { type: String, required: true }, // "cron" or adminId
        },
      ],
    },
    averageStats: {
      points: { type: Number, default: 0 },
      rebounds: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      blocks: { type: Number, default: 0 },
      steals: { type: Number, default: 0 },
      threesMade: { type: Number, default: 0 },
      twosMade: { type: Number, default: 0 },
      freeThrowsMade: { type: Number, default: 0 },
    },
    allStats: [
      {
        type: {
          points: Number,
          rebounds: Number,
          assists: Number,
          blocks: Number,
          steals: Number,
          threesMade: Number,
          twosMade: Number,
          freeThrowsMade: Number,
          threesMiss: Number,
          twosMiss: Number,
          freeThrowsMiss: Number,
          fouls: Number,
          turnovers: Number,
          shotChartLists: Array,
          game: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game",
          },
          teamId: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
playerSchema.index({ playerName: "text" });
playerSchema.index({ user: 1 });
playerSchema.index({ team: 1 });
playerSchema.index({ division: 1 });
playerSchema.index({ freeAgent: 1 });

export default (mongoose.models.Player as mongoose.Model<IPlayer>) ||
  mongoose.model<IPlayer>("Player", playerSchema);
