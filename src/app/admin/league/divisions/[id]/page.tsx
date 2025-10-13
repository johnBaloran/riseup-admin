// src/app/admin/league/divisions/[id]/page.tsx

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import {
  Pencil,
  MapPin,
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { formatTimeRange, formatTime } from "@/lib/utils/time";
import { DivisionFreeAgents } from "@/components/features/league/DivisionFreeAgents";

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

  const [division, teamCount, freeAgents] = await Promise.all([
    getDivisionById(params.id),
    getDivisionTeamCount(params.id),
    getDivisionFreeAgents(params.id),
  ]);

  if (!division) {
    redirect("/admin/league/divisions");
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

  const earlyBirdEndDate = division.startDate
    ? subDays(new Date(division.startDate), 42)
    : null;
  const isEarlyBirdActive = earlyBirdEndDate
    ? new Date() < earlyBirdEndDate
    : false;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title={division.divisionName}
        description={division.description}
        showBackButton
        backButtonFallback={{
          href: "/admin/league/divisions",
          label: "Back to Divisions",
        }}
        actions={
          <>
            {getStatusBadge()}
            <Button asChild>
              <Link href={`/admin/league/divisions/${params.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Division
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Division Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">
                  {division.location?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Skill Level</p>
                <p className="font-medium">
                  Grade {division.level?.grade} - {division.level?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Schedule</p>
                <p className="font-medium">
                  {division.day}{" "}
                  {formatTimeRange(division.startTime, division.endTime)}
                </p>{" "}
              </div>
            </div>

            {division.startTime && division.endTime && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">
                    {formatTime(division.startTime)} - {formatTime(division.endTime)}
                  </p>
                </div>
              </div>
            )}

            {division.startDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {format(new Date(division.startDate), "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Teams</p>
                <p className="font-medium">
                  {teamCount} team{teamCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {earlyBirdEndDate && (
              <div
                className={`p-3 rounded-lg border ${
                  isEarlyBirdActive
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p className="text-sm font-medium">
                  {isEarlyBirdActive
                    ? "✓ Early Bird Active"
                    : "Early Bird Ended"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {isEarlyBirdActive
                    ? `Ends ${format(earlyBirdEndDate, "MMM dd, yyyy")}`
                    : `Ended ${format(earlyBirdEndDate, "MMM dd, yyyy")}`}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="border-b pb-2">
                <p className="text-sm font-medium mb-2">Single Payment</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Early Bird:</span>
                    <p className="font-medium">
                      $
                      {division.prices?.earlyBird?.amount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Regular:</span>
                    <p className="font-medium">
                      ${division.prices?.regular?.amount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b pb-2">
                <p className="text-sm font-medium mb-2">Installment Payments</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Down Payment:</span>
                    <p className="font-medium">
                      $
                      {division.prices?.firstInstallment?.amount?.toFixed(2) ||
                        "0.00"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500">Weekly (EB):</span>
                      <p className="font-medium">
                        $
                        {division.prices?.installment?.amount?.toFixed(2) ||
                          "0.00"}
                        /wk
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Weekly (Reg):</span>
                      <p className="font-medium">
                        $
                        {division.prices?.regularInstallment?.amount?.toFixed(
                          2
                        ) || "0.00"}
                        /wk
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">Free:</span>
                <p className="font-medium text-sm">
                  ${division.prices?.free?.amount?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href={`/admin/league/teams?division=${params.id}`}>
              <Users className="mr-2 h-4 w-4" />
              View Teams ({teamCount})
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/games?division=${params.id}`}>
              <Calendar className="mr-2 h-4 w-4" />
              View Schedule
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Free Agents Section */}
      <DivisionFreeAgents players={JSON.parse(JSON.stringify(freeAgents))} />
    </div>
  );
}
