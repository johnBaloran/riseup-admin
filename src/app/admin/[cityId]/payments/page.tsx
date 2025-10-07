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
import { getLocationsByCity } from "@/lib/db/queries/locations";
import { getDivisions } from "@/lib/db/queries/divisions";
import { PaymentDashboard } from "@/components/features/payments/PaymentDashboard";

interface PaymentPageProps {
  params: { cityId: string };
  searchParams: {
    location?: string;
    division?: string;
    team?: string;
    payment?: string;
    search?: string;
  };
}

export default async function PaymentPage({
  params,
  searchParams,
}: PaymentPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "view_payments")) {
    redirect("/unauthorized");
  }

  const [players, locations, divisions] = await Promise.all([
    getPlayersWithPaymentStatus({
      cityId: params.cityId,
      locationId: searchParams.location,
      divisionId: searchParams.division,
      teamId: searchParams.team,
      paymentStatusFilter: searchParams.payment || "all",
      search: searchParams.search,
    }),
    getLocationsByCity(params.cityId),
    getDivisions({
      cityId: params.cityId,
      page: 1,
      limit: 100,
      activeFilter: "active",
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
        <p className="text-gray-600 mt-1">
          Track player payments and manage installment plans
        </p>
      </div>

      <PaymentDashboard
        players={JSON.parse(JSON.stringify(players))}
        locations={JSON.parse(JSON.stringify(locations))}
        divisions={JSON.parse(JSON.stringify(divisions.divisions))}
        cityId={params.cityId}
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