// src/components/features/league/teams/TeamsList.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display teams in list/table view ONLY
 */

"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle, ExternalLink } from "lucide-react";

interface TeamsListProps {
  teams: any[];
}

export function TeamsList({ teams }: TeamsListProps) {
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Division
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Record
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Players
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Captain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teams.map((team) => (
              <tr key={team._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900">
                      {team.teamName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {team.teamNameShort}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {team.teamCode}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {team.division?.city?.cityName || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {team.division?.location?.name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {team.division?.divisionName || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="font-medium">
                    {team.wins}-{team.losses}
                  </span>
                  <span className="text-gray-500 ml-1">
                    ({team.pointDifference > 0 ? "+" : ""}
                    {team.pointDifference})
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {team.players?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {team.teamCaptain ? (
                    <span className="text-gray-900">
                      {team.teamCaptain.playerName}
                    </span>
                  ) : team.players?.length > 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 border-yellow-200"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      No Captain
                    </Badge>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {team.paymentStatus === "paid" ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      Paid
                    </Badge>
                  ) : team.paymentStatus === "unpaid" ? (
                    <Badge
                      variant="outline"
                      className="bg-red-100 text-red-800 border-red-200"
                    >
                      Unpaid
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-800 border-gray-200"
                    >
                      No Players
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/league/teams/${team._id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
