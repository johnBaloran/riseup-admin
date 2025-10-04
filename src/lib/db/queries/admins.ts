// src/lib/db/queries/admins.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * This file handles ONLY admin database queries
 * No validation, no business logic, just data access
 */

/**
 * DRY Principle
 * Centralized admin queries - used by API routes and pages
 */

import { connectDB } from "../mongodb";
import Admin, { IAdmin } from "@/models/Admin";
import Location from "@/models/Location";
import bcrypt from "bcryptjs";

// Type for lean query results (plain objects without Mongoose methods)
type LeanAdmin = Omit<IAdmin, keyof Document>;

/**
 * Get all admins (without passwords)
 */
export async function getAdmins(): Promise<IAdmin[]> {
  await connectDB();
  return Admin.find()
    .select("-password")
    .populate("assignedLocations", "name address")
    .sort({ createdAt: -1 })
    .lean();
}

/**
 * Get admin by ID
 */
export async function getAdminById(id: string): Promise<IAdmin | null> {
  await connectDB();
  return Admin.findById(id)
    .select("-password")
    .populate("assignedLocations", "name address")
    .lean();
}

/**
 * Get admin by email (with password for auth)
 */
export async function getAdminByEmail(email: string) {
  await connectDB();
  return Admin.findOne({ email: email.toLowerCase() }).select("+password");
}

/**
 * Create new admin
 * Hashes password before storing
 */
export async function createAdmin(data: {
  name: string;
  email: string;
  password: string;
  role: IAdmin["role"];
  phoneNumber?: string;
  assignedLocations?: string[];
}): Promise<IAdmin> {
  await connectDB();

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(data.password, 12);

  const admin = await Admin.create({
    ...data,
    password: hashedPassword,
    email: data.email.toLowerCase(),
    isActive: true,
  });

  // Return without password
  return Admin.findById(admin._id)
    .select("-password")
    .lean() as Promise<IAdmin>;
}

/**
 * Update admin's last login
 */
export async function updateLastLogin(adminId: string): Promise<void> {
  await connectDB();
  await Admin.findByIdAndUpdate(adminId, { lastLogin: new Date() });
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  await connectDB();
  const count = await Admin.countDocuments({ email: email.toLowerCase() });
  return count > 0;
}
