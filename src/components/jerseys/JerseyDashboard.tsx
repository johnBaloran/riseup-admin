// src/components/jerseys/JerseyDashboard.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Jersey dashboard container ONLY - coordinates child components
 */

"use client";

import { useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useJerseyData } from "@/hooks/useJerseyData";
import JerseyStats from "./JerseyStats";
import DivisionInfo from "./DivisionInfo";
import TeamCard from "./TeamCard";
import TutorialLink from "@/components/features/tutorials/TutorialLink";

export default function JerseyDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedLocation = searchParams.get("location") || "all";
  const selectedDivision = searchParams.get("division") || null;

  // Fetch all data without location filter
  const { divisions, stats, locations, teams, isLoading, error } =
    useJerseyData();

  // Update URL with new filter values
  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/jerseys?${params.toString()}`);
  };

  // Filter divisions by selected location
  const filteredDivisions = useMemo(() => {
    if (selectedLocation === "all") return divisions;
    return divisions.filter(
      (div) => div.location?._id?.toString() === selectedLocation
    );
  }, [divisions, selectedLocation]);

  // Auto-select first division when divisions change and no division selected
  useEffect(() => {
    if (filteredDivisions.length > 0 && !selectedDivision) {
      updateFilters({ division: filteredDivisions[0]._id });
    }
  }, [filteredDivisions.length]);

  const currentDivision = filteredDivisions.find(
    (d) => d._id === selectedDivision
  );

  // Fetch teams for selected division
  const { teams: divisionTeams, isLoading: teamsLoading } = useJerseyData(
    undefined,
    selectedDivision || undefined
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading jersey data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Jersey Management</h1>
          <TutorialLink tutorialId="jersey-dashboard" />
        </div>
        <p className="text-gray-600 mt-1">
          Manage jersey designs and player details across all teams
        </p>
      </div>

      {/* Summary Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-5 h-24 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <JerseyStats stats={stats} />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Location Filter */}
        <div className="flex-1">
          <Label htmlFor="location-filter">Location</Label>
          <Select
            value={selectedLocation}
            onValueChange={(value) =>
              updateFilters({
                location: value === "all" ? undefined : value,
                division: undefined,
              })
            }
            disabled={isLoading}
          >
            <SelectTrigger id="location-filter" className="w-full">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc._id} value={loc._id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Division Selector */}
        <div className="flex-1">
          <Label htmlFor="division-filter">Division</Label>
          <Select
            value={selectedDivision || ""}
            onValueChange={(value) => updateFilters({ division: value })}
            disabled={isLoading || filteredDivisions.length === 0}
          >
            <SelectTrigger id="division-filter" className="w-full">
              <SelectValue
                placeholder={
                  filteredDivisions.length === 0
                    ? "No divisions available"
                    : "Select division"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {filteredDivisions.map((div) => (
                <SelectItem key={div._id} value={div._id}>
                  {div.divisionName} - {div.day} ({div.teamCount} teams)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Division Info */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-5 h-24 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : currentDivision ? (
        <>
          <DivisionInfo division={currentDivision} teams={divisionTeams} />

          {/* Teams Grid */}
          {teamsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-4 h-64 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : divisionTeams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {divisionTeams.map((team) => (
                <TeamCard key={team._id} team={team} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">No teams in this division yet</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">
            {filteredDivisions.length === 0
              ? "No divisions available for the selected location"
              : "Select a division to view teams"}
          </p>
        </div>
      )}
    </div>
  );
}
