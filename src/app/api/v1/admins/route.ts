// src/app/api/v1/admins/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Admins API endpoint ONLY
 */

/**
 * Security
 * Only EXECUTIVE can manage admins
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { getAdmins, createAdmin, emailExists } from "@/lib/db/queries/admins";
import { z } from "zod";

// Validation schema
const createAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number"),
  phoneNumber: z.string().optional(),
  role: z.enum(["EXECUTIVE", "COMMISSIONER", "SCOREKEEPER", "PHOTOGRAPHER"]),
});

/**
 * GET /api/v1/admins
 * Fetch all admins (EXECUTIVE only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EXECUTIVE") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const admins = await getAdmins();

    return NextResponse.json({ success: true, data: admins }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admins
 * Create new admin (EXECUTIVE only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EXECUTIVE") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validatedData = createAdminSchema.parse(body);

    // Check if email exists
    const exists = await emailExists(validatedData.email);
    if (exists) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 409 }
      );
    }

    // Create admin
    const admin = await createAdmin(validatedData);

    return NextResponse.json({ success: true, data: admin }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating admin:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create admin" },
      { status: 500 }
    );
  }
}
