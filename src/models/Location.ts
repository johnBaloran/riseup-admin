// src/models/Location.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Location model - ONLY location data structure
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface ILocation extends mongoose.Document {
  name: string;
  address: string;
  city: mongoose.Types.ObjectId;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: [true, "City is required"],
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
locationSchema.index({ city: 1 });
locationSchema.index({ isActive: 1 });
locationSchema.index({ "coordinates.latitude": 1, "coordinates.longitude": 1 });

export default (mongoose.models.Location as mongoose.Model<ILocation>) ||
  mongoose.model<ILocation>("Location", locationSchema);
