// src/app/api/cron/daily-report/route.ts

/**
 * Google Chat Daily Report Cron Job
 * Sends last 24 hours payment analytics to Google Chat
 * This endpoint is excluded from NextAuth middleware
 */

import { NextRequest, NextResponse } from "next/server";
import { getDailyReportAnalytics } from "@/lib/db/queries/daily-report";

export async function GET(request: NextRequest) {
  try {
    // Verify authorization (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.DAILY_REPORT_SECRET;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check for test mode (preview only, don't send to Chat)
    const { searchParams } = new URL(request.url);
    const testMode = searchParams.get("test") === "true";

    // Get last 24 hours analytics
    const analytics = await getDailyReportAnalytics();

    // Format Google Chat message
    const message = formatGoogleChatMessage(analytics);

    // Test mode: return preview without sending
    if (testMode) {
      return NextResponse.json({
        success: true,
        message: "Test mode - message not sent to Google Chat",
        preview: message.text,
        data: analytics,
      });
    }

    // Send to Google Chat webhook (if configured)
    const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;

    if (!webhookUrl) {
      // Return formatted message for testing without sending to Chat
      return NextResponse.json({
        success: false,
        message: "Google Chat webhook URL not configured",
        preview: message.text,
        data: analytics,
      });
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Google Chat webhook failed: ${response.statusText}`);
    }

    return NextResponse.json({
      success: true,
      message: "Daily report sent to Google Chat",
      preview: message.text,
      data: analytics,
    });
  } catch (error) {
    console.error("Error sending daily report:", error);
    return NextResponse.json(
      {
        error: "Failed to send daily report",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * Format analytics data for Google Chat card message
 */
function formatGoogleChatMessage(analytics: any) {
  const {
    citiesBreakdown,
    totalRevenue,
    totalPayments,
    allTimeCitiesBreakdown,
    allTimeTotalRevenue,
    allTimeTotalPayments,
  } = analytics;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Build city breakdown text for last 24 hours
  const cityLines = citiesBreakdown
    .map((city: any) => {
      return `• ${city.cityName}: ${city.count} payments (${formatCurrency(city.paid)})`;
    })
    .join("\n");

  // Build all-time city breakdown text
  const allTimeCityLines = allTimeCitiesBreakdown
    .map((city: any) => {
      return `• ${city.cityName}: ${city.count} payments (${formatCurrency(city.paid)})`;
    })
    .join("\n");

  // Build complete message
  const text = `📊 *Daily Payment Report* (Last 24 Hours)

🏙️ *By City*
${cityLines || "• No payments in the last 24 hours"}

💰 *Total Revenue:* ${formatCurrency(totalRevenue)}
👥 *Total Payments:* ${totalPayments} players registered

━━━━━━━━━━━━━━━━━━━━

📈 *All-Time (Registered Divisions)*

🏙️ *By City*
${allTimeCityLines || "• No payments yet"}

💰 *Total Revenue:* ${formatCurrency(allTimeTotalRevenue)}
👥 *Total Payments:* ${allTimeTotalPayments} players registered`;

  return {
    text,
  };
}
