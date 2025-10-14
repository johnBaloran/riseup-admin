// src/components/features/league/teams/TeamGameHistory.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display game history for a team
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Trophy } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { formatTime } from "@/lib/utils/time";

interface TeamGameHistoryProps {
  games: any[];
  teamId: string;
}

export function TeamGameHistory({ games, teamId }: TeamGameHistoryProps) {
  // Split games into past and upcoming
  const pastGames = games.filter((game) => game.status === true);
  const upcomingGames = games.filter((game) => game.status === false);

  const getGameResult = (game: any) => {
    const isHomeTeam = game.homeTeam._id === teamId;
    const teamScore = isHomeTeam ? game.homeTeamScore : game.awayTeamScore;
    const opponentScore = isHomeTeam ? game.awayTeamScore : game.homeTeamScore;

    if (!game.status) return null; // Not finished yet

    if (teamScore > opponentScore) {
      return { result: "W", color: "green" };
    } else if (teamScore < opponentScore) {
      return { result: "L", color: "red" };
    } else {
      return { result: "T", color: "gray" };
    }
  };

  const getStatusBadge = (game: any) => {
    if (game.status === true) {
      // Game finished
      const result = getGameResult(game);
      if (!result) return null;

      const colorClasses = {
        green: "bg-green-50 text-green-700 border-green-200",
        red: "bg-red-50 text-red-700 border-red-200",
        gray: "bg-gray-50 text-gray-700 border-gray-200",
      };

      return (
        <Badge variant="outline" className={colorClasses[result.color]}>
          {result.result}
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-gray-50 text-gray-700 border-gray-200"
      >
        Scheduled
      </Badge>
    );
  };

  const getOpponent = (game: any) => {
    const isHomeTeam = game.homeTeam._id === teamId;
    return isHomeTeam ? game.awayTeam : game.homeTeam;
  };

  const getScore = (game: any) => {
    if (!game.status) return null; // Not finished yet

    const isHomeTeam = game.homeTeam._id === teamId;
    const teamScore = isHomeTeam ? game.homeTeamScore : game.awayTeamScore;
    const opponentScore = isHomeTeam ? game.awayTeamScore : game.homeTeamScore;

    return `${teamScore} - ${opponentScore}`;
  };

  const renderGameCard = (game: any) => {
    const opponent = getOpponent(game);
    const score = getScore(game);
    const isHomeTeam = game.homeTeam._id === teamId;

    return (
      <Link key={game._id} href={`/admin/games/${game._id}`} className="block">
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
              {getStatusBadge(game)}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">vs</p>
              <p className="font-medium text-gray-900">
                {opponent?.teamName || "TBD"}
              </p>
              {game.division?.divisionName && (
                <p className="text-xs text-gray-500 mt-1">
                  {game.division.divisionName}
                </p>
              )}
            </div>
            {score && (
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{score}</p>
              </div>
            )}
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
    <div className="space-y-6">
      {/* Upcoming Games */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Games ({upcomingGames.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingGames.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                No upcoming games scheduled
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingGames.slice(0, 5).map(renderGameCard)}
              {upcomingGames.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/games?team=${teamId}`}>
                      View All {upcomingGames.length} Upcoming Games
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Games */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Past Games ({pastGames.length})
            </CardTitle>
            {pastGames.length > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/games?team=${teamId}`}>View All Games</Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pastGames.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No games played yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastGames.slice(0, 5).map(renderGameCard)}
              {pastGames.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/games?team=${teamId}`}>
                      View All {pastGames.length} Past Games
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
