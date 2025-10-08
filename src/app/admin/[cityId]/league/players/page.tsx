// src/app/admin/[cityId]/league/players/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Players list page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getPlayers } from "@/lib/db/queries/players";
import { getDivisions } from "@/lib/db/queries/divisions";
import { PlayersContent } from "@/components/features/league/players/PlayersContent";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface PlayersPageProps {
  params: { cityId: string };
  searchParams: {
    page?: string;
    payment?: string;
    division?: string;
    team?: string;
    freeAgents?: string;
    hasUser?: string;
    search?: string;
  };
}

export default async function PlayersPage({
  params,
  searchParams,
}: PlayersPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "view_players")) {
    redirect("/unauthorized");
  }

  const page = parseInt(searchParams.page || "1");
  const paymentFilter = (searchParams.payment || "all") as any;
  const freeAgentsOnly = searchParams.freeAgents === "true";
  const hasUserAccount = searchParams.hasUser
    ? searchParams.hasUser === "true"
    : undefined;

  const [result, divisions] = await Promise.all([
    getPlayers({
      cityId: params.cityId,
      page,
      paymentFilter,
      divisionId: searchParams.division,
      teamId: searchParams.team,
      freeAgentsOnly,
      hasUserAccount,
      search: searchParams.search,
    }),
    getDivisions({
      cityId: params.cityId,
      page: 1,
      limit: 100,
      activeFilter: "active",
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Players</h1>
          <p className="text-gray-600 mt-1">
            Manage player profiles and registrations
          </p>
        </div>
        {hasPermission(session, "manage_players") && (
          <Button asChild>
            <Link href={`/admin/${params.cityId}/league/players/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Create Player
            </Link>
          </Button>
        )}
      </div>

      <PlayersContent
        players={result.players as any}
        pagination={result.pagination}
        divisions={divisions.divisions as any}
        cityId={params.cityId}
        currentFilters={{
          payment: paymentFilter,
          division: searchParams.division,
          team: searchParams.team,
          freeAgents: freeAgentsOnly,
          hasUser: hasUserAccount,
          search: searchParams.search,
        }}
      />
    </div>
  );
}
