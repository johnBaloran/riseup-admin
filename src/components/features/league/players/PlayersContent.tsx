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
import { Search } from "lucide-react";
import { PlayersGrid } from "./PlayersGrid";
import { Pagination } from "@/components/common/Pagination";
import { debounce } from "lodash";

interface PlayersContentProps {
  players: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  divisions: any[];
  cityId: string;
  currentFilters: {
    payment?: string;
    division?: string;
    team?: string;
    freeAgents?: boolean;
    hasUser?: boolean;
    search?: string;
  };
}

export function PlayersContent({
  players,
  pagination,
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

    router.push(`/admin/${cityId}/league/players?${params.toString()}`);
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

  console.log("players:", players);

  return (
    <div className="space-y-6">
      {/* Payment Status Tabs */}
      <Tabs
        value={currentFilters.payment || "all"}
        onValueChange={(value) => updateFilters({ payment: value })}
      >
        <TabsList>
          <TabsTrigger value="all">All Players</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="in_progress">Installments</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
        </TabsList>
      </Tabs>

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
              {divisions.map((division: any) => (
                <SelectItem key={division._id} value={division._id}>
                  {division.divisionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      </div>

      {/* Players Grid */}
      <PlayersGrid players={players} cityId={cityId} />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={(page) => updateFilters({ page: page.toString() })}
      />
    </div>
  );
}
