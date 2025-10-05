// src/app/admin/[cityId]/league/teams/[id]/roster/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Roster management page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getTeamById } from "@/lib/db/queries/teams";
import { RosterManager } from "@/components/features/league/teams/RosterManager";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RosterPageProps {
  params: { cityId: string; id: string };
}

export default async function RosterPage({ params }: RosterPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_teams")) {
    redirect("/unauthorized");
  }

  const team = await getTeamById(params.id);

  if (!team) {
    redirect(`/admin/${params.cityId}/league/teams`);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/${params.cityId}/league/teams/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Manage Roster - {team.teamName}
        </h1>
        <p className="text-gray-600 mt-1">
          Add or remove players from the team roster
        </p>
      </div>

      <RosterManager team={team} cityId={params.cityId} />
    </div>
  );
}
