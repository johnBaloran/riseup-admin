// src/models/Player.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player model - player profile data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

// src/models/Player.ts - Add paymentMethods to interface

export interface IPlayer extends mongoose.Document {
  createdAt: Date;
  freeAgent: boolean;
  agreeToRefundPolicy: boolean;
  agreeToTerms: boolean;
  receiveNews: boolean;
  customerId?: string;
  subscriptionPayments: Array<any>;
  playerName: string;
  playerImage?: {
    id: string;
    image: string;
  };
  instagram?: string;
  jerseyNumber?: number;
  jerseyNumberTwo?: number;
  jerseyNumberThree?: number;
  jerseySize?: string;
  jerseyName?: string;
  team?: mongoose.Types.ObjectId;
  teamCaptain: boolean;
  paymentStatus: {
    hasPaid?: boolean;
    reminderCount?: number;
    teamCreatedDate?: Date;
    lastAttempt?: Date;
    email?: string;
    phoneNumber?: string;
  };
  paymentMethods: mongoose.Types.ObjectId[];
  user?: mongoose.Types.ObjectId;
  division?: mongoose.Types.ObjectId;
  personId?: mongoose.Types.ObjectId; // Face Recognition - Link to Person
  averageStats?: any;
  allStats: Array<any>;
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
    paymentStatus: {
      hasPaid: Boolean,
      reminderCount: Number,
      teamCreatedDate: Date,
      lastAttempt: Date,
      email: String,
      phoneNumber: String,
    },

    paymentMethods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaymentMethod",
      },
    ],
    personId: {
      type: Schema.Types.ObjectId,
      ref: "Person",
    },
    jerseyNumber: Number,
    jerseySize: String,
    jerseyName: String,
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
    playerImage: {
      id: String,
      image: String,
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
playerSchema.index({ personId: 1 });

export default (mongoose.models.Player as mongoose.Model<IPlayer>) ||
  mongoose.model<IPlayer>("Player", playerSchema);
