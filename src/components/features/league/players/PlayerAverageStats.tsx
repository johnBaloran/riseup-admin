// src/components/features/league/players/PlayerAverageStats.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Displays player's average stats ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AverageStats {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  threesMade: number;
  twosMade: number;
  freeThrowsMade: number;
}

interface PlayerAverageStatsProps {
  stats: AverageStats;
  playerId: string;
}

export function PlayerAverageStats({ stats, playerId }: PlayerAverageStatsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRecalculate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/players/${playerId}/recalculate-stats`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to recalculate stats");
      }

      toast.success("Average stats have been recalculated.");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const statItems = [
    { label: "Points", value: (stats?.points || 0).toFixed(1) },
    { label: "Rebounds", value: (stats?.rebounds || 0).toFixed(1) },
    { label: "Assists", value: (stats?.assists || 0).toFixed(1) },
    { label: "Steals", value: (stats?.steals || 0).toFixed(1) },
    { label: "Blocks", value: (stats?.blocks || 0).toFixed(1) },
    { label: "3-Pointers Made", value: (stats?.threesMade || 0).toFixed(1) },
    { label: "2-Pointers Made", value: (stats?.twosMade || 0).toFixed(1) },
    { label: "Free Throws Made", value: (stats?.freeThrowsMade || 0).toFixed(1) },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Average Stats</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRecalculate}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Recalculate
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item) => (
            <div key={item.label} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-3xl font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
