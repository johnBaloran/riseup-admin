// src/lib/db/queries/analytics.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * PaymentMethod analytics data access functions ONLY
 */

import { connectDB } from "../mongodb";
import PaymentMethod from "@/models/PaymentMethod";
import City from "@/models/City";
import Division from "@/models/Division";

export interface AnalyticsFilters {
  cityId?: string;
  startDate?: Date;
  endDate?: Date;
  compareEnabled?: boolean;
}

export interface PaymentAnalytics {
  paymentMethods: any[];
  stats: {
    totalCount: number;
    totalPaid: number;

    byPaymentType: {
      FULL_PAYMENT: { count: number; paid: number; withUser: number };
      INSTALLMENTS: { count: number; paid: number; withUser: number };
      CASH: { count: number; paid: number; withUser: number };
      TERMINAL: { count: number; paid: number; withUser: number };
    };

    byPricingTier: {
      EARLY_BIRD: { count: number; paid: number };
      REGULAR: { count: number; paid: number };
    };

    byStatus: {
      PENDING: { count: number; amount: number };
      IN_PROGRESS: { count: number; amount: number };
      COMPLETED: { count: number; amount: number };
    };

    linkage: {
      withUser: number;
      withoutUser: number;
      linkageRate: number;
    };
  };

  citiesBreakdown: Array<{
    cityId: string;
    cityName: string;
    count: number;
    paid: number;
  }>;

  dailyTrend: Array<{
    date: string;
    count: number;
    paid: number;
  }>;

  // Previous period data (when comparison is enabled)
  previousStats?: {
    totalCount: number;
    totalPaid: number;
  };

  previousCitiesBreakdown?: Array<{
    cityId: string;
    cityName: string;
    count: number;
    paid: number;
  }>;

  previousDailyTrend?: Array<{
    date: string;
    count: number;
    paid: number;
  }>;
}

/**
 * Get PaymentMethod analytics with filters
 */
export async function getPaymentAnalytics(
  filters: AnalyticsFilters = {}
): Promise<PaymentAnalytics> {
  await connectDB();

  // Build query filter
  const query: any = {};

  // City filter
  if (filters.cityId) {
    const divisionIds = await Division.find({ city: filters.cityId }).distinct(
      "_id"
    );
    query.division = { $in: divisionIds };
  }

  // Date filter
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = filters.startDate;
    if (filters.endDate) query.createdAt.$lte = filters.endDate;
  }

  // Fetch all PaymentMethods with populated references
  const paymentMethods = await PaymentMethod.find(query)
    .populate({
      path: "division",
      populate: {
        path: "city",
        select: "cityName stripeAccountId",
      },
    })
    .populate({
      path: "player",
      select: "playerName",
      populate: [
        {
          path: "user",
          select: "name email phoneNumber",
        },
        {
          path: "team",
          select: "teamName",
        },
      ],
    })
    .sort({ createdAt: -1 })
    .lean();

  // Calculate stats
  const stats = calculateStats(paymentMethods);
  const citiesBreakdown = calculateCitiesBreakdown(paymentMethods);
  const dailyTrend = calculateDailyTrend(paymentMethods);

  // Fetch previous period data if comparison is enabled
  let previousStats, previousCitiesBreakdown, previousDailyTrend;

  if (filters.compareEnabled && filters.startDate && filters.endDate) {
    // Calculate previous period dates
    const currentPeriodDuration =
      filters.endDate.getTime() - filters.startDate.getTime();
    const previousEndDate = new Date(filters.startDate.getTime() - 1); // Day before current start
    const previousStartDate = new Date(
      previousEndDate.getTime() - currentPeriodDuration
    );

    // Build query for previous period
    const previousQuery: any = {};
    if (filters.cityId) {
      const divisionIds = await Division.find({
        city: filters.cityId,
      }).distinct("_id");
      previousQuery.division = { $in: divisionIds };
    }
    previousQuery.createdAt = {
      $gte: previousStartDate,
      $lte: previousEndDate,
    };

    // Fetch previous period payment methods
    const previousPaymentMethods = await PaymentMethod.find(previousQuery)
      .populate({
        path: "division",
        populate: {
          path: "city",
          select: "cityName stripeAccountId",
        },
      })
      .lean();

    // Calculate previous period stats
    previousStats = {
      totalCount: previousPaymentMethods.length,
      totalPaid: previousPaymentMethods.reduce(
        (sum, pm) => sum + (pm.amountPaid || 0),
        0
      ),
    };
    previousCitiesBreakdown = calculateCitiesBreakdown(previousPaymentMethods);
    previousDailyTrend = calculateDailyTrend(previousPaymentMethods);
  }

  return {
    paymentMethods,
    stats,
    citiesBreakdown,
    dailyTrend,
    previousStats,
    previousCitiesBreakdown,
    previousDailyTrend,
  };
}

/**
 * Calculate overall statistics
 */
function calculateStats(paymentMethods: any[]) {
  const totalCount = paymentMethods.length;
  const totalPaid = paymentMethods.reduce(
    (sum, pm) => sum + (pm.amountPaid || 0),
    0
  );

  // By payment type
  const byPaymentType = {
    FULL_PAYMENT: calculateTypeStats(paymentMethods, "FULL_PAYMENT"),
    INSTALLMENTS: calculateTypeStats(paymentMethods, "INSTALLMENTS"),
    CASH: calculateTypeStats(paymentMethods, "CASH"),
    TERMINAL: calculateTypeStats(paymentMethods, "TERMINAL"),
  };

  // By pricing tier
  const byPricingTier = {
    EARLY_BIRD: calculateTierStats(paymentMethods, "EARLY_BIRD"),
    REGULAR: calculateTierStats(paymentMethods, "REGULAR"),
  };

  // By status
  const byStatus = {
    PENDING: calculateStatusStats(paymentMethods, "PENDING"),
    IN_PROGRESS: calculateStatusStats(paymentMethods, "IN_PROGRESS"),
    COMPLETED: calculateStatusStats(paymentMethods, "COMPLETED"),
  };

  // Linkage
  const withUser = paymentMethods.filter((pm) => pm.player?.user).length;
  const withoutUser = totalCount - withUser;
  const linkageRate = totalCount > 0 ? (withUser / totalCount) * 100 : 0;

  return {
    totalCount,
    totalPaid,
    byPaymentType,
    byPricingTier,
    byStatus,
    linkage: {
      withUser,
      withoutUser,
      linkageRate,
    },
  };
}

/**
 * Calculate stats for a specific payment type
 */
function calculateTypeStats(paymentMethods: any[], type: string) {
  const filtered = paymentMethods.filter((pm) => pm.paymentType === type);
  const count = filtered.length;
  const paid = filtered.reduce((sum, pm) => sum + (pm.amountPaid || 0), 0);
  const withUser = filtered.filter((pm) => pm.player?.user).length;

  return { count, paid, withUser };
}

/**
 * Calculate stats for a specific pricing tier
 */
function calculateTierStats(paymentMethods: any[], tier: string) {
  const filtered = paymentMethods.filter((pm) => pm.pricingTier === tier);
  const count = filtered.length;
  const paid = filtered.reduce((sum, pm) => sum + (pm.amountPaid || 0), 0);

  return { count, paid };
}

/**
 * Calculate stats for a specific status
 */
function calculateStatusStats(paymentMethods: any[], status: string) {
  const filtered = paymentMethods.filter((pm) => pm.status === status);
  const count = filtered.length;
  const amount = filtered.reduce((sum, pm) => sum + (pm.amountPaid || 0), 0);

  return { count, amount };
}

/**
 * Calculate breakdown by city
 */
function calculateCitiesBreakdown(paymentMethods: any[]) {
  const citiesMap = new Map<
    string,
    { cityId: string; cityName: string; count: number; paid: number }
  >();

  paymentMethods.forEach((pm) => {
    const cityId = pm.division?.city?._id?.toString();
    const cityName = pm.division?.city?.cityName || "Unknown";

    if (cityId) {
      if (!citiesMap.has(cityId)) {
        citiesMap.set(cityId, {
          cityId,
          cityName,
          count: 0,
          paid: 0,
        });
      }

      const city = citiesMap.get(cityId)!;
      city.count += 1;
      city.paid += pm.amountPaid || 0;
    }
  });

  return Array.from(citiesMap.values()).sort((a, b) =>
    a.cityName.localeCompare(b.cityName)
  );
}

/**
 * Calculate daily trend (last 30 days)
 */
function calculateDailyTrend(paymentMethods: any[]) {
  const dailyMap = new Map<string, { count: number; paid: number }>();

  paymentMethods.forEach((pm) => {
    const date = new Date(pm.createdAt).toISOString().split("T")[0];

    if (!dailyMap.has(date)) {
      dailyMap.set(date, { count: 0, paid: 0 });
    }

    const day = dailyMap.get(date)!;
    day.count += 1;
    day.paid += pm.amountPaid || 0;
  });

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get all cities for filter dropdown
 */
export async function getAllCities() {
  await connectDB();

  const cities = await City.find({ active: true })
    .select("_id cityName")
    .sort({ cityName: 1 })
    .lean();

  return cities;
}
