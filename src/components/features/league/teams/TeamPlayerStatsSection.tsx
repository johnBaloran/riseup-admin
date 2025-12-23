// src/components/features/league/teams/TeamPlayerStatsSection.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team player stats display ONLY
 */

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

type SortField =
  | "playerName"
  | "jerseyNumber"
  | "gamesPlayed"
  | "ppg"
  | "rpg"
  | "apg"
  | "bpg"
  | "spg";
type SortDirection = "asc" | "desc";

interface PlayerWithStats {
  _id: string;
  playerName: string;
  jerseyNumber?: number;
  averageStats: {
    points: number;
    rebounds: number;
    assists: number;
    blocks: number;
    steals: number;
    threesMade: number;
    twosMade: number;
    freeThrowsMade: number;
  };
  gamesPlayed: number;
}

interface TeamPlayerStatsSectionProps {
  players: PlayerWithStats[];
}

export function TeamPlayerStatsSection({
  players,
}: TeamPlayerStatsSectionProps) {
  const [sortField, setSortField] = useState<SortField>("ppg");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortField) {
        case "playerName":
          aValue = a.playerName;
          bValue = b.playerName;
          break;
        case "jerseyNumber":
          aValue = a.jerseyNumber || 0;
          bValue = b.jerseyNumber || 0;
          break;
        case "gamesPlayed":
          aValue = a.gamesPlayed;
          bValue = b.gamesPlayed;
          break;
        case "ppg":
          aValue = a.averageStats.points;
          bValue = b.averageStats.points;
          break;
        case "rpg":
          aValue = a.averageStats.rebounds;
          bValue = b.averageStats.rebounds;
          break;
        case "apg":
          aValue = a.averageStats.assists;
          bValue = b.averageStats.assists;
          break;
        case "bpg":
          aValue = a.averageStats.blocks;
          bValue = b.averageStats.blocks;
          break;
        case "spg":
          aValue = a.averageStats.steals;
          bValue = b.averageStats.steals;
          break;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [players, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <TrendingUp className="h-3 w-3 inline ml-1" />
    ) : (
      <TrendingDown className="h-3 w-3 inline ml-1" />
    );
  };

  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Player Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No players on this team yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Player Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("playerName")}
                >
                  Player <SortIcon field="playerName" />
                </th>
                <th
                  className="text-center py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("jerseyNumber")}
                >
                  # <SortIcon field="jerseyNumber" />
                </th>
                <th
                  className="text-center py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("gamesPlayed")}
                >
                  GP <SortIcon field="gamesPlayed" />
                </th>
                <th
                  className="text-center py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("ppg")}
                >
                  PPG <SortIcon field="ppg" />
                </th>
                <th
                  className="text-center py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("rpg")}
                >
                  RPG <SortIcon field="rpg" />
                </th>
                <th
                  className="text-center py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("apg")}
                >
                  APG <SortIcon field="apg" />
                </th>
                <th
                  className="text-center py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("bpg")}
                >
                  BPG <SortIcon field="bpg" />
                </th>
                <th
                  className="text-center py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("spg")}
                >
                  SPG <SortIcon field="spg" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player) => (
                <tr
                  key={player._id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={`/league/players/${player._id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {player.playerName}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    {player.jerseyNumber || "-"}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold">
                    {player.gamesPlayed}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-blue-600">
                    {player.averageStats.points.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-green-600">
                    {player.averageStats.rebounds.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-purple-600">
                    {player.averageStats.assists.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-orange-600">
                    {player.averageStats.blocks.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-red-600">
                    {player.averageStats.steals.toFixed(1)}
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
