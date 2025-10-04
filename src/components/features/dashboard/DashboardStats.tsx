// src/components/features/dashboard/DashboardStats.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display dashboard stats ONLY
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Calendar, MapPin } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    divisions: number;
    teams: number;
    players: number;
    games: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      label: "Active Divisions",
      value: stats.divisions,
      icon: MapPin,
      color: "text-blue-600",
    },
    {
      label: "Total Teams",
      value: stats.teams,
      icon: Trophy,
      color: "text-green-600",
    },
    {
      label: "Registered Players",
      value: stats.players,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Scheduled Games",
      value: stats.games,
      icon: Calendar,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.label}
                </p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
