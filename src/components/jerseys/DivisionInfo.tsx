// src/components/jerseys/DivisionInfo.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display division information ONLY
 */

"use client";

import { CheckCircle, Clock, AlertTriangle, Shirt, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DivisionWithTeams } from "@/types/jersey";
import { TeamWithJerseyInfo } from "@/types/jersey";

interface DivisionInfoProps {
  division: DivisionWithTeams;
  teams: TeamWithJerseyInfo[];
}

export default function DivisionInfo({ division, teams }: DivisionInfoProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate division-specific stats
  const divisionStats = {
    totalTeams: teams.length,
    teamsWithDesign: teams.filter((t) => t.isCustomJersey || t.jerseyEdition)
      .length,
    teamsWithoutDesign: teams.filter(
      (t) => !t.isCustomJersey && !t.jerseyEdition
    ).length,
    completeTeams: teams.filter((t) => {
      const hasDesign = t.isCustomJersey || t.jerseyEdition;
      const allPlayersReady =
        t.players.length > 0 &&
        t.players.every(
          (p: any) => p.jerseyNumber != null && p.jerseySize != null
        );
      return hasDesign && allPlayersReady;
    }).length,
  };

  const getDeadlineBadge = () => {
    if (!division.jerseyDeadline) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
          No deadline set
        </span>
      );
    }

    const daysUntil = getDaysUntilDeadline(division.jerseyDeadline);

    if (daysUntil < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <AlertTriangle size={12} />
          Deadline passed {Math.abs(daysUntil)} days ago
        </span>
      );
    } else if (daysUntil <= 7) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
          <Clock size={12} />
          {daysUntil} days left
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <CheckCircle size={12} />
          {daysUntil} days left
        </span>
      );
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {division.divisionName}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                <span>{division.location.name}</span>
                <span className="hidden sm:inline">•</span>
                <span>{division.day}</span>
                <span className="hidden sm:inline">•</span>
                <span>{division.level.name}</span>
                {division.jerseyDeadline && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span>Deadline: {formatDate(division.jerseyDeadline)}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getDeadlineBadge()}
            </div>
          </div>

          {/* Division-specific stats */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-4 pt-4 border-t text-sm">
            <div className="flex items-center gap-2">
              <Users className="text-gray-400" size={16} />
              <span className="text-gray-600">
                <span className="font-semibold text-gray-900">
                  {divisionStats.totalTeams}
                </span>{" "}
                teams in division
              </span>
            </div>
            <span className="hidden sm:inline text-gray-300">•</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-gray-600">
                <span className="font-semibold text-green-600">
                  {divisionStats.teamsWithDesign}
                </span>{" "}
                selected design
              </span>
            </div>
            <span className="hidden sm:inline text-gray-300">•</span>
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-600" size={16} />
              <span className="text-gray-600">
                <span className="font-semibold text-red-600">
                  {divisionStats.teamsWithoutDesign}
                </span>{" "}
                pending design
              </span>
            </div>
            <span className="hidden sm:inline text-gray-300">•</span>
            <div className="flex items-center gap-2">
              <Shirt className="text-purple-600" size={16} />
              <span className="text-gray-600">
                <span className="font-semibold text-purple-600">
                  {divisionStats.completeTeams}
                </span>{" "}
                ready to order
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
