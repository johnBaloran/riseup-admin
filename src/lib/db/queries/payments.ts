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
    .populate({
      path: "paymentMethods",
      populate: {
        path: "cashPayment.receivedBy",
        model: "Admin",
        select: "name email",
      },
    })
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
 * Uses aggregation pipeline for efficient DB-level filtering and pagination
 */
export async function getPlayersWithPaymentStatus({
  page = 1,
  limit = 12,
  locationId,
  divisionId,
  teamId,
  paymentStatusFilter = "all",
  search,
}: {
  page?: number;
  limit?: number;
  locationId?: string;
  divisionId?: string;
  teamId?: string;
  paymentStatusFilter?: string;
  search?: string;
}) {
  await connectDB();

  // Build filter for register divisions only
  const divisionFilter: any = { register: true };
  if (locationId) divisionFilter.location = locationId;
  if (divisionId) divisionFilter._id = divisionId;

  const divisions = await Division.find(divisionFilter).select("_id");
  const divisionIds = divisions.map((d) => d._id);

  if (!divisionIds.length) {
    return {
      players: [],
      pagination: { total: 0, page, limit, totalPages: 0 },
    };
  }

  // Build base match filter
  const matchFilter: any = { division: { $in: divisionIds } };
  if (teamId) matchFilter.team = teamId;

  if (search) {
    const searchRegex = new RegExp(search, "i");
    const matchingTeams = await Team.find({
      teamName: { $regex: searchRegex },
    }).select("_id");

    matchFilter.$or = [
      { playerName: { $regex: searchRegex } },
      { team: { $in: matchingTeams.map((t) => t._id) } },
    ];
  }

  // Build aggregation pipeline
  const pipeline: any[] = [
    { $match: matchFilter },
    {
      $lookup: {
        from: "paymentmethods",
        localField: "_id",
        foreignField: "player",
        as: "paymentMethods",
      },
    },
    {
      $addFields: {
        paymentMethod: { $arrayElemAt: ["$paymentMethods", 0] },
      },
    },
    {
      $addFields: {
        paymentStatus: {
          $cond: {
            if: { $eq: [{ $size: "$paymentMethods" }, 0] },
            then: "unpaid",
            else: {
              $cond: {
                if: { $eq: ["$paymentMethod.status", "COMPLETED"] },
                then: "paid",
                else: {
                  $cond: {
                    if: { $eq: ["$paymentMethod.paymentType", "INSTALLMENTS"] },
                    then: {
                      $let: {
                        vars: {
                          failedCount: {
                            $size: {
                              $filter: {
                                input: {
                                  $ifNull: [
                                    "$paymentMethod.installments.subscriptionPayments",
                                    [],
                                  ],
                                },
                                cond: { $eq: ["$$this.status", "failed"] },
                              },
                            },
                          },
                        },
                        in: {
                          $cond: {
                            if: { $eq: ["$$failedCount", 0] },
                            then: "on-track",
                            else: {
                              $cond: {
                                if: { $gte: ["$$failedCount", 3] },
                                then: "critical",
                                else: "has-issues",
                              },
                            },
                          },
                        },
                      },
                    },
                    else: "unpaid",
                  },
                },
              },
            },
          },
        },
      },
    },
  ];

  // Add payment status filter if needed
  if (paymentStatusFilter !== "all") {
    pipeline.push({ $match: { paymentStatus: paymentStatusFilter } });
  }

  // Get total count before pagination
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await Player.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add sorting and pagination
  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  );

  // Execute aggregation
  const players = await Player.aggregate(pipeline);

  // Populate references
  await Player.populate(players, [
    {
      path: "division",
      populate: [
        { path: "location", select: "name" },
        { path: "city", select: "cityName" },
      ],
    },
    { path: "team", select: "teamName" },
    { path: "user", select: "name email phoneNumber" },
  ]);

  return {
    players,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
