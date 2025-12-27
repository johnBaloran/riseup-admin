// src/app/league/players/[id]/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player detail page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getPlayerById } from "@/lib/db/queries/players";
import { getTeamsForSwitching } from "@/lib/db/queries/teams";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { EditPlayerInfoDialog } from "@/components/features/league/players/EditPlayerInfoDialog";
import { DeletePlayerButton } from "@/components/features/league/players/DeletePlayerButton";
import { SwitchTeamDialog } from "@/components/features/league/players/SwitchTeamDialog";
import Link from "next/link";
import {
  Trophy,
  MapPin,
  Mail,
  Phone,
  Instagram,
  User,
  Building2,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { InstallmentProgress } from "@/components/features/payments/InstallmentProgress";
import { format } from "date-fns";
import { PlayerAverageStats } from "@/components/features/league/players/PlayerAverageStats";
import { PlayerGameStatsTable } from "@/components/features/league/players/PlayerGameStatsTable";
import { getPhotosByPlayerId } from "@/lib/db/queries/gamePhotos";
import { PlayerPhotos } from "@/components/features/league/players/PlayerPhotos";
import { LinkUserAccountDialog } from "@/components/features/league/players/LinkUserAccountDialog";
import { UnlinkUserAccountButton } from "@/components/features/league/players/UnlinkUserAccountButton";

interface PlayerDetailPageProps {
  params: { cityId: string; id: string };
}

export default async function PlayerDetailPage({
  params,
}: PlayerDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "view_players")) {
    redirect("/unauthorized");
  }

  // Fetch all data in parallel
  const [player, photos, teamsByDivision] = await Promise.all([
    getPlayerById(params.id),
    getPhotosByPlayerId(params.id),
    getTeamsForSwitching(),
  ]);

  if (!player) {
    redirect(`/league/players`);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title={player.playerName}
        description={
          player.jerseyNumber != null
            ? `#${player.jerseyNumber}`
            : undefined
        }
        actions={
          <>
            {player.calculatedPaymentStatus === "paid" && (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200"
              >
                Paid
              </Badge>
            )}
            {player.calculatedPaymentStatus === "in_progress" && (
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-800 border-blue-200"
              >
                Installments
              </Badge>
            )}
            {player.calculatedPaymentStatus === "unpaid" && (
              <Badge
                variant="outline"
                className="bg-red-100 text-red-800 border-red-200"
              >
                Unpaid
              </Badge>
            )}
            {!player.team && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 border-yellow-200"
              >
                Free Agent
              </Badge>
            )}
            {hasPermission(session, "manage_players") && (
              <>
                <EditPlayerInfoDialog player={player} />
                <DeletePlayerButton
                  playerId={params.id}
                  playerName={player.playerName}
                  hasUser={!!player.user}
                />
              </>
            )}
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Player Details */}
        <Card>
          <CardHeader>
            <CardTitle>Player Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">Division</p>
                {(player.division as any)?.divisionName ? (
                  <div className="space-y-1">
                    <Link
                      href={`/league/divisions/${(player.division as any)._id}`}
                      className="font-semibold text-blue-600 hover:underline block"
                    >
                      {(player.division as any).divisionName}
                    </Link>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      {(player.division as any)?.city?.cityName && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{(player.division as any).city.cityName}</span>
                        </div>
                      )}
                      {(player.division as any)?.location?.name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{(player.division as any).location.name}</span>
                        </div>
                      )}
                      {(player.division as any)?.level?.name && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{(player.division as any).level.name}</span>
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

            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-gray-500">Team</p>
                  {hasPermission(session, "manage_players") &&
                    (player.division as any)?._id && (
                      <SwitchTeamDialog
                        playerId={params.id}
                        currentTeamId={(player.team as any)?._id?.toString()}
                        currentDivisionId={(
                          player.division as any
                        )._id.toString()}
                        teamsByDivision={JSON.parse(
                          JSON.stringify(teamsByDivision)
                        )}
                      />
                    )}
                </div>
                <p className="font-medium">
                  {player.team ? (
                    <Link
                      href={`/league/teams/${(player.team as any)._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {(player.team as any).teamName}
                    </Link>
                  ) : (
                    <span className="text-yellow-600">Free Agent</span>
                  )}
                </p>
              </div>
            </div>

            {player.instagram && (
              <div className="flex items-center gap-3">
                <Instagram className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Instagram</p>
                  <p className="font-medium">{player.instagram}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Status</p>
              {player.calculatedPaymentStatus === "paid" && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Fully Paid
                  </Badge>
                </div>
              )}
              {player.calculatedPaymentStatus === "in_progress" && (
                <div className="space-y-3">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Installment Plan Active
                  </Badge>
                </div>
              )}
              {player.calculatedPaymentStatus === "unpaid" && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  No Payment Recorded
                </Badge>
              )}
            </div>

            {/* Pricing & Amount Information */}
            {player.pricingTier && (
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Payment Details
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pricing Tier:</span>
                  <span className="font-medium">
                    {player.pricingTier === "EARLY_BIRD"
                      ? "Early Bird"
                      : "Regular"}
                  </span>
                </div>

                {player.amountPaid !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount Paid:</span>
                    <span className="font-medium text-green-700">
                      ${player.amountPaid.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {hasPermission(session, "manage_payments") && (
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/payments/${params.id}`}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Manage Payment
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Account */}
      {player.user && (
        <Card>
          <CardHeader>
            <CardTitle>Linked User Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{(player.user as any).name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{(player.user as any).email}</p>
              </div>
            </div>

            {(player.user as any).phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">
                    {(player.user as any).phoneNumber}
                  </p>
                </div>
              </div>
            )}

            {(player.user as any).instagram && (
              <div className="flex items-center gap-3">
                <Instagram className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Instagram</p>
                  <p className="font-medium">
                    {(player.user as any).instagram}
                  </p>
                </div>
              </div>
            )}

            {hasPermission(session, "manage_players") && (
              <div className="pt-4 border-t">
                <UnlinkUserAccountButton
                  playerId={params.id}
                  userName={(player.user as any).name}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!player.user && (
        <Card>
          <CardHeader>
            <CardTitle>User Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                No user account linked to this player
              </p>
              {hasPermission(session, "manage_players") && (
                <div className="mt-4">
                  <LinkUserAccountDialog playerId={params.id} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jersey Information */}
      <Card>
        <CardHeader>
          <CardTitle>Jersey Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Jersey Number</p>
              <p className="font-medium text-lg">
                {player.jerseyNumber != null
                  ? `#${player.jerseyNumber}`
                  : "Not assigned"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jersey Size</p>
              <p className="font-medium">
                {player.jerseySize || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jersey Name</p>
              <p className="font-medium">
                {player.jerseyName || "Not specified"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Statistics */}
      <PlayerAverageStats stats={player.averageStats} playerId={params.id} />
      <PlayerGameStatsTable
        stats={player.allStats}
        playerId={params.id}
        canManage={hasPermission(session, "manage_players")}
      />
      <PlayerPhotos photos={photos} />
    </div>
  );
}
