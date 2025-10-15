// src/app/admin/scorekeeper/[gameId]/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Scorekeeper page for a specific game ONLY
 *
 * Handles real-time game scoring interface
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import GameScoring from "@/components/features/scorekeeper/GameScoring";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ScorekeeperPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState<{
    currentGame: any;
    allPlayers: any[];
  } | null>(null);

  useEffect(() => {
    fetchGameData();
  }, [gameId]);

  const fetchGameData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/scorekeeper/${gameId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Game not found");
        }
        if (response.status === 403) {
          throw new Error("You do not have permission to access this game");
        }
        throw new Error("Failed to load game data");
      }

      const data = await response.json();
      setGameData(data);
    } catch (err: any) {
      console.error("Error fetching game data:", err);
      setError(err.message || "Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-3xl mx-auto p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
                <h2 className="text-2xl font-bold text-red-900">
                  {error || "Failed to Load Game"}
                </h2>
                <p className="text-red-700">
                  {error === "Game not found"
                    ? "The game you're looking for doesn't exist or may have been deleted."
                    : error === "You do not have permission to access this game"
                    ? "You don't have the necessary permissions to score this game."
                    : "There was an error loading the game data. Please try again."}
                </p>
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                  </Button>
                  <Button onClick={fetchGameData}>Try Again</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div>
      <GameScoring
        currentGame={gameData.currentGame}
        allPlayers={gameData.allPlayers}
      />
    </div>
  );
}
