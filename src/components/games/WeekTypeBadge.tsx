// src/components/games/WeekTypeBadge.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Week type badge display ONLY
 *
 * Shows playoff badges (QF, SF, F)
 */

"use client";

import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type WeekType = "REGULAR" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";

interface WeekTypeBadgeProps {
  weekType: WeekType;
  className?: string;
}

export function WeekTypeBadge({ weekType, className }: WeekTypeBadgeProps) {
  if (weekType === "REGULAR") return null;

  const config = {
    QUARTERFINAL: {
      label: "QF",
      className: "bg-orange-500 text-white",
    },
    SEMIFINAL: {
      label: "SF",
      className: "bg-orange-500 text-white",
    },
    FINAL: {
      label: "F",
      className: "bg-orange-500 text-white",
    },
  };

  const { label, className: typeClassName } = config[weekType];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold",
        typeClassName,
        className
      )}
    >
      <Trophy className="w-3 h-3" />
      {label}
    </div>
  );
}
