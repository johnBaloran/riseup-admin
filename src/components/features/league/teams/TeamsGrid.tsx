// src/components/features/league/teams/TeamsGrid.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display teams in responsive card grid ONLY
 */

"use client";

import { Users } from "lucide-react";
import { TeamCard } from "./TeamCard";

interface TeamsGridProps {
  teams: any[];
}

export function TeamsGrid({ teams }: TeamsGridProps) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No teams found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your filters or create a new team.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <TeamCard key={team._id} team={team} />
      ))}
    </div>
  );
}
