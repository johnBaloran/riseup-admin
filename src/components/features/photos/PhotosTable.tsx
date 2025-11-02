// src/components/features/photos/PhotosTable.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display games with photo status and filters ONLY
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Upload,
  Image,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Filter,
} from "lucide-react";

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
    city: {
      cityName: string;
    };
    location: {
      name: string;
    };
    level: {
      name: string;
    };
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

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalGames: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PhotosTableProps {
  games: DivisionGroup[];
  cities: City[];
  locations: Location[];
  levels: Level[];
  pagination: Pagination;
  filters: {
    cityId?: string;
    locationId?: string;
    photoStatus?: string;
    day?: string;
    levelId?: string;
    activeOnly?: string;
    search?: string;
  };
}

export function PhotosTable({
  games,
  cities,
  locations,
  levels,
  pagination,
  filters,
}: PhotosTableProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(filters.search || "");

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const newFilters = { ...filters, ...updates };

    Object.entries(newFilters).forEach(([key, value]) => {
      // Skip default values and empty values
      if (!value || value === "all") return;
      if (key === "activeOnly" && value === "active") return; // Skip default "active"

      params.set(key, value);
    });

    const queryString = params.toString();
    return queryString ? `/photos?${queryString}` : "/photos";
  };

  const handleFilterChange = (key: string, value: string) => {
    // Reset to page 1 when changing filters
    router.push(buildUrl({ [key]: value === "all" ? undefined : value, page: "1" }));
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ page: page.toString() }));
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        router.push(buildUrl({ search: searchValue || undefined, page: "1" }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const clearAllFilters = () => {
    setSearchValue("");
    router.push("/photos");
  };

  const hasActiveFilters =
    filters.search ||
    filters.cityId ||
    filters.locationId ||
    filters.levelId ||
    filters.day ||
    filters.photoStatus !== "all" ||
    (filters.activeOnly && filters.activeOnly !== "active");

  // Count stats from current page
  const pageGamesCount = games.reduce((sum, group) => sum + group.games.length, 0);
  const pageGamesWithPhotos = games.reduce(
    (sum, group) =>
      sum + group.games.filter((g) => g.gamePhotosCount > 0).length,
    0
  );
  const pageGamesNeedingPhotos = pageGamesCount - pageGamesWithPhotos;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Games</p>
              <p className="text-2xl font-bold">{pagination.totalGames}</p>
              <p className="text-xs text-gray-500 mt-1">
                Showing {pageGamesCount} on this page
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Photos Uploaded</p>
              <p className="text-2xl font-bold text-green-600">
                {pageGamesWithPhotos}
              </p>
              <p className="text-xs text-gray-500 mt-1">On this page</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Needs Photos</p>
              <p className="text-2xl font-bold text-red-600">
                {pageGamesNeedingPhotos}
              </p>
              <p className="text-xs text-gray-500 mt-1">On this page</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          {/* Division Status Tabs */}
          <div>
            <Tabs
              value={filters.activeOnly || "active"}
              onValueChange={(value) => handleFilterChange("activeOnly", value)}
            >
              <TabsList>
                <TabsTrigger value="all">All Divisions</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* First row: Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search games..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.cityId || "all"}
              onValueChange={(value) => handleFilterChange("cityId", value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
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

            <Select
              value={filters.locationId || "all"}
              onValueChange={(value) => handleFilterChange("locationId", value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
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

            <Select
              value={filters.levelId || "all"}
              onValueChange={(value) => handleFilterChange("levelId", value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
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

            <Select
              value={filters.day || "all"}
              onValueChange={(value) => handleFilterChange("day", value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
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

            <Select
              value={filters.photoStatus || "all"}
              onValueChange={(value) =>
                handleFilterChange("photoStatus", value)
              }
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Photo Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="hasPhotos">Photos Uploaded</SelectItem>
                <SelectItem value="needsPhotos">Needs Photos</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-sm text-gray-500">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    <Search className="h-3 w-3" />
                    {filters.search}
                  </span>
                )}
                {filters.cityId && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    <Filter className="h-3 w-3" />
                    City
                  </span>
                )}
                {filters.locationId && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    <Filter className="h-3 w-3" />
                    Location
                  </span>
                )}
                {filters.levelId && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    <Filter className="h-3 w-3" />
                    Level
                  </span>
                )}
                {filters.day && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    <Filter className="h-3 w-3" />
                    {filters.day.charAt(0).toUpperCase() + filters.day.slice(1)}
                  </span>
                )}
                {filters.photoStatus && filters.photoStatus !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    <Filter className="h-3 w-3" />
                    {filters.photoStatus === "hasPhotos"
                      ? "Photos Uploaded"
                      : "Needs Photos"}
                  </span>
                )}
                {filters.activeOnly && filters.activeOnly !== "active" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    <Filter className="h-3 w-3" />
                    {filters.activeOnly === "all"
                      ? "All Divisions"
                      : "Inactive Divisions"}
                  </span>
                )}
              </div>
            </div>
          )}
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
                  <Badge variant="outline">
                    {group.division.city.cityName}
                  </Badge>
                  <Badge variant="outline">
                    {group.division.location.name}
                  </Badge>
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
              <span className="ml-2">
                ({pagination.totalGames} total games)
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
