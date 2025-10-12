// src/components/games/TeamScheduleIndicator.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team schedule visualization ONLY
 *
 * Shows team codes with game counts
 */

"use client";

import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamScheduleCount {
  teamId: string;
  teamName: string;
  gameCount: number;
}

interface TeamScheduleIndicatorProps {
  teams: TeamScheduleCount[];
  className?: string;
}

export function TeamScheduleIndicator({
  teams,
  className,
}: TeamScheduleIndicatorProps) {
  return (
    <div
      className={cn(
        "bg-blue-50 rounded-lg p-4 border border-blue-100",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-medium text-blue-900">Team Schedule</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {teams.map((team) => (
          <div
            key={team.teamId}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium border",
              team.gameCount > 0
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-gray-100 text-gray-600 border-gray-200"
            )}
          >
            {team.teamName}
            {team.gameCount > 0 && (
              <span className="ml-1.5 text-xs">({team.gameCount})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
