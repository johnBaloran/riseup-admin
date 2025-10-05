// src/components/features/payments/InstallmentProgress.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Installment payment progress visualization ONLY
 */

"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

interface InstallmentProgressProps {
  progress: Array<{
    week: number;
    status: "succeeded" | "failed" | "pending";
    amountPaid?: number;
    dueDate?: Date;
  }>;
  size?: "sm" | "md" | "lg";
}

export function InstallmentProgress({
  progress,
  size = "md",
}: InstallmentProgressProps) {
  const dotSize = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "succeeded":
        return "Paid";
      case "failed":
        return "Failed";
      default:
        return "Pending";
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {progress.map((week) => (
          <Tooltip key={week.week}>
            <TooltipTrigger>
              <div
                className={`${dotSize[size]} rounded-full ${getStatusColor(
                  week.status
                )} transition-colors`}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p className="font-medium">Week {week.week}</p>
                <p className="text-gray-500">{getStatusLabel(week.status)}</p>
                {week.amountPaid && (
                  <p className="text-green-600">
                    ${week.amountPaid.toFixed(2)}
                  </p>
                )}
                {week.dueDate && (
                  <p className="text-gray-400">
                    Due: {format(new Date(week.dueDate), "MMM dd")}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
