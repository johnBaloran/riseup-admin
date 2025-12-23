// src/components/games/WeekScheduleView.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Week schedule management view ONLY
 *
 * Handles game creation/editing for a week
 */

"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GameFormCard } from "./GameFormCard";
import { TeamScheduleIndicator } from "./TeamScheduleIndicator";
import { EmptyWeekView } from "./EmptyWeekView";
import { extractTime } from "@/lib/utils/date";

interface Team {
  id: string;
  name: string;
  shortName: string;
  currentDivisionId?: string;
  currentDivisionName?: string;
  isInDifferentDivision?: boolean;
}

interface TeamScheduleCount {
  teamId: string;
  teamCode: string;
  teamName: string;
  gameCount: number;
}

interface Game {
  id?: string;
  gameName: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  published?: boolean;
  status?: boolean;
  date?: Date;
}

interface WeekScheduleViewProps {
  weekNumber: number;
  weekType: "REGULAR" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  weekLabel: string;
  locationName: string;
  games: Game[];
  teams: Team[];
  teamCounts: TeamScheduleCount[];
  onSave: (gamesToCreate: Game[], gamesToUpdate: Game[]) => Promise<void>;
  onCancel: () => void;
  onDeleteGame?: (
    gameId: string,
    gameName: string,
    isPublished: boolean,
    isCompleted: boolean
  ) => void;
}

export function WeekScheduleView({
  weekNumber,
  weekType,
  weekLabel,
  locationName,
  games: initialGames,
  teams,
  teamCounts,
  onSave,
  onCancel,
  onDeleteGame,
}: WeekScheduleViewProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [isSaving, setIsSaving] = useState(false);
  const [bulkDate, setBulkDate] = useState<string>("");

  // Sync games state when week changes
  useEffect(() => {
    // Extract time from date for each game (for UI display/editing)
    const gamesWithTime = initialGames.map((game) => ({
      ...game,
      time: game.date ? extractTime(game.date) : "",
    }));

    setGames(gamesWithTime);

    // Set bulk date to first game's date if available
    if (initialGames.length > 0 && initialGames[0].date) {
      const firstDate = new Date(initialGames[0].date);
      setBulkDate(firstDate.toISOString().split("T")[0]);
    }
  }, [initialGames]);

  const isPlayoff = weekType !== "REGULAR";
  const hasGames = games.length > 0;

  // Add new game
  const handleAddGame = () => {
    const newGame: Game = {
      gameName: "", // Will be auto-generated when teams are selected
      time: "",
      homeTeam: "",
      awayTeam: "",
      published: true, // Will be published when saved
      status: false,
    };
    setGames([...games, newGame]);
  };

  // Update game field
  const handleGameChange = (
    index: number,
    field: keyof Game,
    value: string
  ) => {
    const updated = [...games];
    const game = updated[index];

    // If time is being updated, also update the date to reflect new time
    if (field === "time") {
      // Time can only be updated if date exists (enforced by UI)
      if (!game.date) {
        console.warn("Time cannot be set without a date");
        return;
      }
      const [hours, minutes] = value.split(":").map(Number);
      const gameDate = new Date(game.date);
      const newDate = new Date(
        gameDate.getFullYear(),
        gameDate.getMonth(),
        gameDate.getDate(),
        hours,
        minutes
      );
      updated[index] = { ...game, time: value, date: newDate };
    } else {
      updated[index] = { ...game, [field]: value };
    }

    setGames(updated);
  };

  // Apply bulk date to all games (preserving each game's time)
  const handleApplyBulkDate = () => {
    if (!bulkDate) return;

    const updated = games.map((game) => {
      // Skip completed games - they cannot be modified
      if (game.status === true) {
        return game;
      }

      // Parse the new date
      const newDate = new Date(bulkDate);

      // Extract time from game's time field or current date
      const time = game.time || extractTime(game.date || new Date());
      const [hours, minutes] = time.split(":").map(Number);

      // Combine new date with existing time
      const combinedDate = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        hours,
        minutes
      );

      return {
        ...game,
        date: combinedDate,
      };
    });
    setGames(updated);
  };

  // Delete game
  const handleDeleteGame = (index: number) => {
    const game = games[index];

    // If game has an ID, it's saved in database - show delete dialog
    if (game.id && onDeleteGame) {
      const homeTeam = teams.find((t) => t.id === game.homeTeam);
      const awayTeam = teams.find((t) => t.id === game.awayTeam);
      const gameName =
        homeTeam && awayTeam
          ? `${homeTeam.name} vs. ${awayTeam.name}`
          : game.gameName || "Unknown Game";

      onDeleteGame(
        game.id,
        gameName,
        game.published || false,
        game.status || false
      );
    } else {
      // If no ID, it's a draft - just remove from local state
      setGames(games.filter((_, i) => i !== index));
    }
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Auto-generate game names and partition games
      const gamesToCreate: Game[] = [];
      const gamesToUpdate: Game[] = [];

      games.forEach((game) => {
        const homeTeam = teams.find((t) => t.id === game.homeTeam);
        const awayTeam = teams.find((t) => t.id === game.awayTeam);
        const gameName =
          homeTeam && awayTeam
            ? `${homeTeam.name} vs. ${awayTeam.name}`
            : game.gameName || "";

        const processedGame = { ...game, gameName };

        if (game.id) {
          gamesToUpdate.push(processedGame);
        } else {
          gamesToCreate.push(processedGame);
        }
      });

      await onSave(gamesToCreate, gamesToUpdate);
    } catch (error) {
      console.error("Failed to save games:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Validate all games (gameName is auto-generated, so we don't need to check it)
  const allGamesValid = games.every(
    (game) =>
      game.time &&
      game.homeTeam &&
      game.awayTeam &&
      game.homeTeam !== game.awayTeam
  );

  const publishedCount = games.filter((g) => g.published).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">
                  {isPlayoff && (
                    <span className="text-orange-600 mr-2">🏆</span>
                  )}
                  {weekLabel}
                  {weekType !== "REGULAR" && (
                    <span className="hidden sm:inline">
                      {" "}
                      - Week {weekNumber}
                    </span>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {locationName}
                </p>
              </div>

              <Button
                onClick={handleAddGame}
                variant={isPlayoff ? "default" : "default"}
                className={`w-full sm:w-auto ${
                  isPlayoff ? "bg-orange-600 hover:bg-orange-700" : ""
                }`}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {isPlayoff ? "Add Playoff Game" : "Add Game"}
                </span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {/* Bulk Date Setter */}
            {hasGames && (
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 w-full sm:w-auto">
                  <Label htmlFor="bulk-date" className="text-xs text-gray-600">
                    Set Date for All Games
                  </Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="bulk-date"
                      type="date"
                      value={bulkDate}
                      onChange={(e) => setBulkDate(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleApplyBulkDate}
                  disabled={!bulkDate}
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Apply to All
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {!hasGames ? (
            <EmptyWeekView
              weekType={weekType}
              weekNumber={weekNumber}
              onCreateGame={handleAddGame}
            />
          ) : (
            <>
              {/* Team Schedule Indicator */}
              <TeamScheduleIndicator teams={teamCounts} />

              {/* Info Message for Playoffs */}
              {isPlayoff && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800">
                    <span className="font-medium">🏆 Playoff Game:</span> Select
                    teams based on regular season seeding. Winners will advance
                    to the next round.
                  </p>
                </div>
              )}

              {/* Game Forms */}
              <div className="space-y-4">
                {games.map((game, index) => (
                  <GameFormCard
                    key={game.id || index}
                    index={index}
                    data={game}
                    teams={teams}
                    weekType={weekType}
                    published={game.published}
                    isDraft={!game.published && !!game.id}
                    onChange={handleGameChange}
                    onDelete={handleDeleteGame}
                  />
                ))}
              </div>

              {/* Add Another Game */}
              <button
                onClick={handleAddGame}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                + Add Another {isPlayoff ? "Playoff" : ""} Game
              </button>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {publishedCount > 0 && (
                    <span className="text-xs sm:text-sm text-gray-600 text-center">
                      {publishedCount} published,{" "}
                      {games.length - publishedCount} draft
                    </span>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={!allGamesValid || isSaving || games.length === 0}
                    className="w-full sm:w-auto"
                  >
                    {isSaving
                      ? "Saving..."
                      : `Save & Publish ${games.length} Game${
                          games.length !== 1 ? "s" : ""
                        }`}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
