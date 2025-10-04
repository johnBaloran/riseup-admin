// src/models/Player.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player model - player profile data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IPlayer extends mongoose.Document {
  playerName: string;
  user?: mongoose.Types.ObjectId;
  team?: mongoose.Types.ObjectId;
  division?: mongoose.Types.ObjectId;
  jerseyNumber?: number;
  jerseySize?: string;
  jerseyName?: string;
  instagram?: string;
  teamCaptain: boolean;
  freeAgent: boolean;
  agreeToRefundPolicy: boolean;
  agreeToTerms: boolean;
  receiveNews: boolean;
  customerId?: string;
  playerImage?: {
    id: string;
    image: string;
  };
  averageStats?: {
    points: number;
    rebounds: number;
    assists: number;
    blocks: number;
    steals: number;
    threesMade: number;
    twosMade: number;
    freeThrowsMade: number;
  };
  createdAt: Date;
  updatedAt: Date;
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
