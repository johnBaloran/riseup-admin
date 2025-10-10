// src/models/Level.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Level model - skill tier data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface ILevel extends mongoose.Document {
  name: string;
  grade: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const levelSchema = new Schema<ILevel>(
  {
    name: {
      type: String,
      required: [true, "Level name is required"],
      unique: true,
      trim: true,
    },
    grade: {
      type: Number,
      required: [true, "Grade is required"],
      min: [1, "Grade must be at least 1"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
levelSchema.index({ grade: 1 });
levelSchema.index({ name: 1 });

export default (mongoose.models.Level as mongoose.Model<ILevel>) ||
  mongoose.model<ILevel>("Level", levelSchema);
