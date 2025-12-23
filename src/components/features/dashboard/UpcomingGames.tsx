// src/components/features/dashboard/UpcomingGames.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display upcoming games ONLY
 */

"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { IGame } from "@/models/Game";

interface UpcomingGamesProps {
  games: IGame[];
}

export function UpcomingGames({ games }: UpcomingGamesProps) {
  if (games.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Games</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Calendar}
            title="No upcoming games"
            description="There are no scheduled games at the moment"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Games</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {games.map((game) => (
            <Link
              key={game._id}
              href={`/games/${game._id}`}
              className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* <div className="font-medium">
                {game.homeTeam.teamName} vs {game.awayTeam.teamName}
              </div> */}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>{format(new Date(game.date), "MMM dd, yyyy")}</span>
                <span>{format(new Date(game.date), "h:mm a")}</span>
                <Badge variant="outline">Upcoming</Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
