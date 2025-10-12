// src/app/admin/games/[divisionId]/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Division schedule management page ONLY
 *
 * Main interface for scheduling games within a division
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WeekSidebar } from "@/components/games/WeekSidebar";
import { WeekScheduleView } from "@/components/games/WeekScheduleView";
import { DeleteGameDialog } from "@/components/games/DeleteGameDialog";

interface Division {
  id: string;
  name: string;
  location: { id: string; name: string };
  city: { id: string; name: string };
  day: string;
  timeRange: string;
  teamCount: number;
}

interface Team {
  id: string;
  name: string;
  code: string;
  shortName: string;
}

interface Week {
  weekNumber: number;
  weekType: "REGULAR" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  label: string;
  date: Date;
  isRegular: boolean;
  isPlayoff: boolean;
  isComplete: boolean;
  isCurrent: boolean;
  games: Array<{
    id: string;
    gameName: string;
    time: string;
    homeTeam: {
      id: string;
      name: string;
      code: string;
    };
    awayTeam: {
      id: string;
      name: string;
      code: string;
    };
    published: boolean;
    status: boolean;
  }>;
}

interface DivisionSchedule {
  division: Division;
  teams: Team[];
  weeks: Week[];
  currentWeek: number;
  totalWeeks: number;
}

interface TeamScheduleCount {
  teamId: string;
  teamCode: string;
  gameCount: number;
}

export default function DivisionSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const divisionId = params.divisionId as string;

  const [schedule, setSchedule] = useState<DivisionSchedule | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [teamCounts, setTeamCounts] = useState<TeamScheduleCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    gameId: string;
    gameName: string;
    isPublished: boolean;
    isCompleted: boolean;
  }>({
    open: false,
    gameId: "",
    gameName: "",
    isPublished: false,
    isCompleted: false,
  });

  useEffect(() => {
    fetchDivisionSchedule();
  }, [divisionId]);

  useEffect(() => {
    if (schedule) {
      fetchTeamCounts(selectedWeek);
    }
  }, [selectedWeek, schedule]);

  // Fetch division schedule
  const fetchDivisionSchedule = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/games/divisions/${divisionId}`);
      if (!response.ok) throw new Error("Failed to fetch schedule");

      const data = await response.json();

      // Convert date strings to Date objects
      const weeksWithDates = data.weeks.map((week: any) => ({
        ...week,
        date: new Date(week.date),
      }));

      setSchedule({
        ...data,
        weeks: weeksWithDates,
      });

      // Set initial selected week to current week
      setSelectedWeek(data.currentWeek);
    } catch (error) {
      console.error("Error fetching division schedule:", error);
      toast.error("Failed to load division schedule");
    } finally {
      setLoading(false);
    }
  };

  // Fetch team game counts for selected week
  const fetchTeamCounts = async (week: number) => {
    try {
      const response = await fetch(
        `/api/v1/games/week?divisionId=${divisionId}&week=${week}`
      );
      if (!response.ok) throw new Error("Failed to fetch team counts");

      const data = await response.json();
      setTeamCounts(data.teamCounts || []);
    } catch (error) {
      console.error("Error fetching team counts:", error);
    }
  };

  // Save games for a week
  const handleSaveGames = async (games: any[]) => {
    try {
      setSaving(true);

      const selectedWeekData = schedule?.weeks.find(
        (w) => w.weekNumber === selectedWeek
      );

      if (!selectedWeekData) throw new Error("Week not found");

      // Prepare games data
      const gamesData = games.map((game) => ({
        gameName: game.gameName,
        date: selectedWeekData.date.toISOString(),
        time: game.time,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        published: true, // Publish by default
      }));

      // Create games
      const response = await fetch("/api/v1/games/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          divisionId,
          week: selectedWeek,
          weekType: selectedWeekData.weekType,
          games: gamesData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save games");
      }

      toast.success(`Successfully saved ${games.length} game(s)`);

      // Refresh schedule
      await fetchDivisionSchedule();
    } catch (error: any) {
      console.error("Error saving games:", error);
      toast.error(error.message || "Failed to save games");
    } finally {
      setSaving(false);
    }
  };

  // Delete game
  const handleDeleteGame = async () => {
    try {
      const response = await fetch(`/api/v1/games/${deleteDialog.gameId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete game");
      }

      toast.success("Game deleted successfully");

      // Refresh schedule
      await fetchDivisionSchedule();
      setDeleteDialog({ ...deleteDialog, open: false });
    } catch (error: any) {
      console.error("Error deleting game:", error);
      toast.error(error.message || "Failed to delete game");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    // Just refresh to reset any changes
    fetchDivisionSchedule();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-4">Division not found</p>
        <Link href="/admin/games">
          <Button variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
        </Link>
      </div>
    );
  }

  const currentWeekData = schedule.weeks.find(
    (w) => w.weekNumber === selectedWeek
  );

  // Get regular season weeks count
  const regularSeasonWeeks = schedule.weeks.filter((w) => w.isRegular).length;

  return (
    <div className="h-screen flex flex-col">
      {/* Top Header */}
      <div className="border-b bg-white px-6 py-4">
        <Link
          href="/admin/games"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-3"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Schedule Overview
        </Link>

        <div>
          <h1 className="text-2xl font-bold">{schedule.division.name}</h1>
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {schedule.division.location.name}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {schedule.division.day}s
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {schedule.division.timeRange}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {schedule.division.teamCount} teams
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Week Sidebar */}
        <WeekSidebar
          weeks={schedule.weeks}
          selectedWeek={selectedWeek}
          onWeekSelect={setSelectedWeek}
          regularSeasonWeeks={regularSeasonWeeks}
        />

        {/* Week Schedule View */}
        {currentWeekData && (
          <WeekScheduleView
            weekNumber={currentWeekData.weekNumber}
            weekType={currentWeekData.weekType}
            weekLabel={currentWeekData.label}
            weekDate={currentWeekData.date}
            locationName={schedule.division.location.name}
            games={currentWeekData.games.map((g) => ({
              id: g.id,
              gameName: g.gameName,
              time: g.time,
              homeTeam: g.homeTeam.id,
              awayTeam: g.awayTeam.id,
              published: g.published,
            }))}
            teams={schedule.teams}
            teamCounts={teamCounts}
            onSave={handleSaveGames}
            onCancel={handleCancel}
          />
        )}
      </div>

      {/* Delete Game Dialog */}
      <DeleteGameDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteGame}
        gameName={deleteDialog.gameName}
        isPublished={deleteDialog.isPublished}
        isCompleted={deleteDialog.isCompleted}
      />
    </div>
  );
}
