// src/app/api/cron/daily-report/route.ts

/**
 * Google Chat Daily Report Cron Job
 * Sends last 24 hours payment analytics to Google Chat
 * This endpoint is excluded from NextAuth middleware
 */

import { NextRequest, NextResponse } from "next/server";
import { getDailyReportAnalytics, getCityDailyReportAnalytics } from "@/lib/db/queries/daily-report";
import { connectDB } from "@/lib/db/mongodb";
import City from "@/models/City";

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
    const citiesOnly = searchParams.get("cities-only") === "true"; // Skip general chat

    // Get last 24 hours analytics
    const analytics = await getDailyReportAnalytics();

    // Format Google Chat message
    const message = formatGoogleChatMessage(analytics);

    // Test mode: return preview without sending
    if (testMode) {
      // Send city-specific reports in test mode
      const cityResults = await sendCitySpecificReports(testMode);

      return NextResponse.json({
        success: true,
        message: "Test mode - message not sent to Google Chat",
        preview: message.text,
        data: analytics,
        cityReports: cityResults,
      });
    }

    // Send to General Chat (unless cities-only mode)
    if (!citiesOnly) {
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
    }

    // Send city-specific reports
    const cityResults = await sendCitySpecificReports(testMode);

    return NextResponse.json({
      success: true,
      message: citiesOnly
        ? "City reports sent (General Chat skipped)"
        : "Daily report sent to Google Chat",
      preview: citiesOnly ? null : message.text,
      data: citiesOnly ? null : analytics,
      cityReports: cityResults,
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
 * Send city-specific reports to each city's webhook
 */
async function sendCitySpecificReports(testMode: boolean) {
  try {
    await connectDB();

    // Get all cities with webhooks configured
    const cities = await City.find({
      googleChatWebhook: { $exists: true, $ne: "" },
      $and: [
        { googleChatWebhook: { $ne: null } },
      ],
    })
      .select("_id cityName googleChatWebhook")
      .lean();

    if (!cities.length) {
      return {
        message: "No cities with webhooks configured",
        sent: 0,
        failed: 0,
      };
    }

    const results = [];

    for (const city of cities) {
      try {
        // Get city-specific analytics
        const cityAnalytics = await getCityDailyReportAnalytics(
          city._id.toString(),
          city.cityName
        );

        // Format city-specific message
        const message = formatCityGoogleChatMessage(cityAnalytics);

        if (testMode) {
          results.push({
            cityName: city.cityName,
            status: "test",
            preview: message.text,
          });
          continue;
        }

        // Send to city webhook
        const response = await fetch(city.googleChatWebhook!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify(message),
        });

        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.statusText}`);
        }

        results.push({
          cityName: city.cityName,
          status: "success",
        });
      } catch (error) {
        console.error(`Error sending report to ${city.cityName}:`, error);
        results.push({
          cityName: city.cityName,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    return {
      message: `Sent ${successCount} city reports, ${failedCount} failed`,
      sent: successCount,
      failed: failedCount,
      details: results,
    };
  } catch (error) {
    console.error("Error in sendCitySpecificReports:", error);
    return {
      message: "Failed to send city reports",
      error: error instanceof Error ? error.message : "Unknown error",
      sent: 0,
      failed: 0,
    };
  }
}

/**
 * Format city-specific analytics for Google Chat
 */
function formatCityGoogleChatMessage(analytics: any) {
  const {
    cityName,
    totalRevenue,
    totalPayments,
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

  // Build complete message
  const text = `📊 *Daily Payment Report - ${cityName}* (Last 24 Hours)

💰 *Total Revenue:* ${formatCurrency(totalRevenue)}
👥 *Total Payments:* ${totalPayments} players registered

━━━━━━━━━━━━━━━━━━━━

📈 *All-Time - ${cityName}* (Registered Divisions)

💰 *Total Revenue:* ${formatCurrency(allTimeTotalRevenue)}
👥 *Total Payments:* ${allTimeTotalPayments} players registered`;

  return {
    text,
  };
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
