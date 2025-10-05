// src/lib/db/queries/players.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player data access functions ONLY
 */

import Division from "@/models/Division";
import { connectDB } from "../mongodb";
import Player from "@/models/Player";
import Team from "@/models/Team";

/**
 * Get free agents in a division
 */
export async function getFreeAgentsByDivision(divisionId: string) {
  await connectDB();

  return Player.find({
    division: divisionId,
    $or: [{ team: { $exists: false } }, { team: null }],
  })
    .select("playerName jerseyNumber user")
    .lean();
}

/**
 * Add player to team
 */
export async function addPlayerToTeam(playerId: string, teamId: string) {
  await connectDB();

  // Update player's team
  await Player.findByIdAndUpdate(playerId, { team: teamId });

  // Add player to team's players array
  await Team.findByIdAndUpdate(teamId, {
    $addToSet: { players: playerId },
  });
}

/**
 * Remove player from team (make free agent)
 */
export async function removePlayerFromTeam(playerId: string, teamId: string) {
  await connectDB();

  // Remove team from player
  await Player.findByIdAndUpdate(playerId, { team: null });

  // Remove player from team's players array
  await Team.findByIdAndUpdate(teamId, {
    $pull: { players: playerId },
  });

  // If player was captain, remove captain assignment
  const team = await Team.findById(teamId);
  if (team?.teamCaptain?.toString() === playerId) {
    await Team.findByIdAndUpdate(teamId, { teamCaptain: null });
  }
}

/**
 * Get player by ID
 */
export async function getPlayerById(id: string) {
  await connectDB();
  return Player.findById(id)
    .populate("team", "teamName teamCode")
    .populate("division", "divisionName")
    .populate("user", "name email phoneNumber")
    .lean();
}

/**
 * Create new player
 */
export async function createPlayer(data: {
  playerName: string;
  division: string;
  team?: string;
  jerseyNumber?: number;
  jerseySize?: string;
  jerseyName?: string;
  instagram?: string;
  user?: string;
}) {
  await connectDB();

  const player = await Player.create(data);

  // If team specified, add player to team's players array
  if (data.team) {
    await Team.findByIdAndUpdate(data.team, {
      $addToSet: { players: player._id },
    });
  }

  return player.toObject();
}

// src/lib/db/queries/players.ts - Update payment status logic

/**
 * Calculate player payment status with installment details
 */
async function getPlayerPaymentStatus(playerId: string, divisionId: string) {
  await connectDB();

  const PaymentMethod = (await import("@/models/PaymentMethod")).default;

  const payment = await PaymentMethod.findOne({
    player: playerId,
    division: divisionId,
  }).lean();

  if (!payment) {
    return {
      status: "unpaid",
      type: null,
      installmentProgress: null,
    };
  }

  if (payment.status === "COMPLETED") {
    return {
      status: "paid",
      type: payment.paymentType,
      installmentProgress: null,
    };
  }

  if (
    payment.paymentType === "INSTALLMENTS" &&
    payment.status === "IN_PROGRESS"
  ) {
    // Build installment progress (7 weeks)
    const totalWeeks = 7;
    const progress = Array(totalWeeks)
      .fill("pending")
      .map((_, index) => {
        const weekNumber = index + 1;
        const weekPayment = payment.installments?.subscriptionPayments?.find(
          (p: any) => p.paymentNumber === weekNumber
        );

        if (!weekPayment) return { week: weekNumber, status: "pending" };

        return {
          week: weekNumber,
          status: weekPayment.status === "succeeded" ? "succeeded" : "failed",
          amountPaid: weekPayment.amountPaid,
          dueDate: weekPayment.dueDate,
        };
      });

    return {
      status: "in_progress",
      type: "INSTALLMENTS",
      installmentProgress: progress,
      remainingBalance: payment.installments?.remainingBalance,
      nextPaymentDate: payment.installments?.nextPaymentDate,
    };
  }

  return {
    status: "unpaid",
    type: payment.paymentType,
    installmentProgress: null,
  };
}

/**
 * Get players with payment status including installment tracking
 */
export async function getPlayers({
  cityId,
  page = 1,
  limit = 12,
  divisionId,
  teamId,
  paymentFilter = "all",
  freeAgentsOnly = false,
  hasUserAccount,
  search,
}: {
  cityId: string;
  page?: number;
  limit?: number;
  divisionId?: string;
  teamId?: string;
  paymentFilter?: "all" | "paid" | "in_progress" | "unpaid";
  freeAgentsOnly?: boolean;
  hasUserAccount?: boolean;
  search?: string;
}) {
  await connectDB();

  const skip = (page - 1) * limit;
  const filter: any = {};

  // Build filter (same as before)
  if (divisionId) {
    filter.division = divisionId;
  } else if (cityId) {
    const divisions = await Division.find({ city: cityId }).select("_id");
    filter.division = { $in: divisions.map((d) => d._id) };
  }

  if (teamId) filter.team = teamId;
  if (freeAgentsOnly) {
    filter.$or = [{ team: { $exists: false } }, { team: null }];
  }
  if (hasUserAccount !== undefined) {
    if (hasUserAccount) {
      filter.user = { $exists: true, $ne: null };
    } else {
      filter.$or = [{ user: { $exists: false } }, { user: null }];
    }
  }
  if (search) {
    filter.playerName = { $regex: search, $options: "i" };
  }

  const [players, total] = await Promise.all([
    Player.find(filter)
      .populate("team", "teamName teamCode")
      .populate("division", "divisionName")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Player.countDocuments(filter),
  ]);

  // Get payment status with installment details
  const playersWithPayment = await Promise.all(
    players.map(async (player: any) => {
      const divisionId = player.division?._id || player.division;
      const paymentInfo = await getPlayerPaymentStatus(
        player._id.toString(),
        divisionId.toString()
      );

      return {
        ...player,
        paymentStatus: paymentInfo.status,
        paymentType: paymentInfo.type,
        installmentProgress: paymentInfo.installmentProgress,
        remainingBalance: paymentInfo.remainingBalance,
        nextPaymentDate: paymentInfo.nextPaymentDate,
      };
    })
  );

  // Filter by payment status
  let filteredPlayers = playersWithPayment;
  if (paymentFilter === "paid") {
    filteredPlayers = playersWithPayment.filter(
      (p) => p.paymentStatus === "paid"
    );
  } else if (paymentFilter === "in_progress") {
    filteredPlayers = playersWithPayment.filter(
      (p) => p.paymentStatus === "in_progress"
    );
  } else if (paymentFilter === "unpaid") {
    filteredPlayers = playersWithPayment.filter(
      (p) => p.paymentStatus === "unpaid"
    );
  }

  return {
    players: filteredPlayers,
    pagination: {
      total: filteredPlayers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredPlayers.length / limit),
    },
  };
}
