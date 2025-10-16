// src/app/dashboard/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Dashboard page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import {
  getDashboardStats,
  getUpcomingGames,
} from "@/lib/db/queries/dashboard";
import { DashboardStats } from "@/components/features/dashboard/DashboardStats";
import { UpcomingGames } from "@/components/features/dashboard/UpcomingGames";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get accessible location IDs
  const locationIds = session.user.allLocations
    ? []
    : session.user.assignedLocations;

  // Fetch data in parallel
  const [stats, upcomingGames] = await Promise.all([
    getDashboardStats(locationIds),
    getUpcomingGames(locationIds),
  ]);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your basketball league</p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingGames games={upcomingGames} />
      </div>
    </div>
  );
}
