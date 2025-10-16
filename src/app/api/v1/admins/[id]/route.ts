// src/app/api/v1/admins/[id]/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Individual admin operations ONLY (GET, PATCH, DELETE)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getAdminById,
  updateAdmin,
  deleteAdmin,
  deactivateAdmin,
  reactivateAdmin,
} from "@/lib/db/queries/admins";

/**
 * GET /api/v1/admins/[id]
 * Get single admin by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_admins")) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    const admin = await getAdminById(params.id);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        admin,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching admin:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch admin" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/admins/[id]
 * Update admin details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_admins")) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, phoneNumber, role, password, action } = body;

    // Handle special actions
    if (action === "deactivate") {
      const admin = await deactivateAdmin(params.id);
      return NextResponse.json(
        {
          success: true,
          message: "Admin deactivated successfully",
          admin,
        },
        { status: 200 }
      );
    }

    if (action === "reactivate") {
      const admin = await reactivateAdmin(params.id);
      return NextResponse.json(
        {
          success: true,
          message: "Admin reactivated successfully",
          admin,
        },
        { status: 200 }
      );
    }

    // Regular update
    const admin = await updateAdmin(params.id, {
      name,
      email,
      phoneNumber,
      role,
      password,
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Admin updated successfully",
        admin,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating admin:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update admin" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/admins/[id]
 * Permanently delete admin
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_admins")) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    // Prevent deleting yourself
    if ((session.user as any).id === params.id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const deleted = await deleteAdmin(params.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Admin deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete admin" },
      { status: 500 }
    );
  }
}
