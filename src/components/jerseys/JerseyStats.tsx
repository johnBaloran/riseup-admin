// src/components/jerseys/JerseyStats.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display jersey statistics ONLY
 */

"use client";

import { Users, CheckCircle, AlertCircle, Shirt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { JerseyStats as JerseyStatsType } from "@/types/jersey";

interface JerseyStatsProps {
  stats: JerseyStatsType;
}

export default function JerseyStats({ stats }: JerseyStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Teams */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                All Teams (Active Divisions)
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalTeams}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams with Design */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Design Selected
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.teamsWithDesign}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Custom or edition chosen
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams without Design */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Design
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {stats.teamsWithoutDesign}
              </p>
              <p className="text-xs text-gray-500 mt-1">No design selected</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Teams */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready to Order</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.completeTeams}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Design + player details complete
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shirt className="text-purple-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
