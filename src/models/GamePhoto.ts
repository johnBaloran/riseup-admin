// src/models/GamePhoto.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * GamePhoto model - game photo data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IGamePhoto extends mongoose.Document {
  url: string;
  publicId: string;
  thumbnail: string;
  game: mongoose.Types.ObjectId;
  photographer?: mongoose.Types.ObjectId;
  tags: string[];
  isHighlight: boolean;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const gamePhotoSchema = new Schema<IGamePhoto>(
  {
    url: {
      type: String,
      required: [true, "Photo URL is required"],
    },
    publicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
      unique: true,
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail URL is required"],
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: [true, "Game is required"],
    },
    photographer: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    tags: [String],
    isHighlight: {
      type: Boolean,
      default: false,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
gamePhotoSchema.index({ game: 1, uploadedAt: -1 });
gamePhotoSchema.index({ publicId: 1 }, { unique: true });
gamePhotoSchema.index({ isHighlight: 1 });

export default (mongoose.models.GamePhoto as mongoose.Model<IGamePhoto>) ||
  mongoose.model<IGamePhoto>("GamePhoto", gamePhotoSchema);
