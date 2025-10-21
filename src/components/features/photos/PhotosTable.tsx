// src/components/features/photos/PhotosTable.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display games with photo status and filters ONLY
 */

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Upload, Image, CheckCircle2, AlertCircle } from "lucide-react";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

interface Game {
  _id: string;
  gameName: string;
  date: Date;
  week: number;
  gamePhotosCount: number;
  homeTeam: { teamName: string; teamCode: string };
  awayTeam: { teamName: string; teamCode: string };
  division: {
    divisionName: string;
    day: string;
  };
}

interface DivisionGroup {
  division: {
    _id: any;
    divisionName: string;
    day: string;
    city: any;
    location: any;
    level: any;
  };
  games: any[];
}

interface City {
  _id: string;
  cityName: string;
}

interface Location {
  _id: string;
  name: string;
}

interface Level {
  _id: string;
  name: string;
}

interface PhotosTableProps {
  games: DivisionGroup[];
  cities: City[];
  locations: Location[];
  levels: Level[];
  filters: {
    cityId?: string;
    locationId?: string;
    photoStatus?: string;
    day?: string;
    levelId?: string;
  };
}

export function PhotosTable({
  games,
  cities,
  locations,
  levels,
  filters,
}: PhotosTableProps) {
  const router = useRouter();

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const newFilters = { ...filters, ...updates };

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    return queryString ? `/photos?${queryString}` : "/photos";
  };

  const handleFilterChange = (key: string, value: string) => {
    router.push(buildUrl({ [key]: value === "all" ? undefined : value }));
  };

  // Count stats
  const totalGames = games.reduce((sum, group) => sum + group.games.length, 0);
  const gamesWithPhotos = games.reduce(
    (sum, group) =>
      sum + group.games.filter((g) => g.gamePhotosCount > 0).length,
    0
  );
  const gamesNeedingPhotos = totalGames - gamesWithPhotos;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Games</p>
              <p className="text-2xl font-bold">{totalGames}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Photos Uploaded</p>
              <p className="text-2xl font-bold text-green-600">
                {gamesWithPhotos}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Needs Photos</p>
              <p className="text-2xl font-bold text-red-600">
                {gamesNeedingPhotos}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* City Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">City</label>
            <Select
              value={filters.cityId || "all"}
              onValueChange={(value) => handleFilterChange("cityId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city._id} value={city._id}>
                    {city.cityName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Select
              value={filters.locationId || "all"}
              onValueChange={(value) =>
                handleFilterChange("locationId", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location._id} value={location._id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Level</label>
            <Select
              value={filters.levelId || "all"}
              onValueChange={(value) => handleFilterChange("levelId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level._id} value={level._id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Day Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Day</label>
            <Select
              value={filters.day || "all"}
              onValueChange={(value) => handleFilterChange("day", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {DAYS.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Photo Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Photo Status
            </label>
            <Select
              value={filters.photoStatus || "all"}
              onValueChange={(value) =>
                handleFilterChange("photoStatus", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Games" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="hasPhotos">Photos Uploaded</SelectItem>
                <SelectItem value="needsPhotos">Needs Photos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Games by Division */}
      {games.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No games found</p>
            <p className="text-sm mt-1">
              Try adjusting your filters to see more games
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {games.map((group) => (
            <Card key={group.division._id} className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold">
                  {group.division.divisionName}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                  <Badge variant="outline">{group.division.city.cityName}</Badge>
                  <Badge variant="outline">{group.division.location.name}</Badge>
                  <Badge variant="outline">{group.division.level.name}</Badge>
                  <Badge variant="outline">
                    {group.division.day.charAt(0).toUpperCase() +
                      group.division.day.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.games.map((game) => (
                  <Card
                    key={game._id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className="text-xs">
                          Week {game.week}
                        </Badge>
                        {game.gamePhotosCount > 0 ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {game.gamePhotosCount} photos
                          </Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-700 border-red-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Needs photos
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm">
                          {game.gameName}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(game.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <Button asChild className="w-full" size="sm">
                        <Link href={`/photos/${game._id}`}>
                          <Upload className="w-4 h-4 mr-2" />
                          {game.gamePhotosCount > 0
                            ? "Manage Photos"
                            : "Upload Photos"}
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
