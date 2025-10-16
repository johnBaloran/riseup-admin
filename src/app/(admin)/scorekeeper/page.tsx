// src/app/scorekeeper/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Scorekeeper overview page ONLY
 *
 * Shows all games from active/register divisions
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  PlayCircle,
  CheckCircle2,
  Filter,
  Trophy,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { formatTime } from "@/lib/utils/time";

interface OverviewData {
  divisions: Array<{
    _id: string;
    divisionName: string;
    day: string;
    startTime?: string;
    endTime?: string;
    location?: { _id: string; name: string; address: string };
    city?: { _id: string; cityName: string };
    games: Array<{
      _id: string;
      date: string;
      time: string;
      homeTeam: { _id: string; teamName: string; teamNameShort: string };
      awayTeam: { _id: string; teamName: string; teamNameShort: string };
      homeTeamScore: number;
      awayTeamScore: number;
      status: boolean;
      started: boolean;
    }>;
  }>;
  stats: {
    totalDivisions: number;
    totalGames: number;
    upcomingGames: number;
    completedGames: number;
  };
}

export default function ScorekeeperOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [divisionFilter, setDivisionFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  useEffect(() => {
    fetchOverview();
  }, [locationFilter, divisionFilter, dateFilter]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (locationFilter && locationFilter !== "all") {
        params.append("locationId", locationFilter);
      }
      if (divisionFilter && divisionFilter !== "all") {
        params.append("divisionId", divisionFilter);
      }
      if (dateFilter) {
        params.append("date", dateFilter);
      }

      const response = await fetch(`/api/v1/scorekeeper/overview?${params}`);
      if (!response.ok) throw new Error("Failed to fetch overview");

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching scorekeeper overview:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique locations for filter
  const locations =
    data?.divisions
      .map((d) => d.location)
      .filter(
        (l, idx, arr) => l && arr.findIndex((x) => x?._id === l._id) === idx
      ) || [];

  // Get all divisions for filter
  const allDivisions = data?.divisions || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Scorekeeper</h1>
        <p className="text-gray-600 mt-1">
          Manage game scoring for all active divisions
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Active Divisions"
            value={data?.stats.totalDivisions || 0}
            icon={<Users className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Total Games"
            value={data?.stats.totalGames || 0}
            icon={<Trophy className="h-5 w-5" />}
            color="purple"
          />
          <StatCard
            title="Upcoming"
            value={data?.stats.upcomingGames || 0}
            icon={<PlayCircle className="h-5 w-5" />}
            color="orange"
          />
          <StatCard
            title="Completed"
            value={data?.stats.completedGames || 0}
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="green"
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc!._id} value={loc!._id}>
                      {loc!.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Division Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Division
              </label>
              <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Divisions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Divisions</SelectItem>
                  {allDivisions.map((div) => (
                    <SelectItem key={div._id} value={div._id}>
                      {div.divisionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Reset Button */}
          {(locationFilter !== "all" ||
            divisionFilter !== "all" ||
            dateFilter) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLocationFilter("all");
                  setDivisionFilter("all");
                  setDateFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Divisions & Games */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : data?.divisions.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              <Trophy className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg font-medium">No games found</p>
              <p className="text-sm mt-1">
                {dateFilter
                  ? "No games scheduled for the selected date"
                  : "No games scheduled in active divisions"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {data?.divisions.map((division) => (
            <DivisionSection key={division._id} division={division} />
          ))}
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "purple" | "orange" | "green";
}) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
    green: "text-green-600 bg-green-50",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Division Section Component
function DivisionSection({
  division,
}: {
  division: OverviewData["divisions"][0];
}) {
  const hasGames = division.games.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{division.divisionName}</CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {division.day}
              </div>
              {division.startTime && division.endTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(division.startTime)} -{" "}
                  {formatTime(division.endTime)}
                </div>
              )}
              {division.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {division.location.name}
                </div>
              )}
            </div>
          </div>
          <Badge variant="secondary">{division.games.length} games</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!hasGames ? (
          <div className="text-center py-8 text-gray-500">
            <p>No games scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {division.games.map((game) => (
              <GameCard key={game._id} game={game} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Game Card Component
function GameCard({
  game,
}: {
  game: OverviewData["divisions"][0]["games"][0];
}) {
  const isCompleted = game.status;
  const isStarted = game.started;

  return (
    <Link href={`/scorekeeper/${game._id}`}>
      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(game.date), "MMM dd, yyyy")}
            </div>
            {game.time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(game.time)}
              </div>
            )}
          </div>
          <div>
            {isCompleted ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Final
              </Badge>
            ) : isStarted ? (
              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                In Progress
              </Badge>
            ) : (
              <Badge variant="outline">Scheduled</Badge>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {game.homeTeam.teamNameShort || game.homeTeam.teamName}
            </p>
            {(isCompleted || isStarted) && (
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {game.homeTeamScore}
              </p>
            )}
          </div>

          <div className="text-gray-400 font-bold">vs</div>

          <div className="text-left">
            <p className="font-semibold text-gray-900">
              {game.awayTeam.teamNameShort || game.awayTeam.teamName}
            </p>
            {(isCompleted || isStarted) && (
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {game.awayTeamScore}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t">
          <Button className="w-full" size="sm">
            {isCompleted ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                View Summary
              </>
            ) : isStarted ? (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Continue Scoring
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Scoring
              </>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
