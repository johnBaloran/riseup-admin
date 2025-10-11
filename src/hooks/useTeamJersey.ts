// src/hooks/useTeamJersey.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team jersey data fetching and management ONLY
 */

"use client";

import { useState, useEffect } from "react";
import { TeamJerseyDetails } from "@/types/jersey";

interface UseTeamJerseyReturn {
  team: TeamJerseyDetails | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTeamJersey(teamId: string): UseTeamJerseyReturn {
  const [team, setTeam] = useState<TeamJerseyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/jerseys/team/${teamId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch team details");
      }

      const data = await response.json();
      setTeam(data.team);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  return {
    team,
    isLoading,
    error,
    refetch: fetchTeam,
  };
}
