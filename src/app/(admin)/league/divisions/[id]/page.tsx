// src/app/league/divisions/[id]/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Division detail page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getDivisionById,
  getDivisionTeamCount,
} from "@/lib/db/queries/divisions";
import { getDivisionFreeAgents } from "@/lib/db/queries/players";
import { getTeams } from "@/lib/db/queries/teams";
import { getGamesByDivision } from "@/lib/db/queries/games";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { DivisionFreeAgents } from "@/components/features/league/DivisionFreeAgents";
import { DivisionDetailContent } from "@/components/features/league/divisions/DivisionDetailContent";
import { DivisionStandingsSection } from "@/components/features/league/divisions/DivisionStandingsSection";
import { DivisionTeamsSection } from "@/components/features/league/divisions/DivisionTeamsSection";
import { DivisionScheduleSection } from "@/components/features/league/divisions/DivisionScheduleSection";

interface DivisionDetailPageProps {
  params: { id: string };
}

export default async function DivisionDetailPage({
  params,
}: DivisionDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "view_divisions")) {
    redirect("/unauthorized");
  }

  const [division, teamCount, freeAgents, teamsResult, games] =
    await Promise.all([
      getDivisionById(params.id),
      getDivisionTeamCount(params.id),
      getDivisionFreeAgents(params.id),
      getTeams({ divisionId: params.id, limit: 100 }),
      getGamesByDivision({ divisionId: params.id }),
    ]);

  if (!division) {
    redirect("/league/divisions");
  }

  const getStatusBadge = () => {
    if (!division.active && !division.register) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 border-gray-200"
        >
          Finished
        </Badge>
      );
    }
    if (!division.active && division.register) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 border-yellow-200"
        >
          Registration
        </Badge>
      );
    }
    if (division.active && !division.register) {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200"
        >
          Active - Closed
        </Badge>
      );
    }
    if (division.active && division.register) {
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-200"
        >
          Active - Open
        </Badge>
      );
    }
  };

  // Serialize for Client Components
  const serializedDivision = JSON.parse(JSON.stringify(division));
  const teams = teamsResult.teams;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title={division.divisionName}
        description={division.description}
        tutorialId="editing-managing-divisions"
        actions={
          <>
            {getStatusBadge()}
            <Button asChild>
              <Link href={`/league/divisions/${params.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Division
              </Link>
            </Button>
          </>
        }
      />

      {/* Division Details & Quick Actions */}
      <DivisionDetailContent
        division={serializedDivision}
        teamCount={teamCount}
      />

      {/* Teams Section */}
      <DivisionTeamsSection
        teams={JSON.parse(JSON.stringify(teams))}
        division={serializedDivision}
      />

      {/* Free Agents Section */}
      <DivisionFreeAgents players={JSON.parse(JSON.stringify(freeAgents))} />

      {/* Standings */}
      <DivisionStandingsSection teams={JSON.parse(JSON.stringify(teams))} />

      {/* Schedule Section */}
      <DivisionScheduleSection
        games={JSON.parse(JSON.stringify(games))}
        divisionId={params.id}
      />
    </div>
  );
}
