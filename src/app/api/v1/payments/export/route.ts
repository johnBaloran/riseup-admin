// src/app/api/v1/payments/export/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Export payments to CSV ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getPlayersWithPaymentStatus } from "@/lib/db/queries/payments";

interface PaymentExportPlayer {
  playerName: string;
  user?: {
    email?: string;
    phoneNumber?: string;
  };
  team?: {
    teamName: string;
  };
  division?: {
    divisionName: string;
    location?: {
      name: string;
    };
  };
  paymentStatus: string;
  paymentMethod?: {
    paymentType?: string;
    pricingTier?: string;
    installments?: {
      subscriptionPayments?: Array<{
        status: string;
      }>;
    };
  };
  createdAt?: Date;
}

/**
 * POST /api/v1/payments/export
 * Export payment data to CSV
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "view_payments")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { filters } = await request.json();

    const result = await getPlayersWithPaymentStatus({
      locationId: filters?.location,
      divisionId: filters?.division,
      teamId: filters?.team,
      paymentStatusFilter: filters?.payment || "all",
      search: filters?.search,
      limit: 10000, // High limit for export to get all records
    });

    // Create CSV content
    const headers = [
      "Player Name",
      "Email",
      "Phone",
      "Team",
      "Division",
      "Location",
      "Payment Status",
      "Payment Type",
      "Pricing Tier",
      "Registration Date",
      "Payments Completed",
      "Failed Payments",
    ];

    const rows = result.players.map((player: PaymentExportPlayer) => {
      const paymentMethod = player.paymentMethod;
      let paymentsCompleted = "N/A";
      let failedPayments = "N/A";

      if (paymentMethod?.paymentType === "INSTALLMENTS") {
        const subscriptionPayments =
          paymentMethod.installments?.subscriptionPayments || [];
        const completed = subscriptionPayments.filter(
          (p) => p.status === "succeeded"
        ).length;
        const failed = subscriptionPayments.filter(
          (p) => p.status === "failed"
        ).length;
        paymentsCompleted = `${completed}/8`;
        failedPayments = failed.toString();
      }

      return [
        player.playerName,
        player.user?.email || "",
        player.user?.phoneNumber || "",
        player.team?.teamName || "No Team",
        player.division?.divisionName || "",
        player.division?.location?.name || "",
        player.paymentStatus,
        paymentMethod?.paymentType || "None",
        paymentMethod?.pricingTier || "N/A",
        player.createdAt ? new Date(player.createdAt).toLocaleDateString() : "",
        paymentsCompleted,
        failedPayments,
      ];
    });

    // Convert to CSV format
    const csvContent = [
      headers.join(","),
      ...rows.map((row: string[]) =>
        row.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Return as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="payment-report-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting payment data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export payment data" },
      { status: 500 }
    );
  }
}
