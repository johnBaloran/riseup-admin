// src/components/features/payments/PaymentDashboard.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Payment dashboard orchestration with filters ONLY
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter, X } from "lucide-react";
import { PaymentsList } from "./PaymentsList";

interface PaymentDashboardProps {
  players: any[];
  locations: any[];
  divisions: any[];
  cityId: string;
  currentFilters: {
    location?: string;
    division?: string;
    team?: string;
    payment?: string;
    search?: string;
  };
}

export function PaymentDashboard({
  players,
  locations,
  divisions,
  cityId,
  currentFilters,
}: PaymentDashboardProps) {
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

    router.push(`/admin/${cityId}/payments?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(`/admin/${cityId}/payments`);
    setSearchValue("");
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateFilters({ search: value || undefined });
  };

  const getFilteredDivisions = () => {
    if (!currentFilters.location) return divisions;
    return divisions.filter((d: any) => d.location._id === currentFilters.location);
  };

  const hasActiveFilters =
    currentFilters.location ||
    currentFilters.division ||
    currentFilters.team ||
    currentFilters.payment !== "all" ||
    currentFilters.search;

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Row 1: Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Location
              </label>
              <Select
                value={currentFilters.location || "all"}
                onValueChange={(value) => {
                  updateFilters({
                    location: value === "all" ? undefined : value,
                    division: undefined,
                    team: undefined,
                  });
                }}
              >
                <SelectTrigger>
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

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Division
              </label>
              <Select
                value={currentFilters.division || "all"}
                onValueChange={(value) => {
                  updateFilters({
                    division: value === "all" ? undefined : value,
                    team: undefined,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Divisions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Divisions</SelectItem>
                  {getFilteredDivisions().map((division: any) => (
                    <SelectItem key={division._id} value={division._id}>
                      {division.location?.name} - {division.divisionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Payment Status
              </label>
              <Select
                value={currentFilters.payment || "all"}
                onValueChange={(value) => updateFilters({ payment: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="on-track">On Track (Installments)</SelectItem>
                  <SelectItem value="has-issues">Has Issues</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="paid">Fully Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

          {/* Row 2: Search and Export */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search players..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
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
      </div>

      {/* Players List */}
      <PaymentsList players={players} cityId={cityId} />
    </div>
  );
}