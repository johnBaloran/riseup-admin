// src/app/admin/games/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Game scheduling overview page ONLY
 *
 * Main dashboard for managing game schedules across divisions
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/games/StatusBadge";
import { formatTimeRange } from "@/lib/utils/time";

interface DivisionStatus {
  divisionId: string;
  divisionName: string;
  location: { id: string; name: string; address: string };
  city: { id: string; name: string };
  day: string;
  timeRange: string;
  startTime?: string;
  endTime?: string;
  teamCount: number;
  totalWeeks: number;
  scheduledWeeks: number;
  currentWeek: number;
  status: "not-started" | "in-progress" | "complete";
  nextGame?: { homeTeam: string; awayTeam: string; week: number };
}

interface ScheduleOverviewData {
  locations: Array<{
    location: { id: string; name: string; address: string };
    divisions: DivisionStatus[];
  }>;
  stats: {
    totalDivisions: number;
    needAttention: number;
    fullyScheduled: number;
    totalTeams: number;
  };
}

export default function GamesPage() {
  const router = useRouter();
  const [data, setData] = useState<ScheduleOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState<string>("all");

  useEffect(() => {
    fetchScheduleOverview();
  }, [locationFilter]);

  const fetchScheduleOverview = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (locationFilter && locationFilter !== "all") {
        params.append("locationId", locationFilter);
      }

      const response = await fetch(`/api/v1/games/overview?${params}`);
      if (!response.ok) throw new Error("Failed to fetch overview");

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching schedule overview:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique locations for filter
  const locations = data?.locations.map((l) => l.location) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Game Scheduling</h1>
        <p className="text-gray-600 mt-1">
          Manage schedules for all your divisions
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Divisions"
            value={data?.stats.totalDivisions || 0}
            color="blue"
          />
          <StatCard
            title="Need Attention"
            value={data?.stats.needAttention || 0}
            color="orange"
          />
          <StatCard
            title="Fully Scheduled"
            value={data?.stats.fullyScheduled || 0}
            color="green"
          />
          <StatCard
            title="Total Teams"
            value={data?.stats.totalTeams || 0}
            color="blue"
          />
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Filter by Location:</span>
        </div>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Not Started</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Complete</span>
        </div>
      </div>

      {/* Divisions by Location */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {data?.locations.map((locationGroup) => (
            <LocationGroup
              key={locationGroup.location.id}
              location={locationGroup.location}
              divisions={locationGroup.divisions}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "blue" | "orange" | "green";
}) {
  const colors = {
    blue: "text-blue-600",
    orange: "text-orange-600",
    green: "text-green-600",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

// Location Group Component
function LocationGroup({
  location,
  divisions,
}: {
  location: { id: string; name: string; address: string };
  divisions: DivisionStatus[];
}) {
  return (
    <div className="space-y-4">
      {/* Location Header */}
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold">{location.name}</h2>
          <p className="text-sm text-gray-600">{location.address}</p>
        </div>
        <span className="ml-auto text-sm text-gray-500">
          {divisions.length} division{divisions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Divisions */}
      <div className="space-y-3">
        {divisions.map((division) => (
          <DivisionCard key={division.divisionId} division={division} />
        ))}
      </div>
    </div>
  );
}

// Division Card Component
function DivisionCard({ division }: { division: DivisionStatus }) {
  const progressPercentage = Math.round(
    (division.scheduledWeeks / division.totalWeeks) * 100
  );

  const statusColors = {
    "not-started": "bg-red-500",
    "in-progress": "bg-orange-500",
    complete: "bg-green-500",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6 sm:relative">
        {/* Desktop Button - Absolute positioned top right (hidden on mobile) */}
        <Link
          href={`/admin/games/${division.divisionId}`}
          className="hidden sm:block absolute top-6 right-6"
        >
          <Button variant="default">
            Manage Schedule
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>

        {/* Content */}
        <div className="space-y-3">
          {/* Division Name & Status */}
          <div className="flex items-center gap-3">
            <h3 className="text-base sm:text-lg font-semibold">
              {division.divisionName}
            </h3>
            {division.status === "in-progress" && (
              <StatusBadge status="needs-attention" />
            )}
          </div>

          {/* Info Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              {division.day}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              {division.timeRange}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              {division.teamCount} teams
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
              <span>Schedule Progress</span>
              <span className="font-medium">
                {division.scheduledWeeks}/{division.totalWeeks} weeks
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${statusColors[division.status]}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Current Week Info */}
          <div className="bg-blue-50 rounded px-3 py-2 text-xs sm:text-sm">
            <span className="text-blue-900 font-medium">
              Current Week: {division.currentWeek}
            </span>
            {division.nextGame && (
              <span className="text-blue-700 ml-2 block sm:inline mt-1 sm:mt-0">
                • Next: {division.nextGame.homeTeam} vs{" "}
                {division.nextGame.awayTeam}
              </span>
            )}
          </div>

          {/* Mobile Button - Bottom (hidden on desktop) */}
          <Link
            href={`/admin/games/${division.divisionId}`}
            className="block sm:hidden"
          >
            <Button variant="default" className="w-full">
              Manage Schedule
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
