// src/app/api/v1/admins/profile/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Admin self-service profile operations ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { updateAdmin } from "@/lib/db/queries/admins";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
});

/**
 * PATCH /api/v1/admins/profile
 * Update current admin's own profile (name, phone number only)
 * Email and role changes require manage_admins permission via /api/v1/admins/[id]
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const adminId = (session.user as any).id;
    const body = await request.json();

    // Validate input
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, phoneNumber } = validation.data;

    // Update profile
    const updatedAdmin = await updateAdmin(adminId, {
      name,
      phoneNumber,
    });

    if (!updatedAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        admin: updatedAdmin,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
