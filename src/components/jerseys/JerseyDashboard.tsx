// src/components/jerseys/JerseyDashboard.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Jersey dashboard container ONLY - coordinates child components
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useJerseyData } from "@/hooks/useJerseyData";
import JerseyStats from "./JerseyStats";
import DivisionInfo from "./DivisionInfo";
import TeamCard from "./TeamCard";
import { TeamWithJerseyInfo } from "@/types/jersey";

export default function JerseyDashboard() {
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);

  const { divisions, stats, locations, teams, isLoading, error } =
    useJerseyData(selectedLocation);

  // Filter divisions by selected location
  const filteredDivisions = useMemo(() => {
    if (selectedLocation === "all") return divisions;
    return divisions.filter((div) => div.location._id === selectedLocation);
  }, [divisions, selectedLocation]);

  // Auto-select first division when divisions change
  useEffect(() => {
    if (filteredDivisions.length > 0 && !selectedDivision) {
      setSelectedDivision(filteredDivisions[0]._id);
    }
  }, [filteredDivisions, selectedDivision]);

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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Jersey Management
        </h1>
        <p className="text-gray-600">
          Manage jersey designs and player details across all teams
        </p>
      </div>

      {/* Summary Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Location Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setSelectedDivision(null);
                }}
                className="w-full px-4 py-2 pr-8 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                disabled={isLoading}
              >
                <option value="all">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          {/* Division Selector */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Division
            </label>
            <div className="relative">
              <select
                value={selectedDivision || ""}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="w-full px-4 py-2 pr-8 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                disabled={isLoading || filteredDivisions.length === 0}
              >
                {filteredDivisions.map((div) => (
                  <option key={div._id} value={div._id}>
                    {div.divisionName} - {div.day} ({div.teamCount} teams)
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current Division Info */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow mb-6 p-5 h-24 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : currentDivision ? (
        <>
          <DivisionInfo division={currentDivision} />

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
