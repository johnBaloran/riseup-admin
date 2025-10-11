// src/components/jerseys/DivisionInfo.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display division information ONLY
 */

"use client";

import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { DivisionWithTeams } from "@/types/jersey";

interface DivisionInfoProps {
  division: DivisionWithTeams;
}

export default function DivisionInfo({ division }: DivisionInfoProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineBadge = () => {
    if (!division.jerseyDeadline) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
          No deadline set
        </span>
      );
    }

    const daysUntil = getDaysUntilDeadline(division.jerseyDeadline);

    if (daysUntil < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <AlertTriangle size={12} />
          Deadline passed {Math.abs(daysUntil)} days ago
        </span>
      );
    } else if (daysUntil <= 7) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
          <Clock size={12} />
          {daysUntil} days left
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <CheckCircle size={12} />
          {daysUntil} days left
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {division.divisionName}
          </h2>
          <div className="flex gap-4 mt-1 text-sm text-gray-600">
            <span>{division.location.name}</span>
            <span>•</span>
            <span>{division.day}</span>
            <span>•</span>
            <span>{division.level.name}</span>
            {division.jerseyDeadline && (
              <>
                <span>•</span>
                <span>Deadline: {formatDate(division.jerseyDeadline)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getDeadlineBadge()}
          <div className="text-right">
            <p className="text-sm text-gray-600">Teams</p>
            <p className="text-2xl font-bold text-gray-900">
              {division.teamCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
