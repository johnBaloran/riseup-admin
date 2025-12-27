// src/app/api/cron/payment-reminders/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Automated payment reminder SMS via Twilio ONLY
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Player from "@/models/Player";
import Division from "@/models/Division";
import twilio from "twilio";

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 1000;

interface EligiblePlayer {
  _id: string;
  playerName: string;
  paymentStatus: {
    phoneNumber: string;
    reminderCount: number;
  };
  team?: {
    _id: string;
    teamName: string;
  };
}

/**
 * Send SMS reminder to a single player
 */
async function sendReminderSMS(player: EligiblePlayer) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!accountSid || !authToken || !messagingServiceSid) {
    throw new Error("Twilio credentials not configured");
  }

  const client = twilio(accountSid, authToken);

  const messageBody = `Hi ${player.playerName}, you were invited to join ${
    player.team?.teamName || "a team"
  }. Please register at https://www.riseupleague.com/register/join-team/${
    player.team?._id || ""
  } to secure your spot. Reply STOP to opt out.`;

  const message = await client.messages.create({
    body: messageBody,
    messagingServiceSid: messagingServiceSid,
    to: player.paymentStatus.phoneNumber,
  });

  return {
    success: true,
    twilioSid: message.sid,
    playerId: player._id,
  };
}

/**
 * Update player with reminder log
 */
async function updatePlayerLog(
  playerId: string,
  status: "sent" | "failed",
  twilioSid?: string,
  errorMessage?: string
) {
  await Player.updateOne(
    { _id: playerId },
    {
      $set: {
        "paymentStatus.lastAttempt": new Date(),
      },
      $inc: {
        "paymentStatus.reminderCount": 1,
      },
      $push: {
        "paymentStatus.reminderLogs": {
          timestamp: new Date(),
          status,
          twilioSid: twilioSid || null,
          errorMessage: errorMessage || null,
          sentBy: "cron",
        },
      },
    }
  );
}

/**
 * GET /api/cron/payment-reminders
 * Send automated payment reminders to unpaid players
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const testMode = searchParams.get("test") === "true";

    // Calculate time thresholds
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Get divisions with register: true
    const registerDivisions = await Division.find({ register: true }).select(
      "_id"
    );
    const registerDivisionIds = registerDivisions.map((d) => d._id);

    if (!registerDivisionIds.length) {
      return NextResponse.json({
        success: true,
        message: "No active registration divisions found",
        stats: { eligible: 0, sent: 0, failed: 0 },
      });
    }

    // Find eligible players
    const eligiblePlayers = await Player.find({
      division: { $in: registerDivisionIds },
      "paymentStatus.phoneNumber": { $exists: true, $ne: null },
      "paymentStatus.hasPaid": false,
      "paymentStatus.reminderCount": { $lt: 10 },
      "paymentStatus.teamCreatedDate": { $lte: twoDaysAgo },
      $or: [
        { "paymentStatus.lastAttempt": { $lte: fortyEightHoursAgo } },
        { "paymentStatus.lastAttempt": null },
      ],
    })
      .populate("team", "teamName")
      .select("playerName paymentStatus team")
      .lean();

    if (testMode) {
      return NextResponse.json({
        success: true,
        message: "Test mode - no messages sent",
        stats: {
          eligible: eligiblePlayers.length,
          sent: 0,
          failed: 0,
        },
        preview: eligiblePlayers.slice(0, 5).map((p: any) => ({
          playerName: p.playerName,
          phoneNumber: p.paymentStatus.phoneNumber,
          teamName: p.team?.teamName,
          reminderCount: p.paymentStatus.reminderCount || 0,
        })),
      });
    }

    if (!eligiblePlayers.length) {
      return NextResponse.json({
        success: true,
        message: "No eligible players found",
        stats: { eligible: 0, sent: 0, failed: 0 },
      });
    }

    let successCount = 0;
    let failCount = 0;

    // Process in batches
    for (let i = 0; i < eligiblePlayers.length; i += BATCH_SIZE) {
      const batch = eligiblePlayers.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map((player: any) => sendReminderSMS(player))
      );

      // Update each player's log based on result
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        const player = batch[j] as any;

        if (result.status === "fulfilled") {
          await updatePlayerLog(
            player._id.toString(),
            "sent",
            result.value.twilioSid
          );
          successCount++;
        } else {
          await updatePlayerLog(
            player._id.toString(),
            "failed",
            undefined,
            result.reason?.message || "Unknown error"
          );
          failCount++;
        }
      }

      // Wait between batches (except last batch)
      if (i + BATCH_SIZE < eligiblePlayers.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment reminders sent: ${successCount} successful, ${failCount} failed`,
      stats: {
        eligible: eligiblePlayers.length,
        sent: successCount,
        failed: failCount,
      },
    });
  } catch (error: any) {
    console.error("Error sending payment reminders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send payment reminders",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
