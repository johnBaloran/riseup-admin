// src/components/games/WeekScheduleView.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Week schedule management view ONLY
 *
 * Handles game creation/editing for a week
 */

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameFormCard } from "./GameFormCard";
import { TeamScheduleIndicator } from "./TeamScheduleIndicator";
import { EmptyWeekView } from "./EmptyWeekView";
import { formatWeekDate } from "@/lib/utils/schedule";

interface Team {
  id: string;
  name: string;
  code: string;
}

interface TeamScheduleCount {
  teamId: string;
  teamCode: string;
  gameCount: number;
}

interface Game {
  id?: string;
  gameName: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  published?: boolean;
}

interface WeekScheduleViewProps {
  weekNumber: number;
  weekType: "REGULAR" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  weekLabel: string;
  weekDate: Date;
  locationName: string;
  games: Game[];
  teams: Team[];
  teamCounts: TeamScheduleCount[];
  onSave: (games: Game[]) => Promise<void>;
  onCancel: () => void;
}

export function WeekScheduleView({
  weekNumber,
  weekType,
  weekLabel,
  weekDate,
  locationName,
  games: initialGames,
  teams,
  teamCounts,
  onSave,
  onCancel,
}: WeekScheduleViewProps) {
  const [games, setGames] = useState<Game[]>(
    initialGames.length > 0 ? initialGames : []
  );
  const [isSaving, setIsSaving] = useState(false);

  const isPlayoff = weekType !== "REGULAR";
  const hasGames = games.length > 0;

  // Add new game
  const handleAddGame = () => {
    const newGame: Game = {
      gameName: isPlayoff
        ? `${weekType.slice(0, 2)} ${games.length + 1}`
        : `Week ${weekNumber} Game ${games.length + 1}`,
      time: "",
      homeTeam: "",
      awayTeam: "",
      published: false,
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
    updated[index] = { ...updated[index], [field]: value };
    setGames(updated);
  };

  // Delete game
  const handleDeleteGame = (index: number) => {
    setGames(games.filter((_, i) => i !== index));
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(games);
    } catch (error) {
      console.error("Failed to save games:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Validate all games
  const allGamesValid = games.every(
    (game) =>
      game.gameName &&
      game.time &&
      game.homeTeam &&
      game.awayTeam &&
      game.homeTeam !== game.awayTeam
  );

  const publishedCount = games.filter((g) => g.published).length;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {isPlayoff && <span className="text-orange-600 mr-2">🏆</span>}
                {weekLabel} -{" "}
                {weekType !== "REGULAR" ? `Week ${weekNumber}` : ""}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {formatWeekDate(weekDate)} • {locationName}
              </p>
            </div>

            <Button
              onClick={handleAddGame}
              variant={isPlayoff ? "default" : "default"}
              className={isPlayoff ? "bg-orange-600 hover:bg-orange-700" : ""}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isPlayoff ? "Add Playoff Game" : "Add Game"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
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
                  teams based on regular season seeding. Winners will advance to
                  the next round.
                </p>
              </div>
            )}

            {/* Game Forms */}
            <div className="space-y-4">
              {games.map((game, index) => (
                <GameFormCard
                  key={index}
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
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancel
              </Button>

              <div className="flex items-center gap-3">
                {publishedCount > 0 && (
                  <span className="text-sm text-gray-600">
                    {publishedCount} published, {games.length - publishedCount}{" "}
                    draft
                  </span>
                )}
                <Button
                  onClick={handleSave}
                  disabled={!allGamesValid || isSaving || games.length === 0}
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
  );
}
