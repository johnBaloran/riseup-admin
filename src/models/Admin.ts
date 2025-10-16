// src/models/Admin.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * This model defines ONLY the Admin data structure and schema
 * No business logic, no queries - just the data model
 */

/**
 * Security
 * - Password hashing with bcrypt
 * - Password never returned in queries
 */

import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema;

// Type definitions
export type AdminRole =
  | "EXECUTIVE"
  | "COMMISSIONER"
  | "SCOREKEEPER"
  | "PHOTOGRAPHER";

// TypeScript interface
export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: AdminRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema definition
const adminSchema = new Schema<IAdmin>(
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
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Never include password in queries by default
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["EXECUTIVE", "COMMISSIONER", "SCOREKEEPER", "PHOTOGRAPHER"],
      required: [true, "Role is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for performance
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

// Hash password before saving
adminSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to compare passwords
adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export model
export default (mongoose.models.Admin as Model<IAdmin>) ||
  mongoose.model<IAdmin>("Admin", adminSchema);
