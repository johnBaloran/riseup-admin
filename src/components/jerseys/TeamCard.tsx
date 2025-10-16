// src/components/jerseys/TeamCard.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display single team card ONLY
 */

"use client";

import { useRouter } from "next/navigation";
import {
  Image,
  Shirt,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeamWithJerseyInfo } from "@/types/jersey";

interface TeamCardProps {
  team: TeamWithJerseyInfo;
}

export default function TeamCard({ team }: TeamCardProps) {
  const router = useRouter();

  const playersWithDetails = team.players.filter(
    (p) => p.jerseyNumber != null && p.jerseySize != null
  );
  const totalPlayers = team.players.length;
  const readyCount = playersWithDetails.length;

  const hasJerseyDesign = team.isCustomJersey || team.jerseyEdition;

  const getJerseyTypeBadge = () => {
    if (team.isCustomJersey) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
          <Image size={12} />
          Custom
        </span>
      );
    }

    if (team.jerseyEdition) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          <Shirt size={12} />
          {team.jerseyEdition}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
        <AlertCircle size={12} />
        No Design
      </span>
    );
  };

  const handleViewTeam = () => {
    router.push(`/jerseys/${team._id}`);
  };

  return (
    <Card className="hover:border-gray-300 hover:shadow-md transition-all">
      <CardContent className="p-4">
        {/* Team Header */}
        <div className="mb-3">
          {team.jerseyEdition ? (
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: team.primaryColor || "#999" }}
              />
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow -ml-3"
                style={{ backgroundColor: team.secondaryColor || "#666" }}
              />
              <h3 className="font-semibold text-gray-900 ml-1 truncate">
                {team.teamName}
              </h3>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {team.isCustomJersey ? (
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <Image size={16} className="text-gray-500" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={16} className="text-red-500" />
                </div>
              )}
              <h3 className="font-semibold text-gray-900 truncate">
                {team.teamName}
              </h3>
            </div>
          )}
        </div>

        {/* Jersey Type Badge */}
        <div className="mb-3">{getJerseyTypeBadge()}</div>

        {/* Player Count */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Users size={16} />
          <span>
            {readyCount}/{totalPlayers} players ready
          </span>
        </div>

        {/* Status */}
        {hasJerseyDesign && readyCount === totalPlayers && totalPlayers > 0 ? (
          <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded mb-3 flex items-center gap-2">
            <CheckCircle size={16} />
            Team Ready
          </div>
        ) : (
          <div className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded mb-3 flex items-center gap-2">
            <Clock size={16} />
            Incomplete
          </div>
        )}

        {/* Actions */}
        <Button onClick={handleViewTeam} className="w-full">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
