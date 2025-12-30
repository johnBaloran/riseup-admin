// src/app/dashboard/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Dashboard page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import {
  getPaymentAnalytics,
  getAllCities,
} from "@/lib/db/queries/analytics";
import { AnalyticsDashboard } from "@/components/features/analytics/AnalyticsDashboard";
import TutorialLink from "@/components/features/tutorials/TutorialLink";

interface DashboardPageProps {
  searchParams: {
    city?: string;
    startDate?: string;
    endDate?: string;
    compare?: string;
  };
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Build filters from search params
  const filters: any = {};
  if (searchParams.city) filters.cityId = searchParams.city;
  if (searchParams.compare === "true") filters.compareEnabled = true;

  // Helper to convert EST date string to UTC Date object
  const parseESTDate = (dateString: string, isEndOfDay: boolean = false) => {
    // Parse YYYY-MM-DD as EST midnight (or end of day)
    // EST is UTC-5, so we need to add 5 hours to get UTC equivalent
    const [year, month, day] = dateString.split("-").map(Number);

    if (isEndOfDay) {
      // End of day in EST (23:59:59) = next day 04:59:59 UTC
      const utcDate = new Date(Date.UTC(year, month - 1, day, 23 + 5, 59, 59, 999));
      return utcDate;
    } else {
      // Midnight in EST (00:00:00) = 05:00:00 UTC same day
      const utcDate = new Date(Date.UTC(year, month - 1, day, 0 + 5, 0, 0, 0));
      return utcDate;
    }
  };

  // Default to today if no date range specified
  if (searchParams.startDate) {
    filters.startDate = parseESTDate(searchParams.startDate, false);
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filters.startDate = today;
  }

  if (searchParams.endDate) {
    filters.endDate = parseESTDate(searchParams.endDate, true);
  } else {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    filters.endDate = today;
  }

  // Fetch data in parallel
  const [analytics, cities] = await Promise.all([
    getPaymentAnalytics(filters),
    getAllCities(),
  ]);

  return (
    <div className="p-6 space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Payment Analytics</h1>
          <TutorialLink tutorialId="understanding-dashboard" />
        </div>
        <p className="text-gray-600 mt-1">
          Track payment methods, revenue, and player signups
        </p>
      </div>

      <AnalyticsDashboard
        analytics={analytics}
        cities={cities}
        currentFilters={{
          cityId: searchParams.city,
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
          compareEnabled: searchParams.compare === "true",
        }}
      />
    </div>
  );
}
