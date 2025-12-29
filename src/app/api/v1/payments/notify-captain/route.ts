// src/app/api/v1/payments/notify-captain/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Notify team captain about unpaid player via SMS ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db/mongodb";
import Team from "@/models/Team";
import Player from "@/models/Player";
import twilio from "twilio";

/**
 * POST /api/v1/payments/notify-captain
 * Send SMS to team captain about unpaid player
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

    await connectDB();

    const body = await request.json();
    const { playerId, teamId } = body;

    if (!playerId || !teamId) {
      return NextResponse.json(
        { success: false, error: "Player ID and Team ID are required" },
        { status: 400 }
      );
    }

    // Get the unpaid player
    const player = await Player.findById(playerId).select("playerName");
    if (!player) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 }
      );
    }

    // Get the team with captain populated
    const team = await Team.findById(teamId)
      .populate({
        path: "teamCaptain",
        populate: {
          path: "user",
          select: "phoneNumber firstName lastName",
        },
      })
      .select("teamName teamCaptain");

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    if (!team.teamCaptain) {
      return NextResponse.json(
        { success: false, error: "Team captain not found" },
        { status: 404 }
      );
    }

    const captain = team.teamCaptain as any;
    const captainPhoneNumber = captain.user?.phoneNumber;

    if (!captainPhoneNumber) {
      return NextResponse.json(
        { success: false, error: "Team captain phone number not found" },
        { status: 404 }
      );
    }

    // Send SMS via Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

    if (!accountSid || !authToken || !messagingServiceSid) {
      throw new Error("Twilio credentials not configured");
    }

    const client = twilio(accountSid, authToken);

    const captainName =
      captain.user?.firstName ||
      captain.playerName ||
      "Captain";

    const messageBody = `Hi ${captainName}, this is a reminder that ${player.playerName} on your team (${team.teamName}) hasn't completed their registration yet. Please reach out to them to ensure they register at https://www.riseupleague.com/register/join-team/${teamId} before the season starts.`;

    const message = await client.messages.create({
      body: messageBody,
      messagingServiceSid: messagingServiceSid,
      to: captainPhoneNumber,
    });

    console.log(
      `Captain notification sent to ${captainPhoneNumber}, SID: ${message.sid}`
    );

    return NextResponse.json({
      success: true,
      message: "Team captain notified successfully",
      twilioSid: message.sid,
    });
  } catch (error: any) {
    console.error("Error notifying team captain:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to notify team captain",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
