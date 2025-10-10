// src/app/admin/[cityId]/league/teams/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Teams list page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getTeams } from "@/lib/db/queries/teams";
import { getDivisions } from "@/lib/db/queries/divisions";
import {
  getAllLocations,
  getLocationsByCity,
} from "@/lib/db/queries/locations";
import { TeamsContent } from "@/components/features/league/teams/TeamsContent";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface TeamsPageProps {
  searchParams: {
    page?: string;
    tab?: string;
    division?: string;
    location?: string;
    search?: string;
    view?: string;
  };
}

export default async function TeamsPage({ searchParams }: TeamsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "view_teams")) {
    redirect("/unauthorized");
  }

  const page = parseInt(searchParams.page || "1");
  const tab = (searchParams.tab || "active") as "active" | "inactive" | "all";
  const viewMode = (searchParams.view || "card") as any;

  const [result, divisions, locations] = await Promise.all([
    getTeams({
      page,
      divisionId: searchParams.division,
      locationId: searchParams.location,
      search: searchParams.search,
      viewMode,
      activeFilter: tab,
    }),
    getDivisions({
      page: 1,
      limit: 100,
      activeFilter: "all",
    }),
    getAllLocations(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-gray-600 mt-1">
            Manage teams, rosters, and assignments
          </p>
        </div>
        <Button asChild>
          <Link href={`/admin/league/teams/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Link>
        </Button>
      </div>

      <TeamsContent
        teams={result.teams as any}
        pagination={result.pagination}
        divisions={divisions.divisions as any}
        locations={locations as any}
        currentTab={tab}
        currentView={viewMode}
        currentFilters={{
          division: searchParams.division,
          location: searchParams.location,
          search: searchParams.search,
        }}
      />
    </div>
  );
}
