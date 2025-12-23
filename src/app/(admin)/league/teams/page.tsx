// src/app/league/teams/page.tsx

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
import { PageHeader } from "@/components/layout/PageHeader";
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
    noCaptain?: string;
    noPlayers?: string;
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
  const tab = (searchParams.tab || "all") as "active" | "inactive" | "all" | "registration";
  const viewMode = (searchParams.view || "card") as any;

  const [result, allTeamsResult, divisions, locations] = await Promise.all([
    getTeams({
      page,
      divisionId: searchParams.division,
      locationId: searchParams.location,
      search: searchParams.search,
      viewMode,
      activeFilter: tab,
      noCaptain: searchParams.noCaptain === "true",
      noPlayers: searchParams.noPlayers === "true",
    }),
    getTeams({ limit: 999999, activeFilter: "active" }), // Get all active teams for stats
    getDivisions({
      activeFilter: "active",
    }),
    getAllLocations(),
  ]);

  // Build create team URL with division filter if present
  const createTeamUrl = searchParams.division
    ? `/league/teams/new?division=${searchParams.division}`
    : `/league/teams/new`;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Teams"
        description="Manage teams, rosters, and assignments"
        actions={
          <Button asChild>
            <Link href={createTeamUrl}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Link>
          </Button>
        }
      />

      <TeamsContent
        teams={result.teams as any}
        allTeams={allTeamsResult.teams as any}
        pagination={result.pagination}
        divisions={divisions.divisions as any}
        locations={locations as any}
        currentTab={tab}
        currentView={viewMode}
        currentFilters={{
          division: searchParams.division,
          location: searchParams.location,
          search: searchParams.search,
          noCaptain: searchParams.noCaptain === "true",
          noPlayers: searchParams.noPlayers === "true",
        }}
      />
    </div>
  );
}
