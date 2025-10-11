// src/components/jerseys/JerseyStats.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display jersey statistics ONLY
 */

"use client";

import { Users, CheckCircle, AlertCircle, Shirt } from "lucide-react";
import { JerseyStats as JerseyStatsType } from "@/types/jersey";

interface JerseyStatsProps {
  stats: JerseyStatsType;
}

export default function JerseyStats({ stats }: JerseyStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Teams */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Teams</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.totalTeams}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      {/* Teams with Design */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Teams with Design
            </p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {stats.teamsWithDesign}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Custom or edition selected
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      {/* Teams without Design */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Teams without Design
            </p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {stats.teamsWithoutDesign}
            </p>
            <p className="text-xs text-gray-500 mt-1">Need to select jersey</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      {/* Complete Teams */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Complete Teams</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {stats.completeTeams}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Design + all players ready
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Shirt className="text-purple-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
