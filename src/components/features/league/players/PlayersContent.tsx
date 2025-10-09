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
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  locations: any[];
  divisions: any[];
  cityId: string;
  currentFilters: {
    payment?: string;
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
  pagination,
  locations,
  divisions,
  cityId,
  currentFilters,
}: PlayersContentProps) {
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

    if (!updates.page) {
      params.set("page", "1");
    }

    router.push(`/admin/league/players?${params.toString()}`);
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

  const filteredDivisions = useMemo(() => {
    if (!currentFilters.location || currentFilters.location === "all") {
      return divisions;
    }
    return divisions.filter((d) => d.location?._id === currentFilters.location);
  }, [divisions, currentFilters.location]);

  const clearAllFilters = () => {
    router.push(`/admin/league/players`);
    setSearchValue("");
  };

  const hasActiveFilters =
    currentFilters.location ||
    currentFilters.division ||
    currentFilters.team ||
    currentFilters.payment !== "all" ||
    currentFilters.search;

  return (
    <div className="space-y-6">
      {/* Payment Status Tabs */}
      {/* <Tabs
        value={currentFilters.payment || "all"}
        onValueChange={(value) => updateFilters({ payment: value })}
      >
        <TabsList>
          <TabsTrigger value="all">All Players</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="in_progress">Installments</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
        </TabsList>
      </Tabs> */}

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
              {locations.map((location: any) => (
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
              {currentFilters.payment !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  <Filter className="h-3 w-3" />
                  {currentFilters.payment}
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
