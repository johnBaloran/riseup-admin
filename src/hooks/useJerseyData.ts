// src/hooks/useJerseyData.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Jersey data fetching hook ONLY
 */

"use client";

import { useState, useEffect } from "react";
import {
  JerseyStats,
  DivisionWithTeams,
  TeamWithJerseyInfo,
} from "@/types/jersey";

interface Location {
  _id: string;
  name: string;
}

interface UseJerseyDataReturn {
  divisions: DivisionWithTeams[];
  stats: JerseyStats;
  locations: Location[];
  teams: TeamWithJerseyInfo[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useJerseyData(
  locationId?: string,
  divisionId?: string
): UseJerseyDataReturn {
  const [divisions, setDivisions] = useState<DivisionWithTeams[]>([]);
  const [stats, setStats] = useState<JerseyStats>({
    totalTeams: 0,
    teamsWithDesign: 0,
    teamsWithoutDesign: 0,
    completeTeams: 0,
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [teams, setTeams] = useState<TeamWithJerseyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (locationId) params.append("locationId", locationId);
      if (divisionId) params.append("divisionId", divisionId);

      const response = await fetch(`/api/v1/jerseys?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch jersey data");
      }

      const data = await response.json();

      if (divisionId && data.teams) {
        // When fetching teams for a specific division
        setTeams(data.teams);
      } else {
        // When fetching overview data
        setDivisions(data.divisions || []);
        setStats(data.stats || stats);
        setLocations(data.locations || []);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [locationId, divisionId]);

  return {
    divisions,
    stats,
    locations,
    teams,
    isLoading,
    error,
    refetch: fetchData,
  };
}
