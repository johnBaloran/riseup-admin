// src/models/Game.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Game model - game data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IGame extends mongoose.Document {
  gameName: string;
  date: Date;
  time: string;
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  homeTeamScore: number;
  awayTeamScore: number;
  status: boolean;
  started: boolean;
  division: mongoose.Types.ObjectId;
  location: string;
  players: mongoose.Types.ObjectId[];
  playerOfTheGame?: mongoose.Types.ObjectId;
  youtubeLink?: string;
  isPlayoffGame: boolean;
  gamePhotosCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<IGame>(
  {
    gameName: {
      type: String,
      required: [true, "Game name is required"],
    },
    date: {
      type: Date,
      required: [true, "Game date is required"],
    },
    time: {
      type: String,
      required: [true, "Game time is required"],
    },
    homeTeam: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Home team is required"],
    },
    awayTeam: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Away team is required"],
    },
    homeTeamScore: {
      type: Number,
      default: 0,
    },
    awayTeamScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: false,
    },
    started: {
      type: Boolean,
      default: false,
    },
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: [true, "Division is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    playerOfTheGame: {
      type: Schema.Types.ObjectId,
      ref: "Player",
    },
    youtubeLink: String,
    isPlayoffGame: {
      type: Boolean,
      default: false,
    },
    gamePhotosCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
gameSchema.index({ division: 1, date: -1 });
gameSchema.index({ date: -1 });
gameSchema.index({ status: 1 });
gameSchema.index({ gamePhotosCount: 1 });

export default (mongoose.models.Game as mongoose.Model<IGame>) ||
  mongoose.model<IGame>("Game", gameSchema);
