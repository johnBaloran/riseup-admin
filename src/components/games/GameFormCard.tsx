// src/components/games/GameFormCard.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Single game form card ONLY
 *
 * Reusable game input form
 */

"use client";

import { Trash2, Calendar } from "lucide-react";
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
import { formatDate } from "@/lib/utils/date";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
  code: string;
}

interface GameFormData {
  id?: string;
  gameName: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  status?: boolean;
  date?: Date;
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
  const isCompleted = data.status === true;

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
        isCompleted
          ? "bg-gray-100 border-gray-300"
          : published && !isDraft
          ? "border-green-300 bg-green-50"
          : isDraft
          ? "border-blue-300 bg-blue-50"
          : "",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-x-3 gap-y-2 flex-wrap">
          {isPlayoff && <WeekTypeBadge weekType={weekType} />}
          {isCompleted && (
            <span className="px-2 py-1 bg-gray-500 text-white text-xs font-semibold rounded">
              COMPLETED
            </span>
          )}
          {published && !isDraft && !isCompleted && (
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
            <Link href={`/scorekeeper/${data.id}`}>
              <span className="text-sm font-semibold text-gray-900">
                {displayGameName}
              </span>
            </Link>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(index)}
          disabled={isCompleted}
          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {data.date && (
        <div className="flex items-center text-sm  my-2">
          <Calendar className="w-4 h-4 mr-1.5" />
          {formatDate(data.date)}
        </div>
      )}

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
            disabled={isCompleted}
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
            disabled={isCompleted}
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
            disabled={isCompleted}
          />
        </div>
      </div>

      {/* Validation Messages */}
      {data.homeTeam && data.awayTeam && data.homeTeam === data.awayTeam && (
        <p className="text-xs text-red-600 mt-2">
          Home team and away team cannot be the same
        </p>
      )}
      {!isCompleted &&
        (!data.time || !data.homeTeam || !data.awayTeam) &&
        !isDraft && (
          <p className="text-xs text-orange-600 mt-2">
            Incomplete matchup - fill all fields to publish
          </p>
        )}
    </div>
  );
}
