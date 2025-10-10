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
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format, subDays, isBefore } from "date-fns";

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
    redirect(`/admin/league/teams`);
  }

  // Calculate early bird status
  const divisionStartDate = (team.division as any)?.startDate;
  const earlyBirdDeadline = divisionStartDate
    ? subDays(new Date(divisionStartDate), 42)
    : null;
  const teamCreatedAt = (team as any).createdAt;
  const isEarlyBird =
    earlyBirdDeadline && teamCreatedAt
      ? isBefore(new Date(teamCreatedAt), earlyBirdDeadline)
      : false;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/league/teams/${params.id}`}>
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

      {/* Team Creation & Jersey Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <p className="font-medium text-blue-900">
                  Team Created: {teamCreatedAt ? format(new Date(teamCreatedAt), "MMMM dd, yyyy") : "N/A"}
                </p>
                {isEarlyBird ? (
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Early Bird - Default Jerseys
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Regular - No Default Jerseys
                  </Badge>
                )}
              </div>
              {earlyBirdDeadline && (
                <p className="text-sm text-blue-700">
                  {isEarlyBird
                    ? `This team was created before the early bird deadline (${format(earlyBirdDeadline, "MMM dd, yyyy")}). Players will receive default jerseys.`
                    : `This team was created after the early bird deadline (${format(earlyBirdDeadline, "MMM dd, yyyy")}). Players will NOT receive default jerseys.`
                  }
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <RosterManager team={team} cityId={params.cityId} />
    </div>
  );
}
