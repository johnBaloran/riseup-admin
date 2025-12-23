// src/components/features/league/divisions/DivisionStandingsSection.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Division standings display ONLY
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { LeanTeam } from "@/types/team";

interface DivisionStandingsSectionProps {
  teams: LeanTeam[];
}

export function DivisionStandingsSection({
  teams,
}: DivisionStandingsSectionProps) {
  // Sort teams by wins (descending), then by point differential (descending)
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return b.pointDifference - a.pointDifference;
  });

  if (teams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Standings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No teams in this division yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Standings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Rank
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Team
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                  W
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                  L
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                  PD
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => (
                <tr
                  key={team._id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/league/teams/${team._id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {team.teamName}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {team.teamNameShort} ({team.teamCode})
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-green-600">
                    {team.wins}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-red-600">
                    {team.losses}
                  </td>
                  <td
                    className={`py-3 px-4 text-center font-semibold ${
                      team.pointDifference > 0
                        ? "text-green-600"
                        : team.pointDifference < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {team.pointDifference > 0 ? "+" : ""}
                    {team.pointDifference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
