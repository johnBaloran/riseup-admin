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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
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

  const player = await getPlayerById(params.id);

  if (!player) {
    redirect(`/league/players`);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/league/players`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        {hasPermission(session, "manage_players") && (
          <Button asChild>
            <Link href={`/league/players/${params.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Player
            </Link>
          </Button>
        )}
      </div>

      {/* Title & Status */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {player.playerName}
          </h1>
          {player.jerseyNumber && (
            <Badge variant="outline" className="text-lg px-3 py-1">
              #{player.jerseyNumber}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {player.paymentStatus === "paid" && (
            <Badge
              variant="outline"
              className="bg-green-100 text-green-800 border-green-200"
            >
              Paid
            </Badge>
          )}
          {player.paymentStatus === "in_progress" && (
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 border-blue-200"
            >
              Installments
            </Badge>
          )}
          {player.paymentStatus === "unpaid" && (
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
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Player Details */}
        <Card>
          <CardHeader>
            <CardTitle>Player Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">
                  {(player.division as any)?.city?.cityName || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">
                  {(player.division as any)?.location?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Division</p>
                <p className="font-medium">
                  {(player.division as any)?.divisionName || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Skill Level</p>
                <p className="font-medium">
                  Grade {(player.division as any)?.level?.grade || "N/A"} -{" "}
                  {(player.division as any)?.level?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Team</p>
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
              {player.paymentStatus === "paid" && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Fully Paid
                  </Badge>
                </div>
              )}
              {player.paymentStatus === "in_progress" && (
                <div className="space-y-3">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Installment Plan Active
                  </Badge>
                  {player.installmentProgress && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        Weekly Progress
                      </p>
                      <InstallmentProgress
                        payments={player.installmentProgress}
                        size="md"
                      />
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            Remaining Balance:
                          </span>
                          <span className="font-medium">
                            ${player.remainingBalance?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        {player.nextPaymentDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Next Payment:</span>
                            <span className="font-medium">
                              {format(
                                new Date(player.nextPaymentDate),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {player.paymentStatus === "unpaid" && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  No Payment Recorded
                </Badge>
              )}
            </div>

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
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href={`/league/players/${params.id}/edit`}>
                    Link User Account
                  </Link>
                </Button>
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
                {player.jerseyNumber
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

      {/* Game Statistics - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Game Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Game statistics will be tracked here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              (Statistics tracking to be implemented)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
