// src/app/api/v1/exports/players/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Export players with linked user accounts to Excel ONLY
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db/mongodb";
import Player from "@/models/Player";
import * as XLSX from "xlsx";

/**
 * GET /api/v1/exports/players
 * Export all players with linked user accounts to Excel
 * Only EXECUTIVE role can access this endpoint
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication and permission
    if (!session || !hasPermission(session, "export_players")) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Executive access required" },
        { status: 403 }
      );
    }

    await connectDB();

    // Query players with user accounts linked and teams assigned
    const players = await Player.find({
      user: { $exists: true, $ne: null },
      team: { $exists: true, $ne: null },
    })
      .populate({
        path: "user",
        select: "name email phoneNumber",
      })
      .populate({
        path: "team",
        select: "teamName",
      })
      .populate({
        path: "division",
        populate: [
          {
            path: "city",
            select: "cityName",
          },
          {
            path: "location",
            select: "name",
          },
        ],
      })
      .lean()
      .exec();

    // Prepare data for Excel
    const excelData = players.map((player: any) => ({
      "Player Name": player.playerName || "",
      Email: player.user?.email || "",
      "Phone Number": player.user?.phoneNumber || "",
      "Team Name": player.team?.teamName || "",
      City: player.division?.city?.cityName || "",
      Location: player.division?.location?.name || "",
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    worksheet["!cols"] = [
      { wch: 25 }, // Player Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone Number
      { wch: 25 }, // Team Name
      { wch: 20 }, // City
      { wch: 30 }, // Location
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Players");

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Return Excel file as download
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="registered-players-${
          new Date().toISOString().split("T")[0]
        }.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting players:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export players" },
      { status: 500 }
    );
  }
}
