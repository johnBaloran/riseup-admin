// src/lib/db/queries/weekly-report.ts

/**
 * Weekly Report Analytics
 * Gets PaymentMethod data for last 7 days for Google Chat reports
 */

import { connectDB } from "../mongodb";
import PaymentMethod from "@/models/PaymentMethod";
import Division from "@/models/Division";

export interface WeeklyReportAnalytics {
  citiesBreakdown: Array<{
    cityId: string;
    cityName: string;
    count: number;
    paid: number;
  }>;
  totalRevenue: number;
  totalPayments: number;
  allTimeCitiesBreakdown: Array<{
    cityId: string;
    cityName: string;
    count: number;
    paid: number;
  }>;
  allTimeTotalRevenue: number;
  allTimeTotalPayments: number;
}

export interface CitySpecificWeeklyAnalytics {
  cityName: string;
  totalRevenue: number;
  totalPayments: number;
  allTimeTotalRevenue: number;
  allTimeTotalPayments: number;
}

/**
 * Get analytics for last 7 days
 */
export async function getWeeklyReportAnalytics(): Promise<WeeklyReportAnalytics> {
  await connectDB();

  // Calculate 7 days ago
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Query PaymentMethods from last 7 days
  const paymentMethods = await PaymentMethod.find({
    createdAt: {
      $gte: sevenDaysAgo,
      $lte: now,
    },
  })
    .populate({
      path: "division",
      populate: {
        path: "city",
        select: "cityName",
      },
    })
    .lean();

  // Calculate total revenue and payment count
  const totalRevenue = paymentMethods.reduce(
    (sum, pm) => sum + (pm.amountPaid || 0),
    0
  );
  const totalPayments = paymentMethods.length;

  // Calculate city breakdown
  const citiesMap = new Map<
    string,
    { cityId: string; cityName: string; count: number; paid: number }
  >();

  paymentMethods.forEach((pm: any) => {
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

  const citiesBreakdown = Array.from(citiesMap.values()).sort((a, b) =>
    a.cityName.localeCompare(b.cityName)
  );

  // Get all-time stats for divisions with register: true
  const registeredDivisions = await Division.find({ register: true })
    .select("_id")
    .lean();
  const registeredDivisionIds = registeredDivisions.map((d) => d._id);

  // Query all PaymentMethods in registered divisions
  const allTimePaymentMethods = await PaymentMethod.find({
    division: { $in: registeredDivisionIds },
  })
    .populate({
      path: "division",
      populate: {
        path: "city",
        select: "cityName",
      },
    })
    .lean();

  // Calculate all-time total revenue and payment count
  const allTimeTotalRevenue = allTimePaymentMethods.reduce(
    (sum, pm) => sum + (pm.amountPaid || 0),
    0
  );
  const allTimeTotalPayments = allTimePaymentMethods.length;

  // Calculate all-time city breakdown
  const allTimeCitiesMap = new Map<
    string,
    { cityId: string; cityName: string; count: number; paid: number }
  >();

  allTimePaymentMethods.forEach((pm: any) => {
    const cityId = pm.division?.city?._id?.toString();
    const cityName = pm.division?.city?.cityName || "Unknown";

    if (cityId) {
      if (!allTimeCitiesMap.has(cityId)) {
        allTimeCitiesMap.set(cityId, {
          cityId,
          cityName,
          count: 0,
          paid: 0,
        });
      }

      const city = allTimeCitiesMap.get(cityId)!;
      city.count += 1;
      city.paid += pm.amountPaid || 0;
    }
  });

  const allTimeCitiesBreakdown = Array.from(allTimeCitiesMap.values()).sort(
    (a, b) => a.cityName.localeCompare(b.cityName)
  );

  return {
    citiesBreakdown,
    totalRevenue,
    totalPayments,
    allTimeCitiesBreakdown,
    allTimeTotalRevenue,
    allTimeTotalPayments,
  };
}

/**
 * Get analytics for a specific city (last 7 days)
 */
export async function getCityWeeklyReportAnalytics(
  cityId: string,
  cityName: string
): Promise<CitySpecificWeeklyAnalytics> {
  await connectDB();

  // Calculate 7 days ago
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Query PaymentMethods from last 7 days for this city
  const paymentMethods = await PaymentMethod.find({
    createdAt: {
      $gte: sevenDaysAgo,
      $lte: now,
    },
  })
    .populate({
      path: "division",
      populate: {
        path: "city",
        select: "cityName",
      },
    })
    .lean();

  // Filter for this specific city
  const cityPaymentMethods = paymentMethods.filter(
    (pm: any) => pm.division?.city?._id?.toString() === cityId
  );

  // Calculate total revenue and payment count for last 7 days
  const totalRevenue = cityPaymentMethods.reduce(
    (sum, pm) => sum + (pm.amountPaid || 0),
    0
  );
  const totalPayments = cityPaymentMethods.length;

  // Get all-time stats for this city (registered divisions only)
  const registeredDivisions = await Division.find({
    register: true,
    city: cityId,
  })
    .select("_id")
    .lean();
  const registeredDivisionIds = registeredDivisions.map((d) => d._id);

  // Query all PaymentMethods in registered divisions for this city
  const allTimePaymentMethods = await PaymentMethod.find({
    division: { $in: registeredDivisionIds },
  }).lean();

  // Calculate all-time total revenue and payment count
  const allTimeTotalRevenue = allTimePaymentMethods.reduce(
    (sum, pm) => sum + (pm.amountPaid || 0),
    0
  );
  const allTimeTotalPayments = allTimePaymentMethods.length;

  return {
    cityName,
    totalRevenue,
    totalPayments,
    allTimeTotalRevenue,
    allTimeTotalPayments,
  };
}
