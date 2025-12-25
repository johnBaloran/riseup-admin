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

interface DashboardPageProps {
  searchParams: {
    city?: string;
    startDate?: string;
    endDate?: string;
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

  // Default to today if no date range specified
  if (searchParams.startDate) {
    filters.startDate = new Date(searchParams.startDate);
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filters.startDate = today;
  }

  if (searchParams.endDate) {
    filters.endDate = new Date(searchParams.endDate);
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
        <h1 className="text-3xl font-bold tracking-tight">Payment Analytics</h1>
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
        }}
      />
    </div>
  );
}
