// src/components/features/league/teams/TeamUpcomingGames.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display upcoming games for a team
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { formatTime } from "@/lib/utils/time";

interface TeamUpcomingGamesProps {
  games: any[];
  divisionId: string;
  teamId: string;
}

export function TeamUpcomingGames({
  games,
  divisionId,
  teamId,
}: TeamUpcomingGamesProps) {
  // Filter for upcoming games only
  const upcomingGames = games.filter((game) => game.status === false);

  const renderGameCard = (game: any) => {
    const isHomeTeam = game.homeTeam?._id === teamId;
    const opponent = isHomeTeam ? game.awayTeam : game.homeTeam;

    return (
      <Link key={game._id} href={`/games/${game._id}`} className="block">
        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {game.date
                  ? format(new Date(game.date), "MMM dd, yyyy")
                  : "Date TBD"}
              </span>
              {game.time && (
                <>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{formatTime(game.time)}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {game.week && (
                <Badge variant="outline" className="text-xs">
                  Week {game.week}
                </Badge>
              )}
              {isHomeTeam && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                >
                  Home
                </Badge>
              )}
            </div>
          </div>

          {/* Opponent */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500">
              {isHomeTeam ? "vs" : "@"}
            </p>
            <p className="font-medium text-gray-900">
              {opponent?.teamName || "TBD"}
            </p>
          </div>

          {game.court && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-3 pt-3 border-t">
              <MapPin className="h-4 w-4" />
              <span>Court {game.court}</span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Games ({upcomingGames.length})
          </CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href={`/games/${divisionId}`}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Manage Schedule
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingGames.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              No upcoming games yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Create a schedule for this team's division
            </p>
            <Button asChild className="mt-4">
              <Link href={`/games/${divisionId}`}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                Create Schedule
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingGames.slice(0, 5).map(renderGameCard)}
            {upcomingGames.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/games/${divisionId}`}>
                    View All {upcomingGames.length} Games
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
