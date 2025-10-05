// src/components/features/league/players/PlayersGrid.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display players in responsive card grid ONLY
 */

"use client";

import { Users } from "lucide-react";
import { PlayerCard } from "./PlayerCard";

interface PlayersGridProps {
  players: any[];
  cityId: string;
}

export function PlayersGrid({ players, cityId }: PlayersGridProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No players found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your filters or create a new player.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => (
        <PlayerCard key={player._id} player={player} cityId={cityId} />
      ))}
    </div>
  );
}
