// src/components/features/league/divisions/DivisionDetailContent.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Division detail content with add team functionality
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Building2,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { formatTimeRange, formatTime } from "@/lib/utils/time";

interface DivisionDetailContentProps {
  division: any;
  teamCount: number;
}

export function DivisionDetailContent({
  division,
  teamCount,
}: DivisionDetailContentProps) {
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

  // Use earlyBirdDeadline if set, otherwise fall back to old calculation (42 days before startDate)
  const earlyBirdEndDate = division.earlyBirdDeadline
    ? new Date(division.earlyBirdDeadline)
    : division.startDate
    ? subDays(new Date(division.startDate), 42)
    : null;
  const isEarlyBirdActive = earlyBirdEndDate
    ? new Date() < earlyBirdEndDate
    : false;

  // Jersey deadline is always calculated as 28 days before startDate
  const jerseyDeadline = division.startDate
    ? subDays(new Date(division.startDate), 28)
    : null;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Division Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">Location & Level</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                  {division.city?.cityName && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span>{division.city.cityName}</span>
                    </div>
                  )}
                  {division.location?.name && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{division.location.name}</span>
                    </div>
                  )}
                  {division.level?.name && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{division.level.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Schedule</p>
                <p className="font-medium">
                  {division.day}s{" "}
                  {formatTimeRange(division.startTime, division.endTime)}
                </p>
              </div>
            </div>

            {/* {division.startTime && division.endTime && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">
                    {formatTime(division.startTime)} -{" "}
                    {formatTime(division.endTime)}
                  </p>
                </div>
              </div>
            )} */}

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
                    {division.prices?.earlyBird?.name && (
                      <p className="text-xs text-gray-500">
                        {division.prices.earlyBird.name}
                      </p>
                    )}
                    <p className="font-medium">
                      $
                      {division.prices?.earlyBird?.amount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Regular:</span>
                    {division.prices?.regular?.name && (
                      <p className="text-xs text-gray-500">
                        {division.prices.regular.name}
                      </p>
                    )}
                    <p className="font-medium">
                      ${division.prices?.regular?.amount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b pb-2">
                <p className="text-sm font-medium mb-2">Installment Payments</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Down Payment:</span>
                    {division.prices?.firstInstallment?.name && (
                      <p className="text-xs text-gray-500">
                        {division.prices.firstInstallment.name}
                      </p>
                    )}
                    <p className="font-medium">
                      $
                      {division.prices?.firstInstallment?.amount?.toFixed(2) ||
                        "0.00"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Weekly (EB):</span>
                    {division.prices?.installment?.name && (
                      <p className="text-xs text-gray-500">
                        {division.prices.installment.name}
                      </p>
                    )}
                    <p className="font-medium">
                      $
                      {division.prices?.installment?.amount?.toFixed(2) ||
                        "0.00"}
                      /wk
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
