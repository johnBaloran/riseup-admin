// src/components/features/league/teams/TeamsContent.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team list orchestration with tabs, filters, and view modes
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, LayoutGrid, List, X, Filter } from "lucide-react";
import { TeamsGrid } from "./TeamsGrid";
import { TeamsList } from "./TeamsList";
import { Pagination } from "@/components/common/Pagination";
import { debounce } from "lodash";

interface TeamsContentProps {
  teams: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  divisions: any[];
  locations: any[];
  currentTab: "active" | "inactive" | "all";
  currentView: "card" | "list";
  currentFilters: {
    division?: string;
    location?: string;
    search?: string;
    noCaptain?: boolean;
    noPlayers?: boolean;
  };
}

export function TeamsContent({
  teams,
  pagination,
  divisions,
  locations,
  currentTab,
  currentView,
  currentFilters,
}: TeamsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentFilters.search || "");

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    if (!updates.page) {
      params.set("page", "1");
    }

    // Use replace instead of push to avoid adding filter changes to browser history
    router.replace(`/admin/league/teams?${params.toString()}`);
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

  const handleViewChange = (view: "card" | "list") => {
    updateFilters({ view });
  };

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
    // Use replace to avoid adding to browser history
    router.replace(`/admin/league/teams?tab=${currentTab}&view=${currentView}`);
    setSearchValue("");
  };

  const hasActiveFilters =
    currentFilters.location ||
    currentFilters.division ||
    currentFilters.search ||
    currentFilters.noCaptain ||
    currentFilters.noPlayers;

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

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teams..."
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
              <SelectValue placeholder="Active Divisions" />
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

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="noCaptain"
                checked={currentFilters.noCaptain}
                onCheckedChange={(checked) =>
                  updateFilters({ noCaptain: checked ? "true" : undefined })
                }
              />
              <Label htmlFor="noCaptain" className="text-sm cursor-pointer">
                No captain assigned
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="noPlayers"
                checked={currentFilters.noPlayers}
                onCheckedChange={(checked) =>
                  updateFilters({ noPlayers: checked ? "true" : undefined })
                }
              />
              <Label htmlFor="noPlayers" className="text-sm cursor-pointer">
                No players
              </Label>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={currentView === "card" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewChange("card")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={currentView === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
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
              {currentFilters.noCaptain && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  <Filter className="h-3 w-3" />
                  No Captain
                </span>
              )}
              {currentFilters.noPlayers && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  <Filter className="h-3 w-3" />
                  No Players
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

      {/* Teams Display */}
      {currentView === "card" ? (
        <TeamsGrid teams={teams} />
      ) : (
        <TeamsList teams={teams} />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={(page) => updateFilters({ page: page.toString() })}
        />
      )}
    </div>
  );
}
