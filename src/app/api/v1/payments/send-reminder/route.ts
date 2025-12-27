// src/app/api/v1/payments/send-reminder/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Send payment reminder via SMS and email ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import twilio from "twilio";

/**
 * POST /api/v1/payments/send-reminder
 * Send payment reminder to player via SMS and email
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session, "manage_payments")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { playerId, email, phoneNumber, playerName, teamName, teamId } = body;

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: "Player ID is required" },
        { status: 400 }
      );
    }

    const results = {
      sms: { sent: false, error: null as string | null },
      email: { sent: false, error: null as string | null },
    };

    // Send SMS via Twilio
    if (phoneNumber) {
      try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

        if (!accountSid || !authToken || !messagingServiceSid) {
          throw new Error("Twilio credentials not configured");
        }

        const client = twilio(accountSid, authToken);

        // Build personalized message
        let messageBody = `Hi ${playerName || "there"}`;

        messageBody += `, you were invited to join ${teamName}. Please register at https://www.riseupleague.com/register/join-team/${teamId} to secure your spot.`;

        const message = await client.messages.create({
          body: messageBody,
          messagingServiceSid: messagingServiceSid,
          to: phoneNumber,
        });

        results.sms.sent = true;
        console.log(`SMS sent to ${phoneNumber}, SID: ${message.sid}`);
      } catch (error: any) {
        console.error("Error sending SMS:", error);
        results.sms.error = error.message || "Failed to send SMS";
      }
    }

    // Send Email (placeholder - you can integrate with your email service)
    if (email) {
      try {
        // TODO: Integrate with your email service (SendGrid, Resend, etc.)
        // For now, just mark as not sent
        results.email.sent = false;
        results.email.error = "Email integration not yet implemented";
      } catch (error: any) {
        console.error("Error sending email:", error);
        results.email.error = error.message || "Failed to send email";
      }
    }

    // Determine overall success
    const success = results.sms.sent || results.email.sent;

    return NextResponse.json(
      {
        success,
        message: success
          ? "Payment reminder sent successfully"
          : "Failed to send payment reminder",
        results,
      },
      { status: success ? 200 : 500 }
    );
  } catch (error: any) {
    console.error("Error sending payment reminder:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send payment reminder" },
      { status: 500 }
    );
  }
}
