// src/models/User.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * User model - customer account data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  phoneNumber?: string;
  instagram?: string;
  password?: string;
  type: string;
  stripeCustomerId?: string;
  jerseyInformation?: {
    jerseySize?: string;
    jerseyName?: string;
    jerseyNumber?: string;
  };
  basketball: mongoose.Types.ObjectId[];
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: String,
    instagram: String,
    password: String,
    type: {
      type: String,
      required: [true, "User type is required"],
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    jerseyInformation: {
      jerseySize: String,
      jerseyName: String,
      jerseyNumber: String,
    },
    basketball: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    resetToken: String,
    resetTokenExpiry: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ stripeCustomerId: 1 });

export default (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);
