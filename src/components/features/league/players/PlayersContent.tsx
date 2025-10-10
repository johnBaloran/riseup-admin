// src/components/features/league/players/PlayersContent.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player list orchestration with filters
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, Search, X } from "lucide-react";
import { PlayersGrid } from "./PlayersGrid";
import { Pagination } from "@/components/common/Pagination";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";

interface PlayersContentProps {
  players: any[];
  allPlayers: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  locations: any[];
  divisions: any[];
  cityId: string;
  currentTab: "active" | "inactive" | "all";
  currentFilters: {
    division?: string;
    location?: string;
    team?: string;
    freeAgents?: boolean;
    hasUser?: boolean;
    search?: string;
  };
}

export function PlayersContent({
  players,
  allPlayers,
  pagination,
  locations,
  divisions,
  cityId,
  currentTab,
  currentFilters,
}: PlayersContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentFilters.search || "");

  // Calculate overall stats (unfiltered)
  const stats = useMemo(() => {
    const total = allPlayers.length;
    const withTeam = allPlayers.filter((p) => p.team).length;
    const freeAgents = allPlayers.filter((p) => !p.team).length;
    const withAccount = allPlayers.filter((p) => p.user).length;
    const withoutAccount = allPlayers.filter((p) => !p.user).length;
    return { total, withTeam, freeAgents, withAccount, withoutAccount };
  }, [allPlayers]);

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    if (!updates.page) {
      params.set("page", "1");
    }

    router.push(`/admin/league/players?${params.toString()}`);
  };

  const handleTabChange = (tab: string) => {
    updateFilters({ tab });
  };

  // create a stable debounced version of updateFilters
  const debouncedUpdateFilters = useMemo(
    () =>
      debounce((value: string) => {
        updateFilters({ search: value || undefined });
      }, 500), // 500ms delay
    [searchParams] // dependencies
  );

  const handleSearch = (value: string) => {
    setSearchValue(value);
    debouncedUpdateFilters(value);
  };

  useEffect(() => {
    return () => {
      debouncedUpdateFilters.cancel();
    };
  }, [debouncedUpdateFilters]);

  // Sort locations by name
  const sortedLocations = useMemo(() => {
    return [...locations].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );
  }, [locations]);

  // Filter and sort divisions by location name
  const filteredDivisions = useMemo(() => {
    let filtered = divisions;
    if (currentFilters.location && currentFilters.location !== "all") {
      filtered = divisions.filter((d) => d.location?._id === currentFilters.location);
    }
    return filtered.sort((a, b) =>
      (a.location?.name || '').localeCompare(b.location?.name || '')
    );
  }, [divisions, currentFilters.location]);

  const clearAllFilters = () => {
    router.push(`/admin/league/players`);
    setSearchValue("");
  };

  const hasActiveFilters =
    currentFilters.location ||
    currentFilters.division ||
    currentFilters.team ||
    currentFilters.freeAgents ||
    currentFilters.hasUser !== undefined ||
    currentFilters.search;

  console.log("Paginated players (should be max 12):", players.length, players);
  console.log("All players for stats:", allPlayers.length);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Active Player Overview
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {stats.total} total players • {stats.withTeam} assigned to teams •{" "}
            {stats.freeAgents} free agents • {stats.withAccount} with user
            accounts • {stats.withoutAccount} without user accounts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search players..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={currentFilters.location || "all"}
            onValueChange={(value) =>
              updateFilters({
                location: value === "all" ? undefined : value,
                division: undefined,
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {sortedLocations.map((location: any) => (
                <SelectItem key={location._id} value={location._id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={currentFilters.division || "all"}
            onValueChange={(value) =>
              updateFilters({ division: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Divisions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {filteredDivisions.map((division: any) => (
                <SelectItem key={division._id} value={division._id}>
                  {division.location?.name} - {division.divisionName}
                </SelectItem>
              ))}
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

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="freeAgents"
              checked={currentFilters.freeAgents}
              onCheckedChange={(checked) =>
                updateFilters({ freeAgents: checked ? "true" : undefined })
              }
            />
            <Label htmlFor="freeAgents" className="text-sm cursor-pointer">
              Free agents only
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasUser"
              checked={currentFilters.hasUser}
              onCheckedChange={(checked) =>
                updateFilters({ hasUser: checked ? "true" : undefined })
              }
            />
            <Label htmlFor="hasUser" className="text-sm cursor-pointer">
              Has user account
            </Label>
          </div>
        </div>
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-sm text-gray-500">Active Filters:</span>
            <div className="flex flex-wrap gap-2">
              {currentFilters.location && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  <Filter className="h-3 w-3" />
                  Location
                </span>
              )}
              {currentFilters.division && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  <Filter className="h-3 w-3" />
                  Division
                </span>
              )}
              {currentFilters.freeAgents && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  <Filter className="h-3 w-3" />
                  Free Agents
                </span>
              )}
              {currentFilters.hasUser !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  <Filter className="h-3 w-3" />
                  {currentFilters.hasUser ? "Has Account" : "No Account"}
                </span>
              )}
              {currentFilters.search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  <Search className="h-3 w-3" />
                  {currentFilters.search}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Players Grid */}
      <PlayersGrid players={players} cityId={cityId} />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total} // or your total items variable
        limit={pagination.limit} // number of items per page
        onPageChange={(page) => updateFilters({ page: page.toString() })}
        label="players" // optional, "divisions", "teams", etc.
      />
    </div>
  );
}
