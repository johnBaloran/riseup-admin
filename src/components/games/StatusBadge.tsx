// src/components/games/StatusBadge.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Status badge display ONLY
 *
 * Reusability - Used across schedule views
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType =
  | "complete"
  | "current"
  | "not-started"
  | "in-progress"
  | "needs-attention";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    complete: {
      label: "Complete",
      variant: "default" as const,
      className:
        "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
    },
    current: {
      label: "Current",
      variant: "default" as const,
      className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
    },
    "not-started": {
      label: "Not Started",
      variant: "outline" as const,
      className: "text-gray-600 border-gray-300",
    },
    "in-progress": {
      label: "In Progress",
      variant: "default" as const,
      className:
        "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100",
    },
    "needs-attention": {
      label: "Needs Attention",
      variant: "default" as const,
      className:
        "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100",
    },
  };

  const { label, variant, className: statusClassName } = config[status];

  return (
    <Badge variant={variant} className={cn(statusClassName, className)}>
      {label}
    </Badge>
  );
}
