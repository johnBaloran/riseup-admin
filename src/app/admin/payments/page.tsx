// src/app/admin/[cityId]/payments/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Payment dashboard page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getPlayersWithPaymentStatus } from "@/lib/db/queries/payments";
import {
  getAllLocations,
  getLocationsByCity,
} from "@/lib/db/queries/locations";
import { getDivisions } from "@/lib/db/queries/divisions";
import { PaymentDashboard } from "@/components/features/payments/PaymentDashboard";

interface PaymentPageProps {
  searchParams: {
    location?: string;
    limit?: number;
    division?: string;
    team?: string;
    payment?: string;
    search?: string;
  };
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "view_payments")) {
    redirect("/unauthorized");
  }

  const [players, allPlayers, locations, divisions] = await Promise.all([
    getPlayersWithPaymentStatus({
      locationId: searchParams.location,
      divisionId: searchParams.division,
      teamId: searchParams.team,
      paymentStatusFilter: searchParams.payment || "all",
      search: searchParams.search,
    }),
    getPlayersWithPaymentStatus({}), // Get all players for overall stats
    getAllLocations(),
    getDivisions({
      page: 1,
      limit: 100,
      activeFilter: "active",
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Payment Management
        </h1>
        <p className="text-gray-600 mt-1">
          Track player payments and manage installment plans
        </p>
      </div>

      <PaymentDashboard
        players={JSON.parse(JSON.stringify(players))}
        allPlayers={JSON.parse(JSON.stringify(allPlayers))}
        locations={JSON.parse(JSON.stringify(locations))}
        divisions={JSON.parse(JSON.stringify(divisions.divisions))}
        currentFilters={{
          location: searchParams.location,
          limit: searchParams.limit,
          division: searchParams.division,
          team: searchParams.team,
          payment: searchParams.payment || "all",
          search: searchParams.search,
        }}
      />
    </div>
  );
}
