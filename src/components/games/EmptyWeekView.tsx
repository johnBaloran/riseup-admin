// src/components/games/EmptyWeekView.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Empty state display ONLY
 *
 * Shows when no games are scheduled for a week
 */

"use client";

import { Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyWeekViewProps {
  weekType: "REGULAR" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  weekNumber: number;
  onCreateGame: () => void;
}

export function EmptyWeekView({
  weekType,
  weekNumber,
  onCreateGame,
}: EmptyWeekViewProps) {
  const isPlayoff = weekType !== "REGULAR";

  const config: Record<
    EmptyWeekViewProps["weekType"],
    {
      icon: React.ElementType;
      title: string;
      description: string;
      note?: string;
      buttonText: string;
    }
  > = {
    REGULAR: {
      icon: Calendar,
      title: "No games scheduled yet",
      description: `Start scheduling games for Week ${weekNumber}`,
      buttonText: "Create First Game",
    },
    QUARTERFINAL: {
      icon: Trophy,
      title: "No playoff games scheduled yet",
      description:
        "Schedule quarterfinals matchups based on regular season standings",
      note: "Teams have been seeded based on their regular season performance",
      buttonText: "Create Quarterfinal Game",
    },
    SEMIFINAL: {
      icon: Trophy,
      title: "No playoff games scheduled yet",
      description:
        "Schedule semifinals matchups based on regular season standings",
      note: "Teams have been seeded based on their regular season performance",
      buttonText: "Create Semifinal Game",
    },
    FINAL: {
      icon: Trophy,
      title: "No playoff games scheduled yet",
      description: "Schedule finals matchups based on regular season standings",
      note: "Teams have been seeded based on their regular season performance",
      buttonText: "Create Final Game",
    },
  };

  const { icon: Icon, title, description, note, buttonText } = config[weekType];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          isPlayoff ? "bg-orange-100" : "bg-gray-100"
        }`}
      >
        <Icon
          className={`w-8 h-8 ${
            isPlayoff ? "text-orange-600" : "text-gray-400"
          }`}
        />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4 text-center max-w-md">
        {description}
      </p>

      {note && (
        <p className="text-sm text-orange-600 mb-6 text-center max-w-md font-medium">
          {note}
        </p>
      )}

      <Button
        onClick={onCreateGame}
        className={isPlayoff ? "bg-orange-600 hover:bg-orange-700" : ""}
      >
        {buttonText}
      </Button>
    </div>
  );
}
