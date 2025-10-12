// src/components/games/WeekSidebar.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Week navigation sidebar ONLY
 *
 * Displays all weeks with status indicators
 */

"use client";

import { ChevronDown, Trophy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatWeekDate } from "@/lib/utils/schedule";
import { StatusBadge } from "./StatusBadge";

interface Week {
  weekNumber: number;
  weekType: "REGULAR" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  label: string;
  date: Date;
  isRegular: boolean;
  isPlayoff: boolean;
  isComplete?: boolean;
  isCurrent?: boolean;
}

interface WeekSidebarProps {
  weeks: Week[];
  selectedWeek: number;
  onWeekSelect: (weekNumber: number) => void;
  regularSeasonWeeks: number;
}

export function WeekSidebar({
  weeks,
  selectedWeek,
  onWeekSelect,
  regularSeasonWeeks,
}: WeekSidebarProps) {
  const [regularSeasonOpen, setRegularSeasonOpen] = useState(true);
  const [playoffsOpen, setPlayoffsOpen] = useState(true);

  const regularWeeks = weeks.filter((w) => w.isRegular);
  const playoffWeeks = weeks.filter((w) => w.isPlayoff);

  return (
    <div className="w-64 border-r bg-gray-50 h-full overflow-y-auto">
      {/* Regular Season */}
      <div className="border-b">
        <button
          onClick={() => setRegularSeasonOpen(!regularSeasonOpen)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-sm">Regular Season</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform",
              !regularSeasonOpen && "-rotate-90"
            )}
          />
        </button>

        {regularSeasonOpen && (
          <div className="py-2">
            {regularWeeks.map((week) => (
              <WeekItem
                key={week.weekNumber}
                week={week}
                isSelected={selectedWeek === week.weekNumber}
                onClick={() => onWeekSelect(week.weekNumber)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Playoffs */}
      {playoffWeeks.length > 0 && (
        <div>
          <button
            onClick={() => setPlayoffsOpen(!playoffsOpen)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-orange-600" />
              <span className="font-semibold text-sm">Playoffs</span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                !playoffsOpen && "-rotate-90"
              )}
            />
          </button>

          {playoffsOpen && (
            <div className="py-2">
              {playoffWeeks.map((week) => (
                <PlayoffWeekItem
                  key={week.weekNumber}
                  week={week}
                  isSelected={selectedWeek === week.weekNumber}
                  onClick={() => onWeekSelect(week.weekNumber)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Regular Week Item
function WeekItem({
  week,
  isSelected,
  onClick,
}: {
  week: Week;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-4 py-2.5 text-left hover:bg-gray-100 transition-colors border-l-4",
        isSelected ? "bg-blue-50 border-blue-600" : "border-transparent"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{week.label}</span>
        {week.isCurrent && <StatusBadge status="current" />}
        {week.isComplete && !week.isCurrent && (
          <StatusBadge status="complete" />
        )}
      </div>
      <span className="text-xs text-gray-500">{formatWeekDate(week.date)}</span>
    </button>
  );
}

// Playoff Week Item
function PlayoffWeekItem({
  week,
  isSelected,
  onClick,
}: {
  week: Week;
  isSelected: boolean;
  onClick: () => void;
}) {
  const weekLabels: Record<string, string> = {
    QUARTERFINAL: "Week 8",
    SEMIFINAL: "Week 9",
    FINAL: "Week 10",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-4 py-2.5 text-left hover:bg-gray-100 transition-colors border-l-4",
        isSelected ? "bg-orange-50 border-orange-600" : "border-transparent"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{week.label}</span>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
          {weekLabels[week.weekType]}
        </span>
      </div>
      <span className="text-xs text-gray-500">{formatWeekDate(week.date)}</span>
    </button>
  );
}
