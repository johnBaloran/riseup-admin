// src/components/features/league/divisions/DivisionsGrid.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display divisions in responsive card grid ONLY
 */

"use client";

import { DivisionCard } from "./DivisionCard";
import { Calendar } from "lucide-react";
import { PopulatedDivision } from "@/types/division";

interface DivisionsGridProps {
  divisions: PopulatedDivision[];
  cityId: string;
}

export function DivisionsGrid({ divisions, cityId }: DivisionsGridProps) {
  if (divisions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No divisions found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your filters or create a new division.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {divisions.map((division) => (
        <DivisionCard key={division._id} division={division} cityId={cityId} />
      ))}
    </div>
  );
}
