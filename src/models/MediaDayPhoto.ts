// src/models/MediaDayPhoto.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * MediaDayPhoto model - media day photo data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IMediaDayPhoto extends mongoose.Document {
  url: string;
  publicId: string;
  thumbnail: string;
  location: mongoose.Types.ObjectId;
  date: Date;
  photographer?: mongoose.Types.ObjectId;
  tags: string[];
  isHighlight: boolean;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mediaDayPhotoSchema = new Schema<IMediaDayPhoto>(
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
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: [true, "Location is required"],
    },
    date: {
      type: Date,
      required: [true, "Media day date is required"],
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
mediaDayPhotoSchema.index({ location: 1, date: -1 });
mediaDayPhotoSchema.index({ publicId: 1 }, { unique: true });
mediaDayPhotoSchema.index({ date: -1 });
mediaDayPhotoSchema.index({ isHighlight: 1 });

export default (mongoose.models
  .MediaDayPhoto as mongoose.Model<IMediaDayPhoto>) ||
  mongoose.model<IMediaDayPhoto>("MediaDayPhoto", mediaDayPhotoSchema);
