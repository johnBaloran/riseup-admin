// src/models/Person.ts

/**
 * Person Model - Face Recognition
 *
 * Purpose: Represents a unique human face identity indexed in AWS Rekognition
 *
 * Key Concept:
 * - Person = Permanent face identity (persists across seasons)
 * - Player = Roster entry (changes per division/season)
 * - One Person can have multiple Players across different seasons
 *
 * Example Flow:
 * 1. Photo uploaded → Face detected → AWS Rekognition creates faceId
 * 2. New Person created with that faceId
 * 3. Admin links Person to Player (current roster)
 * 4. Next season: Same Person linked to new Player (new roster entry)
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
  faceId: string;
  metadata: {
    averageConfidence: number;
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
    faceId: {
      type: String,
      required: [true, "Face ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    metadata: {
      averageConfidence: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    suggestedDuplicates: [suggestedDuplicateSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for query optimization
personSchema.index({ faceId: 1 }, { unique: true });

export default (mongoose.models.Person as mongoose.Model<IPerson>) ||
  mongoose.model<IPerson>("Person", personSchema);
