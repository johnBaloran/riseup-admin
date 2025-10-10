// src/components/features/league/divisions/DivisionsContent.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Division list orchestration with tabs and filters
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
import { Search } from "lucide-react";
import { DivisionsGrid } from "./DivisionsGrid";
import { Pagination } from "@/components/common/Pagination";
import { PopulatedDivision } from "@/types/division";
import { LeanLocation } from "@/types/location";
import { LeanLevel } from "@/types/level";

interface DivisionsContentProps {
  divisions: PopulatedDivision[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  locations: LeanLocation[];
  levels: LeanLevel[];
  currentTab: string;
  currentFilters: {
    location?: string;
    level?: string;
    day?: string;
    search?: string;
  };
}

export function DivisionsContent({
  divisions,
  pagination,
  locations,
  levels,
  currentTab,
  currentFilters,
}: DivisionsContentProps) {
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
    params.set("page", "1");

    router.push(`/admin/league/divisions?${params.toString()}`);
  };

  const handleTabChange = (tab: string) => {
    updateFilters({ tab });
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateFilters({ search: value || undefined });
  };
  console.log("locations", locations);
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All Divisions</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="registration">Registration Open</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search divisions..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

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
            {locations.map((location) => (
              <SelectItem key={location._id} value={location._id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentFilters.level || "all"}
          onValueChange={(value) =>
            updateFilters({ level: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
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
          value={currentFilters.day || "all"}
          onValueChange={(value) =>
            updateFilters({ day: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Days</SelectItem>
            <SelectItem value="Monday">Monday</SelectItem>
            <SelectItem value="Tuesday">Tuesday</SelectItem>
            <SelectItem value="Wednesday">Wednesday</SelectItem>
            <SelectItem value="Thursday">Thursday</SelectItem>
            <SelectItem value="Friday">Friday</SelectItem>
            <SelectItem value="Saturday">Saturday</SelectItem>
            <SelectItem value="Sunday">Sunday</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Division Cards Grid */}
      <DivisionsGrid divisions={divisions} />

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
