// src/components/features/league/teams/TeamsContent.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team list orchestration with tabs, filters, and view modes
 */

"use client";

import { useState } from "react";
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
import { Search, LayoutGrid, List } from "lucide-react";
import { TeamsGrid } from "./TeamsGrid";
import { TeamsList } from "./TeamsList";
import { Pagination } from "@/components/common/Pagination";

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

    router.push(`/admin/league/teams?${params.toString()}`);
  };

  const handleTabChange = (tab: string) => {
    updateFilters({ tab });
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateFilters({ search: value || undefined });
  };

  const handleViewChange = (view: "card" | "list") => {
    updateFilters({ view });
  };

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

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
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

          <Select
            value={currentFilters.location || "all"}
            onValueChange={(value) =>
              updateFilters({ location: value === "all" ? undefined : value })
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
