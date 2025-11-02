// src/models/Person.ts

/**
 * Person Model - Face Recognition (Game-Scoped Architecture)
 *
 * Purpose: Represents a unique human face identity detected in a game
 *
 * Key Concept:
 * - Person = Face identity in a specific game (game-scoped)
 * - Player = Roster entry (can be linked to multiple persons across games)
 * - One Person belongs to one game
 * - One Player can have multiple Persons (one per game they appear in)
 *
 * Example Flow:
 * 1. Photo uploaded for Game A → Face detected → Person created for Game A
 * 2. Admin links Person to Player
 * 3. Photo uploaded for Game B → Same face detected → New Person created for Game B
 * 4. Admin links new Person to same Player
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface ISuggestedDuplicate {
  personId: mongoose.Types.ObjectId;
  similarity: number;
  status: "pending" | "confirmed" | "rejected";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
}

export interface IPerson extends mongoose.Document {
  gameId: mongoose.Types.ObjectId; // Game-scoped: Person exists only within one game
  playerId?: mongoose.Types.ObjectId; // Manual link to Player (optional)
  faceId?: string; // AWS Rekognition temp ID (deleted after processing)
  faceCropUrl: string; // Cloudinary face crop URL (permanent)
  metadata: {
    qualityScore: number; // AWS quality score (0-100) = (brightness + sharpness) / 2
  };
  suggestedDuplicates?: ISuggestedDuplicate[];
  createdAt: Date;
  updatedAt: Date;
}

const suggestedDuplicateSchema = new Schema<ISuggestedDuplicate>(
  {
    personId: {
      type: Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    similarity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    reviewedAt: Date,
  },
  { _id: false }
);

const personSchema = new Schema<IPerson>(
  {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: [true, "Game ID is required"],
      index: true, // Index for fast game-scoped queries
    },
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: false,
      index: true, // Index for querying all photos of a player
    },
    faceId: {
      type: String,
      required: false, // Optional - deleted after processing
      sparse: true, // Allow multiple null values (unique index only for non-null)
      trim: true,
      index: true, // Index for fast lookups during face matching
    },
    faceCropUrl: {
      type: String,
      required: [true, "Face crop URL is required"],
      trim: true,
    },
    metadata: {
      qualityScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100, // Quality score from AWS (brightness + sharpness) / 2
      },
    },
    suggestedDuplicates: [suggestedDuplicateSchema],
  },
  {
    timestamps: true,
    collection: "persons",
  }
);

// Indexes for query optimization
personSchema.index({ gameId: 1 });
personSchema.index({ playerId: 1 });
personSchema.index({ faceId: 1 }, { sparse: true }); // Sparse allows multiple nulls

export default (mongoose.models.Person as mongoose.Model<IPerson>) ||
  mongoose.model<IPerson>("Person", personSchema);
