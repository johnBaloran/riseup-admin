// src/components/features/league/divisions/DivisionScheduleSection.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display schedule/games in a division
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { formatTime } from "@/lib/utils/time";

interface DivisionScheduleSectionProps {
  games: any[];
  divisionId: string;
}

export function DivisionScheduleSection({
  games,
  divisionId,
}: DivisionScheduleSectionProps) {
  // Group games by week
  const gamesByWeek = games.reduce((acc: any, game: any) => {
    const week = game.week || 1;
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(game);
    return acc;
  }, {});

  const weeks = Object.keys(gamesByWeek).sort((a, b) => Number(a) - Number(b));

  const getStatusBadge = (game: any) => {
    if (game.status === "completed") {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Final
        </Badge>
      );
    }
    if (game.status === "in_progress") {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Live
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule ({games.length} game{games.length !== 1 ? "s" : ""})
          </CardTitle>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/admin/games/${divisionId}`}>
              View Full Schedule
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {games.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              No games scheduled
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Games will appear here once they are scheduled
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href={`/admin/games/${divisionId}`}>
                Go to Schedule
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {weeks.slice(0, 4).map((week) => (
              <div key={week}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Week {week}
                  {gamesByWeek[week][0]?.weekType && (
                    <span className="ml-2 text-gray-500 font-normal">
                      ({gamesByWeek[week][0].weekType})
                    </span>
                  )}
                </h3>
                <div className="space-y-3">
                  {gamesByWeek[week].map((game: any) => (
                    <Link
                      key={game._id}
                      href={`/admin/games/${game._id}`}
                      className="block"
                    >
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
                          {getStatusBadge(game)}
                        </div>

                        {/* Teams */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {game.homeTeam?.teamName || "TBD"}
                              </span>
                            </div>
                            {game.status === "completed" && (
                              <span className="text-lg font-bold text-gray-900">
                                {game.homeScore ?? "-"}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {game.awayTeam?.teamName || "TBD"}
                              </span>
                            </div>
                            {game.status === "completed" && (
                              <span className="text-lg font-bold text-gray-900">
                                {game.awayScore ?? "-"}
                              </span>
                            )}
                          </div>
                        </div>

                        {game.court && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                            <MapPin className="h-4 w-4" />
                            <span>Court {game.court}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {weeks.length > 4 && (
              <div className="text-center pt-4">
                <Button variant="outline" asChild>
                  <Link href={`/admin/games/${divisionId}`}>
                    View All {games.length} Games
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
