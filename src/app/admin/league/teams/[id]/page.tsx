// src/app/admin/[cityId]/league/teams/[id]/page.tsx

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import {
  Pencil,
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

  const [team, stats, games] = await Promise.all([
    getTeamById(params.id),
    getTeamStats(params.id),
    getGamesByTeam(params.id),
  ]);

  if (!team) {
    redirect(`/admin/league/teams`);
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
        showBackButton
        backButtonFallback={{
          href: "/admin/league/teams",
          label: "Back to Teams",
        }}
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
              <Button asChild>
                <Link href={`/admin/league/teams/${params.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Team
                </Link>
              </Button>
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
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">
                  {(team.division as any)?.city?.cityName || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">
                  {(team.division as any)?.location?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Division</p>
                <p className="font-medium">
                  {(team.division as any)?.divisionName || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Skill Level</p>
                <p className="font-medium">
                  Grade {(team.division as any)?.level?.grade || "N/A"} -{" "}
                  {(team.division as any)?.level?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Team Captain</p>
                <p className="font-medium">
                  {(team.teamCaptain as any)?.playerName || (
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
              <p className="text-sm text-gray-500">Total Players</p>
              <p className="text-2xl font-bold">{team.players?.length || 0}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Games Played</p>
              <p className="text-2xl font-bold">{team.games?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roster */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Roster ({team.players?.length || 0} Players)</CardTitle>
            {hasPermission(session, "manage_teams") && (
              <Button size="sm" asChild>
                <Link href={`/admin/league/teams/${params.id}/roster`}>
                  Manage Roster
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!team.players || team.players.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                No players on this team yet
              </p>
              {hasPermission(session, "manage_teams") && (
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href={`/admin/league/teams/${params.id}/roster`}>
                    Add Players
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {team.players.map((player: any) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 font-bold text-gray-600">
                      {player.jerseyNumber || "—"}
                    </div>
                    <div>
                      <p className="font-medium">{player.playerName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {player._id === team.teamCaptain?._id && (
                          <Badge variant="outline">
                            Captain
                          </Badge>
                        )}
                        {player.user ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Has Account
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                            No Account
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/league/players/${player._id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
