// src/lib/db/queries/payments.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Payment data access functions ONLY
 */

import { connectDB } from "../mongodb";
import Player from "@/models/Player";
import PaymentMethod from "@/models/PaymentMethod";
import Division from "@/models/Division";
import Location from "@/models/Location";
import Team from "@/models/Team";

/**
 * Get payment status for a player
 */
export async function getPlayerPaymentStatus(playerId: string) {
  await connectDB();

  const player = await Player.findById(playerId)
    .populate("paymentMethods")
    .lean();

  if (!player || !player.paymentMethods || player.paymentMethods.length === 0) {
    return { status: "unpaid", paymentMethod: null };
  }

  const paymentMethod = player.paymentMethods[0] as any;

  if (paymentMethod.status === "COMPLETED") {
    return { status: "paid", paymentMethod };
  }

  if (paymentMethod.paymentType === "INSTALLMENTS") {
    const subscriptionPayments =
      paymentMethod.installments?.subscriptionPayments || [];
    const failedCount = subscriptionPayments.filter(
      (p: any) => p.status === "failed"
    ).length;

    if (failedCount === 0) return { status: "on-track", paymentMethod };
    if (failedCount >= 3) return { status: "critical", paymentMethod };
    return { status: "has-issues", paymentMethod };
  }

  return { status: "unpaid", paymentMethod };
}

/**
 * Get all players with payment status for dashboard
 */
export async function getPlayersWithPaymentStatus({
  locationId,
  divisionId,
  teamId,
  paymentStatusFilter = "all",
  search,
}: {
  locationId?: string;
  divisionId?: string;
  teamId?: string;
  paymentStatusFilter?: string;
  search?: string;
}) {
  await connectDB();

  // Build filter for active divisions only
  const divisionFilter: any = { active: true, register: true };
  if (locationId) divisionFilter.location = locationId;
  if (divisionId) divisionFilter._id = divisionId;

  const divisions = await Division.find(divisionFilter).select("_id");
  const divisionIds = divisions.map((d) => d._id);

  // Build player filter
  const playerFilter: any = { division: { $in: divisionIds } };
  if (teamId) playerFilter.team = teamId;

  if (search) {
    const searchRegex = new RegExp(search, "i");

    // find teams that match search
    const matchingTeams = await Team.find({
      teamName: { $regex: searchRegex },
    }).select("_id");

    playerFilter.$or = [
      { playerName: { $regex: searchRegex } },
      { "user.email": { $regex: searchRegex } },
      { team: { $in: matchingTeams.map((t) => t._id) } },
    ];
  }

  const players = await Player.find(playerFilter)
    .populate({
      path: "division",
      populate: [
        { path: "location", select: "name" },
        { path: "city", select: "cityName" },
      ],
    })
    .populate("team", "teamName")
    .populate("user", "name email phoneNumber")
    .populate("paymentMethods")
    .sort({ createdAt: -1 })
    .lean();

  // Calculate payment status for each player
  const playersWithStatus = players.map((player: any) => {
    let status = "unpaid";
    let paymentMethod = null;

    if (player.paymentMethods && player.paymentMethods.length > 0) {
      paymentMethod = player.paymentMethods[0];

      if (paymentMethod.status === "COMPLETED") {
        status = "paid";
      } else if (paymentMethod.paymentType === "INSTALLMENTS") {
        const subscriptionPayments =
          paymentMethod.installments?.subscriptionPayments || [];
        const failedCount = subscriptionPayments.filter(
          (p: any) => p.status === "failed"
        ).length;

        if (failedCount === 0) status = "on-track";
        else if (failedCount >= 3) status = "critical";
        else status = "has-issues";
      }
    }

    return { ...player, paymentStatus: status, paymentMethod };
  });

  // Filter by payment status if needed
  if (paymentStatusFilter !== "all") {
    return playersWithStatus.filter(
      (p) => p.paymentStatus === paymentStatusFilter
    );
  }

  return playersWithStatus;
}
