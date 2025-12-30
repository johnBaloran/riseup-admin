// src/app/league/teams/new/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Create team page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getActiveCities } from "@/lib/db/queries/cities";
import { getDivisionById } from "@/lib/db/queries/divisions";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateTeamForm } from "@/components/features/league/teams/CreateTeamForm";

interface CreateTeamPageProps {
  searchParams: {
    division?: string;
  };
}

export default async function CreateTeamPage({
  searchParams,
}: CreateTeamPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_teams")) {
    redirect("/unauthorized");
  }

  const cities = await getActiveCities();

  // If division is provided, fetch the division to get pre-filled data
  let prefilledDivision = null;
  if (searchParams.division) {
    try {
      prefilledDivision = await getDivisionById(searchParams.division);
    } catch (error) {
      console.error("Error fetching division for prefill:", error);
    }
  }

  // Serialize for Client Component
  const serializedCities = JSON.parse(JSON.stringify(cities));
  const serializedDivision = prefilledDivision
    ? JSON.parse(JSON.stringify(prefilledDivision))
    : null;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Create Team"
        description="Create a new team manually. Players and captain can be assigned after creation."
        tutorialId="creating-teams"
      />

      <div className="max-w-2xl">
        <CreateTeamForm
          cities={serializedCities}
          prefilledDivision={serializedDivision}
        />
      </div>
    </div>
  );
}
