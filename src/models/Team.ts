// src/models/Team.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team model - team data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface ITeam extends mongoose.Document {
  teamName: string;
  teamNameShort: string;
  teamCode: string;
  teamCaptain?: mongoose.Types.ObjectId;
  division: mongoose.Types.ObjectId;
  players: mongoose.Types.ObjectId[];
  games: mongoose.Types.ObjectId[];
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  wins: number;
  losses: number;
  pointDifference: number;
  createdManually: boolean;
  isCustomJersey: boolean;
  jerseyEdition?: string;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    teamNameShort: {
      type: String,
      required: [true, "Short team name is required"],
      trim: true,
    },
    teamCode: {
      type: String,
      required: [true, "Team code is required"],
      unique: true,
      uppercase: true,
    },
    teamCaptain: {
      type: Schema.Types.ObjectId,
      ref: "Player",
    },

    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: [true, "Division is required"],
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    games: [
      {
        type: Schema.Types.ObjectId,
        ref: "Game",
      },
    ],
    primaryColor: String,
    secondaryColor: String,
    tertiaryColor: String,
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    pointDifference: {
      type: Number,
      default: 0,
    },

    createdManually: {
      type: Boolean,
      default: false,
    },
    isCustomJersey: {
      type: Boolean,
      default: false,
    },
    jerseyEdition: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
teamSchema.index({ division: 1 });
teamSchema.index({ teamCode: 1 });
teamSchema.index({ players: 1 });

export default (mongoose.models.Team as mongoose.Model<ITeam>) ||
  mongoose.model<ITeam>("Team", teamSchema);
