// src/app/api/v1/terminal/readers/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Terminal readers management API endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/constants/permissions";
import {
  listTerminalReaders,
  registerTerminalReader,
  deleteTerminalReader,
} from "@/lib/services/stripe-terminal-service";

/**
 * GET /api/v1/terminal/readers
 * List all terminal readers
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role, "view_terminal")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const readers = await listTerminalReaders();

    return NextResponse.json({ readers }, { status: 200 });
  } catch (error: any) {
    console.error("Error listing terminal readers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list terminal readers" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/terminal/readers
 * Register a new terminal reader
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role, "manage_terminal")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { registrationCode, label, location } = body;

    if (!registrationCode || !label) {
      return NextResponse.json(
        { error: "Registration code and label are required" },
        { status: 400 }
      );
    }

    const reader = await registerTerminalReader({
      registrationCode,
      label,
      location,
    });

    return NextResponse.json(
      {
        message: "Terminal reader registered successfully",
        reader,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error registering terminal reader:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register terminal reader" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/terminal/readers?readerId=xxx
 * Delete/unregister a terminal reader
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role, "manage_terminal")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const readerId = searchParams.get("readerId");

    if (!readerId) {
      return NextResponse.json(
        { error: "Reader ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteTerminalReader(readerId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete terminal reader" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Terminal reader deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting terminal reader:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete terminal reader" },
      { status: 500 }
    );
  }
}
