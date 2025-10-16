// scripts/seed-admin.ts

/**
 * Seed script to create a super admin account
 *
 * Usage:
 *   npm run seed:admin
 *
 * Environment variables required:
 *   MONGODB_URI - MongoDB connection string
 *
 * Optional environment variables (will prompt if not provided):
 *   ADMIN_NAME - Admin name
 *   ADMIN_EMAIL - Admin email
 *   ADMIN_PASSWORD - Admin password
 *   ADMIN_PHONE - Admin phone number (optional)
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../src/models/Admin";
import readline from "readline";

// Load environment variables
dotenv.config({ path: ".env.local" });

interface AdminInput {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify readline question
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function getAdminInput(): Promise<AdminInput> {
  const input: AdminInput = {
    name: "",
    email: "",
    password: "",
  };

  // Get name
  if (process.env.ADMIN_NAME) {
    input.name = process.env.ADMIN_NAME;
    console.log(`Name: ${input.name} (from env)`);
  } else {
    input.name = await question("Enter admin name: ");
  }

  // Get email
  if (process.env.ADMIN_EMAIL) {
    input.email = process.env.ADMIN_EMAIL;
    console.log(`Email: ${input.email} (from env)`);
  } else {
    input.email = await question("Enter admin email: ");
  }

  // Get password
  if (process.env.ADMIN_PASSWORD) {
    input.password = process.env.ADMIN_PASSWORD;
    console.log("Password: ******** (from env)");
  } else {
    input.password = await question("Enter admin password: ");
  }

  // Get phone number (optional)
  if (process.env.ADMIN_PHONE) {
    input.phoneNumber = process.env.ADMIN_PHONE;
    console.log(`Phone: ${input.phoneNumber} (from env)`);
  } else {
    const phone = await question("Enter admin phone number (optional, press enter to skip): ");
    if (phone.trim()) {
      input.phoneNumber = phone.trim();
    }
  }

  return input;
}

async function seedAdmin() {
  try {
    console.log("<1 Starting admin seed script...\n");

    // Check for MongoDB URI
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    // Connect to MongoDB
    console.log("=� Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(" Connected to MongoDB\n");

    // Get admin input
    const adminInput = await getAdminInput();

    // Validate input
    if (!adminInput.name || !adminInput.email || !adminInput.password) {
      throw new Error("Name, email, and password are required");
    }

    if (adminInput.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminInput.email });

    if (existingAdmin) {
      console.log(`\n�  Admin with email ${adminInput.email} already exists`);
      const overwrite = await question("Do you want to update this admin? (yes/no): ");

      if (overwrite.toLowerCase() !== "yes" && overwrite.toLowerCase() !== "y") {
        console.log("L Seed cancelled");
        process.exit(0);
      }

      // Update existing admin
      existingAdmin.name = adminInput.name;
      existingAdmin.password = adminInput.password;
      if (adminInput.phoneNumber) {
        existingAdmin.phoneNumber = adminInput.phoneNumber;
      }
      existingAdmin.role = "EXECUTIVE";
      existingAdmin.isActive = true;

      await existingAdmin.save();
      console.log("\n Admin updated successfully!");
    } else {
      // Create new admin
      const admin = await Admin.create({
        name: adminInput.name,
        email: adminInput.email,
        password: adminInput.password,
        phoneNumber: adminInput.phoneNumber,
        role: "EXECUTIVE",
        isActive: true,
      });

      console.log("\n Super admin created successfully!");
    }

    console.log("\n=� Admin Details:");
    console.log(`   Name: ${adminInput.name}`);
    console.log(`   Email: ${adminInput.email}`);
    console.log(`   Role: EXECUTIVE (Super Admin)`);
    if (adminInput.phoneNumber) {
      console.log(`   Phone: ${adminInput.phoneNumber}`);
    }

    console.log("\n<� Seed completed successfully!");
  } catch (error: any) {
    console.error("\nL Error seeding admin:", error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log("\n=� MongoDB connection closed");
    process.exit(0);
  }
}

// Run the seed script
seedAdmin();
