// src/app/payments/page.tsx

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
    page?: string;
    location?: string;
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

  const page = parseInt(searchParams.page || "1");

  const [result, allPlayersResult, locations, divisions] = await Promise.all([
    getPlayersWithPaymentStatus({
      page,
      locationId: searchParams.location,
      divisionId: searchParams.division,
      teamId: searchParams.team,
      paymentStatusFilter: searchParams.payment || "all",
      search: searchParams.search,
    }),
    getPlayersWithPaymentStatus({ limit: 99999 }), // Get all players for overall stats
    getAllLocations(),
    getDivisions({
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
        players={JSON.parse(JSON.stringify(result.players))}
        allPlayers={JSON.parse(JSON.stringify(allPlayersResult.players))}
        pagination={result.pagination}
        locations={JSON.parse(JSON.stringify(locations))}
        divisions={JSON.parse(JSON.stringify(divisions.divisions))}
        currentFilters={{
          location: searchParams.location,
          division: searchParams.division,
          team: searchParams.team,
          payment: searchParams.payment || "all",
          search: searchParams.search,
        }}
      />
    </div>
  );
}
