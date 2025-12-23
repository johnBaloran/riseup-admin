// src/app/league/teams/[id]/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team detail page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getTeamById, getTeamStats } from "@/lib/db/queries/teams";
import { getGamesByTeam } from "@/lib/db/queries/games";
import { getDivisionsForSwitching } from "@/lib/db/queries/divisions";
import { getTeamPlayersWithStats } from "@/lib/db/queries/players";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { RosterManager } from "@/components/features/league/teams/RosterManager";
import { DeleteTeamButton } from "@/components/features/league/teams/DeleteTeamButton";
import { SwitchDivisionDialog } from "@/components/features/league/teams/SwitchDivisionDialog";
import { EditTeamInfoDialog } from "@/components/features/league/teams/EditTeamInfoDialog";
import { TransferPlayerData } from "@/components/features/league/teams/TransferPlayerData";
import { TeamUpcomingGames } from "@/components/features/league/teams/TeamUpcomingGames";
import { TeamPlayerStatsSection } from "@/components/features/league/teams/TeamPlayerStatsSection";
import Link from "next/link";
import {
  MapPin,
  Trophy,
  Users,
  Calendar,
  AlertCircle,
  Building2,
  TrendingUp,
  Clock,
  UserCheck,
} from "lucide-react";
import { format, subDays, isBefore } from "date-fns";
import { TeamGameHistory } from "@/components/features/league/teams/TeamGameHistory";

interface TeamDetailPageProps {
  params: { cityId: string; id: string };
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "view_teams")) {
    redirect("/unauthorized");
  }

  // Fetch all data in parallel
  const [
    team,
    stats,
    games,
    { activeDivisions, registrationDivisions },
    playerStats,
  ] = await Promise.all([
    getTeamById(params.id),
    getTeamStats(params.id),
    getGamesByTeam(params.id),
    getDivisionsForSwitching(),
    getTeamPlayersWithStats(params.id),
  ]);

  if (!team) {
    redirect(`/league/teams`);
  }

  const noCaptainWarning =
    !team.teamCaptain && team.players && team.players.length > 0;

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
      {/* Header */}
      <PageHeader
        title={team.teamName}
        description={`${team.teamNameShort} (${team.teamCode})`}
        actions={
          <>
            {noCaptainWarning && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 border-yellow-200"
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                No Captain
              </Badge>
            )}
            {hasPermission(session, "manage_teams") && (
              <>
                <EditTeamInfoDialog team={team} />
                <DeleteTeamButton
                  teamId={params.id}
                  teamName={team.teamName}
                  hasPlayers={team.players && team.players.length > 0}
                  playerCount={team.players?.length || 0}
                />
              </>
            )}
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Details */}
        <Card>
          <CardHeader>
            <CardTitle>Team Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-gray-500">Division</p>
                  {hasPermission(session, "manage_teams") &&
                    (team.division as any)?._id && (
                      <SwitchDivisionDialog
                        teamId={params.id}
                        currentDivisionId={(
                          team.division as any
                        )._id.toString()}
                        activeDivisions={JSON.parse(
                          JSON.stringify(activeDivisions)
                        )}
                        registrationDivisions={JSON.parse(
                          JSON.stringify(registrationDivisions)
                        )}
                      />
                    )}
                </div>
                {(team.division as any)?.divisionName ? (
                  <div className="space-y-1">
                    <Link
                      href={`/league/divisions/${(team.division as any)._id}`}
                      className="font-semibold text-blue-600 hover:underline block"
                    >
                      {(team.division as any).divisionName}
                    </Link>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      {(team.division as any)?.city?.cityName && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{(team.division as any).city.cityName}</span>
                        </div>
                      )}
                      {(team.division as any)?.location?.name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{(team.division as any).location.name}</span>
                        </div>
                      )}
                      {(team.division as any)?.level?.name && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{(team.division as any).level.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="font-medium text-gray-500">
                    No division assigned
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Team Captain</p>
                <p className="font-medium">
                  {team.teamCaptain ? (
                    <Link
                      href={`/league/players/${(team.teamCaptain as any)._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {(team.teamCaptain as any).playerName}
                    </Link>
                  ) : (
                    <span className="text-yellow-600">Not assigned</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Team Created</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {teamCreatedAt
                      ? format(new Date(teamCreatedAt), "MMM dd, yyyy")
                      : "N/A"}
                  </p>
                  {isEarlyBird ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      Early Bird
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-800 border-gray-200"
                    >
                      Regular
                    </Badge>
                  )}
                </div>
                {earlyBirdDeadline && (
                  <p className="text-xs text-gray-500 mt-1">
                    Early bird ended:{" "}
                    {format(earlyBirdDeadline, "MMM dd, yyyy")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Record</p>
              <p className="text-3xl font-bold">
                {stats?.wins || 0}-{stats?.losses || 0}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Wins</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.wins || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Losses</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.losses || 0}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Point Differential</p>
              <p className="text-2xl font-bold">
                {stats?.pointDifference && stats.pointDifference > 0 ? "+" : ""}
                {stats?.pointDifference || 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Games Played</p>
              <p className="text-2xl font-bold">{team.games?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roster */}
      <RosterManager team={team} cityId={params.cityId} />

      {/* Player Statistics */}
      <TeamPlayerStatsSection
        players={JSON.parse(JSON.stringify(playerStats))}
      />

      {/* Transfer Player Data */}
      {hasPermission(session, "manage_teams") && (
        <TransferPlayerData team={team} />
      )}

      {/* Game History */}
      <TeamGameHistory
        games={JSON.parse(JSON.stringify(games))}
        teamId={params.id}
      />

      {/* Jersey Information */}
      {(team.primaryColor ||
        team.secondaryColor ||
        team.jerseyEdition ||
        team.isCustomJersey) && (
        <Card>
          <CardHeader>
            <CardTitle>Jersey Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {team.isCustomJersey ? (
              <div>
                <p className="text-sm text-gray-500">Jersey Type</p>
                <p className="font-medium">Custom Jersey</p>
              </div>
            ) : team.jerseyEdition ? (
              <div>
                <p className="text-sm text-gray-500">Jersey Edition</p>
                <p className="font-medium">{team.jerseyEdition}</p>
              </div>
            ) : null}

            {(team.primaryColor ||
              team.secondaryColor ||
              team.tertiaryColor) && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Team Colors</p>
                <div className="flex gap-3">
                  {team.primaryColor && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: team.primaryColor }}
                      />
                      <span className="text-xs text-gray-500">Primary</span>
                    </div>
                  )}
                  {team.secondaryColor && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: team.secondaryColor }}
                      />
                      <span className="text-xs text-gray-500">Secondary</span>
                    </div>
                  )}
                  {team.tertiaryColor && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: team.tertiaryColor }}
                      />
                      <span className="text-xs text-gray-500">Tertiary</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
