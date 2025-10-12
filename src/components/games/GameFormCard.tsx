// src/components/games/GameFormCard.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Single game form card ONLY
 *
 * Reusable game input form
 */

"use client";

import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { WeekTypeBadge } from "./WeekTypeBadge";
import { cn } from "@/lib/utils";

interface Team {
  id: string;
  name: string;
  code: string;
}

interface GameFormData {
  gameName: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
}

interface GameFormCardProps {
  index: number;
  data: GameFormData;
  teams: Team[];
  weekType?: "REGULAR" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  published?: boolean;
  isDraft?: boolean;
  onChange: (index: number, field: keyof GameFormData, value: string) => void;
  onDelete: (index: number) => void;
  className?: string;
}

export function GameFormCard({
  index,
  data,
  teams,
  weekType = "REGULAR",
  published = false,
  isDraft = false,
  onChange,
  onDelete,
  className,
}: GameFormCardProps) {
  const isPlayoff = weekType !== "REGULAR";

  // Get team names for display
  const homeTeamData = teams.find((t) => t.id === data.homeTeam);
  const awayTeamData = teams.find((t) => t.id === data.awayTeam);

  // Auto-generate game name when both teams are selected
  const autoGameName =
    homeTeamData && awayTeamData
      ? `${homeTeamData.name} vs. ${awayTeamData.name}`
      : "";

  const displayGameName = autoGameName || data.gameName;

  // Filter teams for dropdowns - exclude opposite team UNLESS it's the current selection
  const availableHomeTeams = teams.filter(
    (team) =>
      team.id === data.homeTeam || !data.awayTeam || team.id !== data.awayTeam
  );
  const availableAwayTeams = teams.filter(
    (team) =>
      team.id === data.awayTeam || !data.homeTeam || team.id !== data.homeTeam
  );

  return (
    <div
      className={cn(
        "border rounded-lg p-4",
        published && !isDraft && "border-green-300 bg-green-50",
        isDraft && "border-blue-300 bg-blue-50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isPlayoff && <WeekTypeBadge weekType={weekType} />}
          {published && !isDraft && (
            <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
              PUBLISHED
            </span>
          )}
          {isDraft && (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
              DRAFT
            </span>
          )}
          {displayGameName && (
            <span className="text-sm font-semibold text-gray-900">
              {displayGameName}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(index)}
          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Home Team */}
        <div className="space-y-1.5">
          <Label htmlFor={`home-team-${index}`} className="text-xs">
            Home Team
          </Label>
          <Select
            value={data.homeTeam}
            onValueChange={(value) => {
              onChange(index, "homeTeam", value);
            }}
          >
            <SelectTrigger id={`home-team-${index}`} className="text-sm">
              <SelectValue placeholder="Select home team" />
            </SelectTrigger>
            <SelectContent>
              {availableHomeTeams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Away Team */}
        <div className="space-y-1.5">
          <Label htmlFor={`away-team-${index}`} className="text-xs">
            Away Team
          </Label>
          <Select
            value={data.awayTeam}
            onValueChange={(value) => {
              onChange(index, "awayTeam", value);
            }}
          >
            <SelectTrigger id={`away-team-${index}`} className="text-sm">
              <SelectValue placeholder="Select away team" />
            </SelectTrigger>
            <SelectContent>
              {availableAwayTeams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time */}
        <div className="space-y-1.5">
          <Label htmlFor={`time-${index}`} className="text-xs">
            Time
          </Label>
          <Input
            id={`time-${index}`}
            type="time"
            value={data.time}
            onChange={(e) => onChange(index, "time", e.target.value)}
            className="text-sm w-[130px]"
          />
        </div>
      </div>

      {/* Validation Messages */}
      {data.homeTeam && data.awayTeam && data.homeTeam === data.awayTeam && (
        <p className="text-xs text-red-600 mt-2">
          Home team and away team cannot be the same
        </p>
      )}
      {(!data.time || !data.homeTeam || !data.awayTeam) && !isDraft && (
        <p className="text-xs text-orange-600 mt-2">
          Incomplete matchup - fill all fields to publish
        </p>
      )}
    </div>
  );
}
