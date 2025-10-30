// src/models/GamePhoto.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * GamePhoto model - game photo data structure with face recognition
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IBoundingBox {
  width: number;
  height: number;
  left: number;
  top: number;
}

export interface IDetectedFace {
  faceId: string;
  boundingBox: IBoundingBox;
  confidence: number;
  personId?: mongoose.Types.ObjectId;
  playerId?: mongoose.Types.ObjectId;
  manuallyLinked: boolean;
}

export interface IGamePhoto extends mongoose.Document {
  url: string;
  publicId: string;
  thumbnail: string;
  game: mongoose.Types.ObjectId;
  photographer?: mongoose.Types.ObjectId;
  tags: string[];
  isHighlight: boolean;
  uploadedAt: Date;

  // Face Recognition
  detectedFaces: IDetectedFace[];
  faceProcessingStatus: "pending" | "processing" | "completed" | "failed";
  faceProcessingError?: string;
  faceProcessedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const detectedFaceSchema = new Schema<IDetectedFace>(
  {
    faceId: {
      type: String,
      required: true,
    },
    boundingBox: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      left: { type: Number, required: true },
      top: { type: Number, required: true },
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    personId: {
      type: Schema.Types.ObjectId,
      ref: "Person",
    },
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "Player",
    },
    manuallyLinked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

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

    // Face Recognition Fields
    detectedFaces: [detectedFaceSchema],
    faceProcessingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    faceProcessingError: String,
    faceProcessedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
gamePhotoSchema.index({ game: 1, uploadedAt: -1 });
gamePhotoSchema.index({ publicId: 1 }, { unique: true });
gamePhotoSchema.index({ isHighlight: 1 });
gamePhotoSchema.index({ faceProcessingStatus: 1 });
gamePhotoSchema.index({ "detectedFaces.personId": 1 });

export default (mongoose.models.GamePhoto as mongoose.Model<IGamePhoto>) ||
  mongoose.model<IGamePhoto>("GamePhoto", gamePhotoSchema);
